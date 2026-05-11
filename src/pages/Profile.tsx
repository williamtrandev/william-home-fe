import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { toast } from "sonner";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    Crown,
    PieChart as PieChartIcon,
    Scale,
    Wallet,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import {
    expenseService,
    type AnalyticsPeriod,
    type MyAnalytics,
} from "@/services/expense.service";
import CategoryBadge from "@/components/categories/CategoryBadge";
import CategoryBreakdownChart from "@/components/categories/CategoryBreakdownChart";
import { normalizeBreakdown } from "@/lib/categories";
import { cn } from "@/lib/utils";

const PERIODS: AnalyticsPeriod[] = ["currentMonth", "lastMonth", "allTime"];

const Profile = () => {
    const { t, language } = useLanguage();
    const { user: authUser } = useAuth();
    const userData = authService.getUser();

    const [period, setPeriod] = useState<AnalyticsPeriod>("currentMonth");
    const [analytics, setAnalytics] = useState<MyAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const formatAmount = useCallback(
        (n: number) => `${Math.round(n).toLocaleString("vi-VN")}₫`,
        []
    );

    const formatDate = useCallback(
        (iso: string) =>
            format(new Date(iso), "dd/MM/yyyy", {
                locale: language === "vi" ? vi : enUS,
            }),
        [language]
    );

    const fetchAnalytics = useCallback(
        async (next: AnalyticsPeriod) => {
            try {
                setIsLoading(true);
                const data = await expenseService.getMyAnalytics(next);
                setAnalytics(data);
            } catch (error) {
                console.error("Failed to load personal analytics:", error);
                toast.error(t("analyticsFetchFailed"));
            } finally {
                setIsLoading(false);
            }
        },
        [t]
    );

    useEffect(() => {
        fetchAnalytics(period);
    }, [period, fetchAnalytics]);

    const balanceState = useMemo(() => {
        const b = analytics?.balance ?? 0;
        if (b > 0) return "owed" as const;
        if (b < 0) return "owes" as const;
        return "even" as const;
    }, [analytics?.balance]);

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16 ring-2 ring-border">
                        <AvatarImage
                            src={userData?.picture}
                            alt={userData?.name}
                            className="object-cover w-full h-full"
                        />
                        <AvatarFallback className="text-xl">
                            {userData?.name?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                            {userData?.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {userData?.email}
                        </p>
                        <div className="mt-1">
                            <Badge
                                variant={
                                    authUser?.currentHouseRole === "OWNER"
                                        ? "default"
                                        : "secondary"
                                }
                                className="capitalize"
                            >
                                {authUser?.currentHouseRole === "OWNER" ? (
                                    <span className="flex items-center gap-1">
                                        <Crown className="w-3 h-3" />
                                        {t("owner")}
                                    </span>
                                ) : (
                                    t("member")
                                )}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Period selector */}
                <div className="inline-flex rounded-lg bg-muted p-1 self-start sm:self-auto">
                    {PERIODS.map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => setPeriod(p)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors",
                                period === p
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {t(
                                p === "currentMonth"
                                    ? "periodCurrentMonth"
                                    : p === "lastMonth"
                                    ? "periodLastMonth"
                                    : "periodAllTime"
                            )}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* Hero stats: total spent, share, balance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
            >
                <Card className="border border-border shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Wallet className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">
                                {t("totalSpentByMe")}
                            </span>
                        </div>
                        {isLoading ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <div className="text-2xl sm:text-3xl font-bold text-foreground">
                                {formatAmount(analytics?.totalSpent ?? 0)}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            {analytics?.myCount ?? 0} {t("expenses").toLowerCase()}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border border-border shadow-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            <Scale className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wide">
                                {t("yourShare")}
                            </span>
                        </div>
                        {isLoading ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <div className="text-2xl sm:text-3xl font-bold text-foreground">
                                {formatAmount(analytics?.share ?? 0)}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            {t("shareExplanation").replace(
                                "{count}",
                                String(analytics?.memberCount ?? 0)
                            )}
                        </p>
                    </CardContent>
                </Card>

                <Card
                    className={cn(
                        "border shadow-sm",
                        balanceState === "owed" &&
                            "border-emerald-200 dark:border-emerald-900",
                        balanceState === "owes" &&
                            "border-rose-200 dark:border-rose-900",
                        balanceState === "even" && "border-border"
                    )}
                >
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                            {balanceState === "owed" ? (
                                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                            ) : balanceState === "owes" ? (
                                <ArrowDownRight className="w-4 h-4 text-rose-600" />
                            ) : (
                                <BarChart3 className="w-4 h-4" />
                            )}
                            <span className="text-xs font-medium uppercase tracking-wide">
                                {t("yourBalance")}
                            </span>
                        </div>
                        {isLoading ? (
                            <Skeleton className="h-8 w-32" />
                        ) : (
                            <div
                                className={cn(
                                    "text-2xl sm:text-3xl font-bold",
                                    balanceState === "owed" &&
                                        "text-emerald-600 dark:text-emerald-400",
                                    balanceState === "owes" &&
                                        "text-rose-600 dark:text-rose-400",
                                    balanceState === "even" &&
                                        "text-foreground"
                                )}
                            >
                                {formatAmount(
                                    Math.abs(analytics?.balance ?? 0)
                                )}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                            {balanceState === "owed"
                                ? t("balanceOwedToYou")
                                : balanceState === "owes"
                                ? t("balanceYouOwe")
                                : t("balanceEven")}
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Category breakdown */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="border border-border shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            {t("mySpendingByCategory")}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            {t("mySpendingByCategoryDescription")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-48 w-full" />
                        ) : (
                            <CategoryBreakdownChart
                                data={normalizeBreakdown(
                                    analytics?.byCategory
                                )}
                                formatAmount={formatAmount}
                                centerLabel={{
                                    primary: formatAmount(
                                        analytics?.totalSpent ?? 0
                                    ),
                                    secondary: t("totalSpentByMe"),
                                }}
                                height={220}
                            />
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* My recent expenses */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="border border-border shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base sm:text-lg">
                            {t("myRecentExpenses")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="space-y-2">
                                {[...Array(3)].map((_, i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : analytics?.recent.length ? (
                            <ul className="divide-y divide-border">
                                {analytics.recent.map((e) => (
                                    <li
                                        key={e._id}
                                        className="flex items-center justify-between py-3 gap-3"
                                    >
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <CategoryBadge
                                                category={e.category}
                                                variant="compact"
                                            />
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-foreground truncate">
                                                    {e.purpose}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatDate(e.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-semibold text-foreground tabular-nums flex-shrink-0">
                                            {formatAmount(e.amount)}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-6">
                                {t("noExpenses")}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

        </div>
    );
};

export default Profile;
