import { useLanguage } from "@/contexts/LanguageContext";
import {
    CATEGORIES_ORDERED,
    getCategoryMeta,
    type CategoryKey,
} from "@/lib/categories";
import { cn } from "@/lib/utils";

interface CategoryPickerProps {
    value?: CategoryKey;
    onChange: (next: CategoryKey) => void;
    disabled?: boolean;
    className?: string;
    /**
     * - "default": labeled grid (used inside modals).
     * - "compact": icon-only chips on one row, fits next to inputs.
     */
    variant?: "default" | "compact";
}

const CategoryPicker = ({
    value,
    onChange,
    disabled,
    className,
    variant = "default",
}: CategoryPickerProps) => {
    const { t } = useLanguage();
    const current = getCategoryMeta(value).key;

    if (variant === "compact") {
        // 4 cols on mobile (2 rows of 4) so labels stay readable on narrow
        // screens; 8 cols at sm+ so the picker collapses to a single row when
        // it sits next to an input in a wider layout.
        return (
            <div
                role="radiogroup"
                aria-label={t("selectCategory")}
                className={cn(
                    "grid grid-cols-4 sm:grid-cols-8 gap-1.5",
                    className
                )}
            >
                {CATEGORIES_ORDERED.map((meta) => {
                    const Icon = meta.icon;
                    const selected = meta.key === current;
                    return (
                        <button
                            key={meta.key}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            disabled={disabled}
                            onClick={() => onChange(meta.key)}
                            title={t(meta.labelKey)}
                            className={cn(
                                "flex flex-col items-center justify-start gap-1 px-1 py-1.5 rounded-lg border transition-all min-w-0",
                                selected
                                    ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                                    : "border-border hover:border-primary/40 hover:bg-muted/50",
                                disabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <span
                                className={cn(
                                    "inline-flex items-center justify-center w-7 h-7 rounded-full flex-shrink-0",
                                    meta.bg
                                )}
                            >
                                <Icon className={cn("w-3.5 h-3.5", meta.text)} />
                            </span>
                            <span className="text-[10px] font-medium text-foreground text-center leading-[1.15] break-words w-full">
                                {t(meta.labelKey)}
                            </span>
                        </button>
                    );
                })}
            </div>
        );
    }

    // Default variant is sized for modal dialogs (~280-500px wide). Stays at
    // 4 columns regardless of viewport so each chip has room for a sensible
    // icon + label — wider responsive grids belong in the compact variant.
    return (
        <div
            role="radiogroup"
            aria-label={t("selectCategory")}
            className={cn("grid grid-cols-4 gap-2", className)}
        >
            {CATEGORIES_ORDERED.map((meta) => {
                const Icon = meta.icon;
                const selected = meta.key === current;
                return (
                    <button
                        key={meta.key}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        disabled={disabled}
                        onClick={() => onChange(meta.key)}
                        title={t(meta.labelKey)}
                        className={cn(
                            "group flex flex-col items-center gap-1.5 px-2 py-3 rounded-lg border transition-all",
                            selected
                                ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                                : "border-border hover:border-primary/40 hover:bg-muted/50",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        <span
                            className={cn(
                                "inline-flex items-center justify-center w-10 h-10 rounded-full",
                                meta.bg
                            )}
                        >
                            <Icon className={cn("w-5 h-5", meta.text)} />
                        </span>
                        <span className="text-xs font-medium text-foreground text-center leading-tight">
                            {t(meta.labelKey)}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default CategoryPicker;
