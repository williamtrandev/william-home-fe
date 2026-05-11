import {
    UtensilsCrossed,
    ShoppingCart,
    Home,
    Tag,
    type LucideIcon,
} from "lucide-react";

/**
 * Fixed enum kept in sync with the backend (william-home-be/src/models/Expense.js).
 * Adding/removing a category requires changes in both places.
 *
 * Order matters: this is the order the picker and the legend render in.
 */
export const CATEGORY_KEYS = [
    "FOOD",
    "GROCERIES",
    "RENT",
    "OTHER",
] as const;

export type CategoryKey = (typeof CATEGORY_KEYS)[number];

export interface CategoryMeta {
    key: CategoryKey;
    /** Translation key for the localized display label. */
    labelKey: string;
    icon: LucideIcon;
    /**
     * Tailwind utility colour for the icon container (light) + its dark mode
     * variant. Pair with `text-{color}-600 dark:text-{color}-300` for the icon.
     */
    bg: string;
    text: string;
    /** Hex used for chart slices — Tailwind class names don't reach Recharts. */
    chartColor: string;
    /** Quick-input keywords (lowercase, no diacritics) that hint this category. */
    keywords: string[];
}

export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
    FOOD: {
        key: "FOOD",
        labelKey: "categoryFood",
        icon: UtensilsCrossed,
        bg: "bg-orange-100 dark:bg-orange-950/40",
        text: "text-orange-600 dark:text-orange-300",
        chartColor: "#f97316",
        keywords: [
            "food",
            "lunch",
            "dinner",
            "breakfast",
            "coffee",
            "cafe",
            "an",
            "an uong",
            "ca phe",
            "com",
            "pho",
            "tra",
        ],
    },
    GROCERIES: {
        key: "GROCERIES",
        labelKey: "categoryGroceries",
        icon: ShoppingCart,
        bg: "bg-emerald-100 dark:bg-emerald-950/40",
        text: "text-emerald-600 dark:text-emerald-300",
        chartColor: "#10b981",
        keywords: [
            "grocery",
            "groceries",
            "market",
            "supermarket",
            "cho",
            "di cho",
            "sieu thi",
        ],
    },
    RENT: {
        key: "RENT",
        labelKey: "categoryRent",
        icon: Home,
        bg: "bg-blue-100 dark:bg-blue-950/40",
        text: "text-blue-600 dark:text-blue-300",
        chartColor: "#3b82f6",
        keywords: ["rent", "tien nha", "thue nha", "housing"],
    },
    OTHER: {
        key: "OTHER",
        labelKey: "categoryOther",
        icon: Tag,
        bg: "bg-slate-100 dark:bg-slate-800/60",
        text: "text-slate-600 dark:text-slate-300",
        chartColor: "#64748b",
        keywords: [],
    },
};

/** Ordered list — useful for selectors/legends so the order is deterministic. */
export const CATEGORIES_ORDERED: CategoryMeta[] = CATEGORY_KEYS.map(
    (k) => CATEGORIES[k]
);

export const isKnownCategory = (key?: string | null): key is CategoryKey =>
    !!key && (CATEGORY_KEYS as readonly string[]).includes(key);

export const getCategoryMeta = (key?: string | null): CategoryMeta => {
    if (isKnownCategory(key)) return CATEGORIES[key];
    return CATEGORIES.OTHER;
};

/**
 * Strip Vietnamese diacritics so keyword matching like "cà phê" → "ca phe" works.
 */
const stripDiacritics = (s: string) =>
    s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D");

/**
 * Best-effort category inference from free-text purpose. Returns OTHER when
 * nothing matches, so the caller can always rely on a definite value.
 */
export const inferCategoryFromText = (text: string): CategoryKey => {
    if (!text) return "OTHER";
    const haystack = stripDiacritics(text.toLowerCase());
    for (const meta of CATEGORIES_ORDERED) {
        for (const kw of meta.keywords) {
            if (
                haystack === kw ||
                haystack.startsWith(`${kw} `) ||
                haystack.endsWith(` ${kw}`) ||
                haystack.includes(` ${kw} `)
            ) {
                return meta.key;
            }
        }
    }
    return "OTHER";
};

interface BreakdownRowLike {
    category: string;
    total: number;
    count: number;
    percentage: number;
}

/**
 * Collapse any unknown/legacy category keys into a single OTHER row so the
 * donut chart and legend never show ghost slices for categories we no longer
 * support. Percentages are preserved (server already computed them against
 * the same total), so the merged OTHER row sums all contributing slices.
 */
export const normalizeBreakdown = <T extends BreakdownRowLike>(
    rows: T[] | undefined
): T[] => {
    if (!rows?.length) return [];
    const map = new Map<CategoryKey, T>();

    for (const row of rows) {
        const key: CategoryKey = isKnownCategory(row.category)
            ? row.category
            : "OTHER";
        const existing = map.get(key);
        if (existing) {
            existing.total += row.total;
            existing.count += row.count;
            existing.percentage = Number(
                (existing.percentage + row.percentage).toFixed(1)
            );
        } else {
            map.set(key, { ...row, category: key });
        }
    }

    // Render in the canonical CATEGORY_KEYS order, hiding buckets with no data.
    return CATEGORY_KEYS.map((k) => map.get(k)).filter(
        (r): r is T => !!r && r.total > 0
    );
};
