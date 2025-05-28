import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    TrendingUp,
    TrendingDown,
    Wallet,
    CreditCard,
    Target,
    Calculator,
    Calendar,
    User,
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
import { expenseService } from "@/services/expense.service";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import AvatarSelectorModal from "@/components/auth/AvatarSelectorModal";

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
}

const Dashboard = () => {
    const { t } = useLanguage();
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    const [quickInput, setQuickInput] = useState("");
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [paymentResults, setPaymentResults] = useState<
        Record<string, number>
    >({});
    const [isLoading, setIsLoading] = useState(false);
    const [refetchTrigger, setRefetchTrigger] = useState(0);
    const { user, setUser } = useAuth();
    const [showAvatarModal, setShowAvatarModal] = useState(false);
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

    useEffect(() => {
        // Check if user has avatar
        if (user && !user.picture) {
            console.log("User has no avatar:", user); // Debug log
            setShowAvatarModal(true);
        } else {
            console.log("User has avatar:", user); // Debug log
            setShowAvatarModal(false);
        }
    }, [user]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await expenseService.getStatistics();
                setStats(response);
            } catch (error) {
                console.error("Error fetching statistics:", error);
                toast.error(t("statsFetchFailed"));
            }
        };

        fetchStats();
    }, [refetchTrigger]); // Refetch when expenses are updated

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

    const handleQuickInputKeyPress = async (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter") {
            // Check if input matches the pattern: +number[k|m] purpose
            const match = quickInput.match(/^\+\s*(\d+)([km])?\s+(.+)$/i);
            if (match) {
                const [_, amount, unit, purpose] = match;
                let finalAmount = parseInt(amount);

                // Convert to actual amount based on unit
                if (unit?.toLowerCase() === "k") {
                    finalAmount *= 1000;
                } else if (unit?.toLowerCase() === "m") {
                    finalAmount *= 1000000;
                }

                try {
                    setIsLoading(true);
                    await expenseService.createExpense({
                        amount: finalAmount,
                        purpose: purpose.trim(),
                    });
                    toast.success(t("expenseCreated"));
                    setQuickInput(""); // Clear input after adding
                    setRefetchTrigger((prev) => prev + 1); // Trigger refetch
                } catch (error) {
                    console.error("Error creating expense:", error);
                    toast.error(t("expenseCreateFailed"));
                } finally {
                    setIsLoading(false);
                }
            }
        }
    };

    const handleCalculatePayment = () => {
        setShowConfirmationDialog(true);
    };

    const confirmCalculation = () => {
        // Calculate payment results
        const results: Record<string, number> = {
            "William Nguyen": 500000,
            "John Doe": -300000,
            "Jane Smith": -200000,
        };
        setPaymentResults(results);
        setShowConfirmationDialog(false);
        setShowPaymentDialog(true);
        toast.success(t("paymentNotification"));
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
            value: `${stats.totalAmount.toLocaleString("vi-VN")}₫`,
            icon: Wallet,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950/20",
            growth: stats.growthStats?.totalAmountGrowth,
        },
        {
            title: t("avgSpending"),
            value: `${Math.round(stats.avgExpense).toLocaleString("vi-VN")}₫`,
            icon: TrendingUp,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950/20",
            growth: stats.growthStats?.avgExpenseGrowth,
        },
        {
            title: t("transactions"),
            value: stats.totalExpenses.toString(),
            icon: CreditCard,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950/20",
            growth: stats.growthStats?.totalExpensesGrowth,
        },
        {
            title: t("perCapita"),
            value: `${Math.round(stats.avgPerPerson).toLocaleString("vi-VN")}₫`,
            icon: Target,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950/20",
            growth: stats.growthStats?.avgPerPersonGrowth,
        },
    ];

    const handleAvatarSelect = async (avatarUrl: string) => {
        try {
            const updatedUser = await authService.updateProfile({
                picture: avatarUrl,
            });
            setUser(updatedUser);
            setShowAvatarModal(false);
            toast.success(t("avatarUpdated"));
        } catch (error) {
            console.error("Error updating avatar:", error);
            toast.error(t("avatarUpdateFailed"));
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {t("currentMonth")}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {t("trackExpenses")}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        placeholder={t("quickInputPlaceholder")}
                        value={quickInput}
                        onChange={(e) => handleQuickInput(e.target.value)}
                        onKeyPress={handleQuickInputKeyPress}
                        disabled={isLoading}
                        className="w-full sm:w-[400px] bg-background/90 border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 shadow-md hover:shadow-lg transition-all duration-300 text-base"
                    />
                    <Button
                        onClick={handleCalculatePayment}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                    >
                        <Calculator className="w-4 h-4 mr-2" />
                        {t("calculatePayment")}
                    </Button>
                </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                {statsCards.map((stat, index) => {
                    const { value, isPositive } = formatGrowth(
                        stat.growth || "0"
                    );
                    return (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="group"
                        >
                            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 gradient-card">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 sm:pb-3">
                                    <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                                        {stat.title}
                                    </CardTitle>
                                    <div
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                                    >
                                        <stat.icon
                                            className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`}
                                        />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-lg sm:text-2xl font-bold text-foreground">
                                        {stat.value}
                                    </div>
                                    <div className="flex items-center gap-1 mt-1">
                                        {isPositive ? (
                                            <TrendingUp
                                                className={`w-4 h-4 ${stat.color}`}
                                            />
                                        ) : (
                                            <TrendingDown
                                                className={`w-4 h-4 ${stat.color}`}
                                            />
                                        )}
                                        <p
                                            className={`text-xs font-medium ${stat.color}`}
                                        >
                                            {value}%
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>

            {/* Recent Expenses */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="shadow-lg border-0 gradient-card">
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
                        <ExpenseList refetchTrigger={refetchTrigger} />
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
                            className="w-28 sm:w-32 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                        >
                            <Calculator className="w-4 h-4 mr-2" />
                            {t("confirm")}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmationDialog(false)}
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
                <DialogContent className="w-[280px] sm:w-[400px] mx-auto rounded-lg">
                    <DialogHeader>
                        <DialogTitle className="text-center text-lg">
                            {t("paymentCalculation")}
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm">
                            {t("paymentCalculationDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                        {Object.entries(paymentResults).map(
                            ([member, amount]) => (
                                <div
                                    key={member}
                                    className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-background/50 border border-border/50 hover:bg-background/80 transition-colors"
                                >
                                    <span className="font-medium text-sm sm:text-base">
                                        {member}
                                    </span>
                                    <span
                                        className={`font-semibold text-sm sm:text-base ${
                                            amount > 0
                                                ? "text-red-600"
                                                : amount < 0
                                                ? "text-green-600"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        {amount > 0
                                            ? `+${amount.toLocaleString(
                                                  "vi-VN"
                                              )}₫ (${t("toReceive")})`
                                            : amount < 0
                                            ? `${amount.toLocaleString(
                                                  "vi-VN"
                                              )}₫ (${t("toPay")})`
                                            : "0₫"}
                                    </span>
                                </div>
                            )
                        )}
                    </div>
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

            <AvatarSelectorModal
                isOpen={showAvatarModal}
                onClose={() => setShowAvatarModal(false)}
                onSelect={handleAvatarSelect}
            />
        </div>
    );
};

export default Dashboard;
