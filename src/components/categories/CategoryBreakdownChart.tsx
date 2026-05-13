import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryMeta, type CategoryKey } from "@/lib/categories";
import {
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";

export interface CategoryBreakdownRow {
    category: CategoryKey | string;
    total: number;
    count: number;
    percentage: number;
}

interface CategoryBreakdownChartProps {
    data: CategoryBreakdownRow[];
    /** Currency formatter — pass the locale-aware fn from the parent. */
    formatAmount: (n: number) => string;
    /** Optional center label, e.g. the total amount. */
    centerLabel?: { primary: string; secondary?: string };
    height?: number;
}

interface TooltipRenderProps {
    active?: boolean;
    payload?: ReadonlyArray<{ payload?: unknown }>;
}

const renderTooltip = (
    formatAmount: (n: number) => string,
    labelFor: (k: string) => string
) => {
    const TooltipContent = ({ active, payload }: TooltipRenderProps) => {
        if (!active || !payload?.length) return null;
        const row = payload[0].payload as CategoryBreakdownRow | undefined;
        if (!row) return null;
        return (
            <div className="relative z-50 rounded-lg border border-border bg-popover px-3 py-2 shadow-xl text-xs">
                <div className="font-medium text-foreground">
                    {labelFor(row.category as string)}
                </div>
                <div className="text-muted-foreground">
                    {formatAmount(row.total)} · {row.percentage}%
                </div>
            </div>
        );
    };
    return TooltipContent;
};

/**
 * Donut chart of category totals + a small legend list to its right.
 * Falls back to an empty-state when `data` is empty.
 */
const CategoryBreakdownChart = ({
    data,
    formatAmount,
    centerLabel,
    height = 200,
}: CategoryBreakdownChartProps) => {
    const { t } = useLanguage();
    const labelFor = (key: string) => t(getCategoryMeta(key).labelKey);

    if (!data.length) {
        return (
            <div
                className="flex items-center justify-center text-sm text-muted-foreground"
                style={{ height }}
            >
                {t("noCategoryData")}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center sm:gap-8">
            <div
                className="relative z-10 flex-shrink-0 overflow-visible"
                style={{ width: height, height }}
            >
                <ResponsiveContainer>
                    <PieChart margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
                        <Pie
                            data={data}
                            dataKey="total"
                            nameKey="category"
                            innerRadius="62%"
                            outerRadius="92%"
                            paddingAngle={2}
                            stroke="hsl(var(--background))"
                            strokeWidth={3}
                        >
                            {data.map((row) => (
                                <Cell
                                    key={row.category}
                                    fill={getCategoryMeta(row.category).chartColor}
                                />
                            ))}
                        </Pie>
                        <Tooltip
                            allowEscapeViewBox={{ x: true, y: true }}
                            content={renderTooltip(formatAmount, labelFor)}
                            wrapperStyle={{
                                zIndex: 50,
                                outline: "none",
                                pointerEvents: "none",
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {centerLabel && (
                    <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-base sm:text-lg font-bold text-foreground leading-tight">
                            {centerLabel.primary}
                        </span>
                        {centerLabel.secondary && (
                            <span className="text-[11px] text-muted-foreground mt-0.5">
                                {centerLabel.secondary}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/*
              Grid keeps the three columns aligned (label / amount / pct) while
              letting the whole legend size to its own content. No flex-1 means
              amounts stay close to their label instead of being pushed to the
              far right of the card.
            */}
            <ul className="grid w-full max-w-[18rem] grid-cols-[1fr_auto_auto] items-center gap-x-4 gap-y-2 text-sm sm:w-auto sm:max-w-sm">
                {data.map((row) => {
                    const meta = getCategoryMeta(row.category);
                    return (
                        <li
                            key={row.category}
                            className="contents"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <span
                                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: meta.chartColor }}
                                />
                                <span className="truncate text-foreground">
                                    {labelFor(row.category as string)}
                                </span>
                            </div>
                            <span className="font-semibold text-foreground tabular-nums whitespace-nowrap text-right">
                                {formatAmount(row.total)}
                            </span>
                            <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                                {row.percentage}%
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default CategoryBreakdownChart;
