import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    TrendingUp,
    TrendingDown,
    Wallet,
    CreditCard,
    Target,
    Calculator,
    PieChart as PieChartIcon,
    ImagePlus,
    X,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import ExpenseForm from "@/components/ExpenseForm";
import { Expense } from "@/types/expense";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import ExpenseList from "@/components/expenses/ExpenseList";
import CategoryBreakdownChart from "@/components/categories/CategoryBreakdownChart";
import CategoryPicker from "@/components/categories/CategoryPicker";
import {
    expenseService,
    MAX_ATTACHMENTS_PER_EXPENSE,
} from "@/services/expense.service";
import type { CategoryBreakdownRow } from "@/services/expense.service";
import {
    inferCategoryFromText,
    normalizeBreakdown,
    type CategoryKey,
} from "@/lib/categories";
import {
    IMAGE_FILE_ACCEPT,
    MAX_IMAGE_FILE_BYTES,
    isAllowedImageFile,
} from "@/lib/image-files";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNotificationListener } from "@/hooks/useNotificationListener";
import VietQrCard from "@/components/payments/VietQrCard";
import type { BankAccount } from "@/services/auth.service";

interface GrowthStats {
    totalAmountGrowth: string;
    totalExpensesGrowth: string;
    avgExpenseGrowth: string;
    avgPerPersonGrowth: string;
}

interface Stats {
    totalAmount: number;
    totalExpenses: number;
    avgExpense: number;
    avgPerPerson: number;
    memberCount: number;
    growthStats: GrowthStats;
    byCategory?: CategoryBreakdownRow[];
}

interface PaymentResult {
    totalAmount: number;
    totalExpenses: number;
    avgExpense: number;
    avgPerPerson: number;
    amountPerPerson: Array<{
        user: {
            _id: string;
            email: string;
            name: string;
            picture: string;
            bankAccount?: BankAccount;
        };
        amount: number;
    }>;
    transactions: Array<{
        from: {
            _id: string;
            email: string;
            name: string;
            picture: string;
            bankAccount?: BankAccount;
        };
        to: {
            _id: string;
            email: string;
            name: string;
            picture: string;
            bankAccount?: BankAccount;
        };
        amount: number;
    }>;
    createdAt?: string;
}

