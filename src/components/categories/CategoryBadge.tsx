import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryMeta } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
    category?: string | null;
    /** Compact = icon only with subtle bg circle. Default shows icon + label. */
    variant?: "default" | "compact" | "label";
    className?: string;
}

/**
 * Renders the category for an expense. Always falls back to OTHER if the
 * incoming value is missing/unknown, so the UI is never empty.
 */
const CategoryBadge = ({
    category,
    variant = "default",
    className,
}: CategoryBadgeProps) => {
    const { t } = useLanguage();
    const meta = getCategoryMeta(category);
    const Icon = meta.icon;
    const label = t(meta.labelKey);

    if (variant === "compact") {
        return (
            <span
                aria-label={label}
                title={label}
                className={cn(
                    "inline-flex items-center justify-center w-7 h-7 rounded-full",
                    meta.bg,
                    className
                )}
            >
                <Icon className={cn("w-3.5 h-3.5", meta.text)} />
            </span>
        );
    }

    if (variant === "label") {
        return (
            <span
                className={cn(
                    "text-xs font-medium",
                    meta.text,
                    className
                )}
            >
                {label}
            </span>
        );
    }

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                meta.bg,
                meta.text,
                className
            )}
        >
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
};

export default CategoryBadge;