const Dashboard = () => {
    const { t } = useLanguage();
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [quickInput, setQuickInput] = useState("");
    // null = follow keyword inference; explicit value = user overrode the picker.
    // Reset back to null after each successful submit so inference resumes.
    const [quickCategory, setQuickCategory] = useState<CategoryKey | null>(null);
    // Receipts the user has picked but not yet uploaded — they're attached to
    // the new expense in a second call after createExpense returns the id.
    const [pendingReceipts, setPendingReceipts] = useState<File[]>([]);
    const receiptInputRef = useRef<HTMLInputElement>(null);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [paymentResults, setPaymentResults] = useState<PaymentResult | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const [stats, setStats] = useState<Stats>({
        totalAmount: 0,
        totalExpenses: 0,
        avgExpense: 0,
        avgPerPerson: 0,
        memberCount: 0,
        growthStats: {
            totalAmountGrowth: "0",
            totalExpensesGrowth: "0",
            avgExpenseGrowth: "0",
            avgPerPersonGrowth: "0",
        },
    });
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const fetchStats = async () => {
        try {
            const response = await expenseService.getStatistics();
            setStats(response);
        } catch (error) {
            console.error("Error fetching statistics:", error);
            toast.error(t("statsFetchFailed"));
        }
    };

    const formatAmount = (n: number) =>
        `${Math.round(n).toLocaleString("vi-VN")}₫`;

    const formatSettlementQrDate = (date?: string) =>
        new Intl.DateTimeFormat("vi-VN").format(
            date ? new Date(date) : new Date()
        );

    const buildSettlementQrDescription = (
        fromName: string,
        toName: string,
        date?: string
    ) =>
        t("settlementQrContent")
            .replace("{from}", fromName)
            .replace("{to}", toName)
            .replace("{date}", formatSettlementQrDate(date));

    useNotificationListener(() => {
        fetchStats();
    });

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleExpenseSubmit = (expense: Expense) => {
        if (editingExpense) {
            setExpenses(
                expenses.map((e) => (e.id === expense.id ? expense : e))
            );
            setEditingExpense(null);
        } else {
            setExpenses([...expenses, expense]);
        }
        setShowExpenseForm(false);
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpense(expense);
        setShowExpenseForm(true);
    };

    const handleDeleteExpense = (id: string) => {
        setExpenses(expenses.filter((e) => e.id !== id));
    };

    const totalExpenses = expenses.reduce(
        (total, expense) => total + expense.amount,
        0
    );

    const handleQuickInput = (value: string) => {
        setQuickInput(value);
    };

    // Category shown in the picker = manual override, or the inferred one when
    // the user hasn't touched it. Recompute on every keystroke.
    const effectiveQuickCategory: CategoryKey = useMemo(() => {
        if (quickCategory) return quickCategory;
        const parsed = expenseService.parseQuickInput(quickInput);
        if (parsed) return parsed.category;
        return inferCategoryFromText(quickInput);
    }, [quickInput, quickCategory]);

    // Local thumbnail previews for the pending receipts. Object URLs are
    // generated lazily on selection and revoked when the file is removed or
    // the form clears so we don't leak blobs.
    const pendingPreviews = useMemo(
        () => pendingReceipts.map((f) => URL.createObjectURL(f)),
        [pendingReceipts]
    );

    useEffect(() => {
        return () => {
            pendingPreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [pendingPreviews]);

    const handlePickReceipts = (e: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(e.target.files || []);
        // Reset immediately so the same file can be re-picked after removal.
        e.target.value = "";
        if (!picked.length) return;

        const remaining = MAX_ATTACHMENTS_PER_EXPENSE - pendingReceipts.length;
        if (picked.length > remaining) {
            toast.error(t("attachmentLimitReached"));
            return;
        }
        for (const f of picked) {
            if (!isAllowedImageFile(f)) {
                toast.error(t("attachmentTypeUnsupported"));
                return;
            }
            if (f.size > MAX_IMAGE_FILE_BYTES) {
                toast.error(t("attachmentTooLarge"));
                return;
            }
        }
        setPendingReceipts((prev) => [...prev, ...picked]);
    };

    const removePendingReceipt = (idx: number) => {
        setPendingReceipts((prev) => prev.filter((_, i) => i !== idx));
    };

    const submitQuickInput = async () => {
        // Distinguish "nothing typed" from "typed but unparseable" so the
        // toast tells the user what to do, not just that something failed.
        if (!quickInput.trim()) {
            toast.error(t("quickInputEmpty"));
            return;
        }
        const parsed = expenseService.parseQuickInput(quickInput);
        if (!parsed) {
            toast.error(t("quickInputInvalid"));
            return;
        }
        try {
            setIsLoading(true);
            const created = await expenseService.createExpense({
                amount: parsed.amount,
                purpose: parsed.purpose,
                // Manual override wins over keyword inference.
                category: quickCategory ?? parsed.category,
            });

            // If the user picked receipts, attach them to the new expense in
            // a follow-up call. Failure here doesn't undo the expense — the
            // user can reopen the row and try again from the edit dialog.
            if (pendingReceipts.length && created?._id) {
                try {
                    await expenseService.uploadAttachments(
                        created._id,
                        pendingReceipts
                    );
                } catch (uploadErr) {
                    console.error("Receipt upload failed:", uploadErr);
                    toast.error(t("attachmentUploadFailed"));
                }
            }

            toast.success(t("expenseCreated"));
            setQuickInput("");
            setQuickCategory(null);
            setPendingReceipts([]);
            setRefetchTrigger((prev) => prev + 1);
            await fetchStats();
        } catch (error) {
            console.error("Error creating expense:", error);
            toast.error(t("expenseCreateFailed"));
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickInputKeyPress = async (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter") {
            await submitQuickInput();
        }
    };

    const handleCalculatePayment = async () => {
        setShowConfirmationDialog(true);
    };

    const confirmCalculation = async () => {
        try {
            setIsLoading(true);
            const results = await expenseService.calculatePayments();
            setPaymentResults(results);
            setShowConfirmationDialog(false);
            setShowPaymentDialog(true);
            toast.success(t("paymentNotification"));
        } catch (error) {
            console.error("Error calculating payments:", error);
            toast.error(t("calculationFailed"));
        } finally {
            setIsLoading(false);
        }
    };

    const formatGrowth = (growth: string) => {
        if (growth === "+inf") return { value: "∞", isPositive: true };
        if (growth === "-inf") return { value: "∞", isPositive: false };

        const isPositive = growth.startsWith("+");
        const value = growth.replace("+", "").replace("-", "");
        return { value, isPositive };
    };

    const statsCards = [
        {
            title: t("total"),
            value: `${(stats.totalAmount || 0).toLocaleString("vi-VN")}₫`,
            icon: Wallet,
            iconColor: "text-blue-600 dark:text-blue-400",
            iconBg: "bg-blue-100 dark:bg-blue-950/50",
            accent: "bg-blue-500",
            growth: stats.growthStats?.totalAmountGrowth,
        },
        {
            title: t("avgSpending"),
            value: `${Math.round(stats.avgExpense || 0).toLocaleString(
                "vi-VN"
            )}₫`,
            icon: TrendingUp,
            iconColor: "text-emerald-600 dark:text-emerald-400",
            iconBg: "bg-emerald-100 dark:bg-emerald-950/50",
            accent: "bg-emerald-500",
            growth: stats.growthStats?.avgExpenseGrowth,
        },
        {
            title: t("transactions"),
            value: (stats.totalExpenses || 0).toString(),
            icon: CreditCard,
            iconColor: "text-violet-600 dark:text-violet-400",
            iconBg: "bg-violet-100 dark:bg-violet-950/50",
            accent: "bg-violet-500",
            growth: stats.growthStats?.totalExpensesGrowth,
        },
        {
            title: t("perCapita"),
            value: `${Math.round(stats.avgPerPerson || 0).toLocaleString(
                "vi-VN"
            )}₫`,
            icon: Target,
            iconColor: "text-amber-600 dark:text-amber-400",
            iconBg: "bg-amber-100 dark:bg-amber-950/50",
            accent: "bg-amber-500",
            growth: stats.growthStats?.avgPerPersonGrowth,
        },
    ];

    const renderMobilePaymentResults = () => (
        <div className="space-y-4">
            {/* Summary */}
            <div className="space-y-2">
                <div className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                    <span className="text-sm text-muted-foreground">
                        {t("totalExpenses")}
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {paymentResults?.totalAmount?.toLocaleString("vi-VN")}₫
                    </span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                    <span className="text-sm text-muted-foreground">
                        {t("averageExpense")}
                    </span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {paymentResults?.avgExpense?.toLocaleString("vi-VN")}₫
                    </span>
                </div>
            </div>

            {/* Amount Per Person */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground px-1">
                    {t("amountPerPerson")}
                </h3>
                {paymentResults?.amountPerPerson?.map((item) => (
                    <div
                        key={item.user._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50"
                    >
                        <div className="flex items-center gap-2">
                            <Avatar>
                                <AvatarImage
                                    className="rounded-full object-cover"
                                    src={item.user.picture}
                                />
                                <AvatarFallback>
                                    {item.user.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium truncate max-w-[120px]">
                                {item.user.name}
                            </span>
                        </div>
                        <span
                            className={`font-semibold text-sm ${
                                item.amount > 0
                                    ? "text-red-600"
                                    : item.amount < 0
                                    ? "text-green-600"
                                    : "text-gray-600"
                            }`}
                        >
                            {item.amount > 0
                                ? `+${item.amount.toLocaleString("vi-VN")}₫`
                                : `${item.amount.toLocaleString("vi-VN")}₫`}
                        </span>
                    </div>
                ))}
            </div>

            {/* Transactions */}
            <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground px-1">
                    {t("transactions")}
                </h3>
                {paymentResults?.transactions?.map((transaction, index) => (
                    <div
                        key={index}
                        className="p-3 rounded-lg bg-background/50 border border-border/50"
                    >
                        {/* From */}
                        <div className="flex items-center gap-2 mb-2">
                            <div className="relative">
                                <Avatar className="border-2 border-red-500">
                                    <AvatarImage
                                        className="rounded-full object-cover"
                                        src={transaction.from.picture}
                                    />
                                    <AvatarFallback>
                                        {transaction.from.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-[10px] text-white">
                                        -
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                    {transaction.from.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {t("needsToPay")}
                                </div>
                            </div>
                        </div>

                        {/* Amount */}
                        <div className="flex justify-center my-2">
                            <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/30">
                                {transaction.amount.toLocaleString("vi-VN")}₫
                            </div>
                        </div>

                        {/* To */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Avatar className="border-2 border-green-500">
                                    <AvatarImage
                                        className="rounded-full object-cover"
                                        src={transaction.to.picture}
                                    />
                                    <AvatarFallback>
                                        {transaction.to.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-[10px] text-white">
                                        +
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">
                                    {transaction.to.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {t("willReceive")}
                                </div>
                            </div>
                        </div>
                        <VietQrCard
                            bankAccount={transaction.to.bankAccount}
                            amount={transaction.amount}
                            description={buildSettlementQrDescription(
                                transaction.from.name,
                                transaction.to.name,
                                paymentResults?.createdAt
                            )}
                            recipientName={transaction.to.name}
                        />
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        {t("currentMonth")}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t("trackExpenses")}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-start">
                    <div className="flex flex-col gap-2 w-full sm:w-[400px]">
                        <div className="flex gap-2">
                            <Input
                                placeholder={t("quickInputPlaceholder")}
                                value={quickInput}
                                onChange={(e) =>
                                    handleQuickInput(e.target.value)
                                }
                                onKeyPress={handleQuickInputKeyPress}
                                disabled={isLoading}
                                className="flex-1 text-base"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                data-file-picker-trigger
                                onClick={() => receiptInputRef.current?.click()}
                                disabled={
                                    isLoading ||
                                    pendingReceipts.length >=
                                        MAX_ATTACHMENTS_PER_EXPENSE
                                }
                                title={t("addReceipt")}
                                aria-label={t("addReceipt")}
                                className="relative"
                            >
                                <ImagePlus className="w-4 h-4" />
                                {pendingReceipts.length > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                                        {pendingReceipts.length}
                                    </span>
                                )}
                            </Button>
                            <Button
                                onClick={submitQuickInput}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                        <input
                            ref={receiptInputRef}
                            type="file"
                            accept={IMAGE_FILE_ACCEPT}
                            multiple
                            className="sr-only"
                            tabIndex={-1}
                            aria-hidden
                            onChange={handlePickReceipts}
                        />
                        {pendingReceipts.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {pendingReceipts.map((file, idx) => (
                                    <div
                                        key={`${file.name}-${idx}`}
                                        className="relative w-12 h-12 rounded-md overflow-hidden border border-border bg-muted"
                                    >
                                        <img
                                            src={pendingPreviews[idx]}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removePendingReceipt(idx)
                                            }
                                            disabled={isLoading}
                                            aria-label={t("removeReceipt")}
                                            className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-black/70 hover:bg-black text-white"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <CategoryPicker
                            variant="compact"
                            value={effectiveQuickCategory}
                            onChange={setQuickCategory}
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        onClick={handleCalculatePayment}
                        className="w-full sm:w-auto"
                    >
                        <Calculator className="w-4 h-4 mr-2" />
                        {t("calculatePayment")}
                    </Button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {statsCards.map((stat, index) => {
                    const { value, isPositive } = formatGrowth(
                        stat.growth || "0"
                    );
                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08, duration: 0.35 }}
                            whileHover={{ y: -2 }}
                            className="group"
                        >
                            <Card className="relative overflow-hidden border border-border shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
                                {/* Colored accent bar at the top */}
                                <div
                                    className={`absolute top-0 left-0 right-0 h-1 ${stat.accent}`}
                                />

                                <CardContent className="p-4 sm:p-5 pt-5 sm:pt-6">
                                    {/* Icon + Growth pill */}
                                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                                        <div
                                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${stat.iconBg} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}
                                        >
                                            <stat.icon
                                                className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`}
                                            />
                                        </div>

                                        <div
                                            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-semibold ${
                                                isPositive
                                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                                            }`}
                                        >
                                            {isPositive ? (
                                                <TrendingUp className="w-3 h-3" />
                                            ) : (
                                                <TrendingDown className="w-3 h-3" />
                                            )}
                                            <span>{value}%</span>
                                        </div>
                                    </div>

                                    {/* Title */}
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">
                                        {stat.title}
                                    </p>

                                    {/* Value */}
                                    <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight truncate">
                                        {stat.value}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Spending by Category */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <Card className="border border-border shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <PieChartIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            {t("spendingByCategory")}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            {t("spendingByCategoryDescription")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoryBreakdownChart
                            data={normalizeBreakdown(stats?.byCategory)}
                            formatAmount={formatAmount}
                            centerLabel={{
                                primary: formatAmount(stats?.totalAmount ?? 0),
                                secondary: t("totalAmount"),
                            }}
                            height={200}
                        />
                    </CardContent>
                </Card>
            </motion.div>

            {/* Recent Expenses */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="border border-border shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            {t("expenses")}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                            {t("recentExpenses")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ExpenseList
                            onUpdateExpense={() => {
                                fetchStats();
                            }}
                            refetchTrigger={refetchTrigger}
                        />
                    </CardContent>
                </Card>
            </motion.div>

            {/* Confirmation Dialog */}
            <Dialog
                open={showConfirmationDialog}
                onOpenChange={setShowConfirmationDialog}
            >
                <DialogContent className="w-[280px] sm:w-[400px] mx-auto rounded-lg">
                    <DialogHeader>
                        <DialogTitle className="text-center text-lg">
                            {t("confirmCalculation")}
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm">
                            {t("confirmCalculationDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center gap-3 mt-4">
                        <Button
                            onClick={confirmCalculation}
                            disabled={isLoading}
                            className="w-28 sm:w-32"
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {t("calculating")}
                                </div>
                            ) : (
                                <>
                                    <Calculator className="w-4 h-4 mr-2" />
                                    {t("confirm")}
                                </>
                            )}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmationDialog(false)}
                            disabled={isLoading}
                            className="w-28 sm:w-32"
                        >
                            {t("cancel")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Payment Results Dialog */}
            <Dialog
                open={showPaymentDialog}
                onOpenChange={setShowPaymentDialog}
            >
                <DialogContent className="w-[calc(100vw-1rem)] sm:w-full sm:max-w-2xl mx-auto rounded-xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-center text-lg">
                            {t("paymentCalculation")}
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm">
                            {t("paymentCalculationDescription")}
                        </DialogDescription>
                    </DialogHeader>

                    {isMobile ? (
                        renderMobilePaymentResults()
                    ) : (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <Card className="border border-border shadow-sm bg-blue-50 dark:bg-card">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            {t("totalExpenses")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold text-blue-600">
                                            {paymentResults?.totalAmount?.toLocaleString(
                                                "vi-VN"
                                            )}
                                            ₫
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card className="border border-border shadow-sm bg-green-50 dark:bg-card">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm font-medium text-muted-foreground">
                                            {t("averageExpense")}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-xl font-bold text-green-600">
                                            {paymentResults?.avgExpense?.toLocaleString(
                                                "vi-VN"
                                            )}
                                            ₫
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Amount Per Person */}
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                                    {t("amountPerPerson")}
                                </h3>
                                <div className="space-y-3">
                                    {paymentResults?.amountPerPerson?.map(
                                        (item) => (
                                            <div
                                                key={item.user._id}
                                                className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover:bg-background/80 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage
                                                            className="rounded-full object-cover"
                                                            src={
                                                                item.user
                                                                    .picture
                                                            }
                                                        />
                                                        <AvatarFallback>
                                                            {item.user.name.charAt(
                                                                0
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-sm">
                                                            {item.user.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {item.user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span
                                                        className={`font-semibold text-sm ${
                                                            item.amount > 0
                                                                ? "text-red-600"
                                                                : item.amount <
                                                                  0
                                                                ? "text-green-600"
                                                                : "text-gray-600"
                                                        }`}
                                                    >
                                                        {item.amount > 0
                                                            ? `+${item.amount.toLocaleString(
                                                                  "vi-VN"
                                                              )}₫`
                                                            : `${item.amount.toLocaleString(
                                                                  "vi-VN"
                                                              )}₫`}
                                                    </span>
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.amount > 0
                                                            ? t("willReceive")
                                                            : item.amount < 0
                                                            ? t("needsToPay")
                                                            : ""}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            {/* Transactions */}
                            <div className="mt-6">
                                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                                    {t("transactions")}
                                </h3>
                                <div className="space-y-4">
                                    {paymentResults?.transactions?.map(
                                        (transaction, index) => (
                                            <div
                                                key={index}
                                                className="p-4 rounded-lg bg-background/50 border border-border/50 hover:bg-background/80 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <Avatar className="border-2 border-red-500">
                                                                <AvatarImage
                                                                    className="rounded-full object-cover"
                                                                    src={
                                                                        transaction
                                                                            .from
                                                                            .picture
                                                                    }
                                                                />
                                                                <AvatarFallback>
                                                                    {transaction.from.name.charAt(
                                                                        0
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                                                <span className="text-[10px] text-white">
                                                                    -
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium">
                                                                {
                                                                    transaction
                                                                        .from
                                                                        .name
                                                                }
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {t(
                                                                    "needsToPay"
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <div className="text-sm font-medium text-right">
                                                                {
                                                                    transaction
                                                                        .to.name
                                                                }
                                                            </div>
                                                            <div className="text-xs text-muted-foreground text-right">
                                                                {t(
                                                                    "willReceive"
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <Avatar className="border-2 border-green-500">
                                                                <AvatarImage
                                                                    className="rounded-full object-cover"
                                                                    src={
                                                                        transaction
                                                                            .to
                                                                            .picture
                                                                    }
                                                                />
                                                                <AvatarFallback>
                                                                    {transaction.to.name.charAt(
                                                                        0
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                                                <span className="text-[10px] text-white">
                                                                    +
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-center gap-2 mt-2">
                                                    <div className="h-px flex-1 bg-border/50"></div>
                                                    <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/30">
                                                        {transaction.amount.toLocaleString(
                                                            "vi-VN"
                                                        )}
                                                        ₫
                                                    </div>
                                                    <div className="h-px flex-1 bg-border/50"></div>
                                                </div>
                                                <VietQrCard
                                                    bankAccount={
                                                        transaction.to
                                                            .bankAccount
                                                    }
                                                    amount={transaction.amount}
                                                    description={buildSettlementQrDescription(
                                                        transaction.from.name,
                                                        transaction.to.name,
                                                        paymentResults?.createdAt
                                                    )}
                                                    recipientName={
                                                        transaction.to.name
                                                    }
                                                />
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Expense Form Dialog */}
            <ExpenseForm
                isOpen={showExpenseForm}
                onClose={() => {
                    setShowExpenseForm(false);
                    setEditingExpense(null);
                }}
                onSubmit={handleExpenseSubmit}
                editingExpense={editingExpense}
            />

        </div>
    );
};

export default Dashboard;
