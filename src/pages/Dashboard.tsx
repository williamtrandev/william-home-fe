import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    Plus,
    TrendingUp,
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

    const handleQuickInputKeyPress = (
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

                // Format date as dd-mm-yyyy
                const today = new Date();
                const formattedDate = `${String(today.getDate()).padStart(
                    2,
                    "0"
                )}-${String(today.getMonth() + 1).padStart(
                    2,
                    "0"
                )}-${today.getFullYear()}`;

                // Create new expense
                const newExpense: Expense = {
                    id: Date.now().toString(),
                    amount: finalAmount,
                    purpose: purpose.trim(),
                    date: formattedDate,
                    memberName: "William Nguyen",
                    memberId: "1",
                };

                // Add to expenses
                setExpenses([...expenses, newExpense]);
                setQuickInput(""); // Clear input after adding
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

    const stats = [
        {
            title: t("total"),
            value: `${totalExpenses.toLocaleString("vi-VN")}₫`,
            icon: Wallet,
            color: "text-blue-600",
            bgColor: "bg-blue-50 dark:bg-blue-950/20",
            change: "+12%",
        },
        {
            title: t("avgSpending"),
            value: "1,850,000₫",
            icon: TrendingUp,
            color: "text-green-600",
            bgColor: "bg-green-50 dark:bg-green-950/20",
            change: "+8%",
        },
        {
            title: t("transactions"),
            value: expenses.length.toString(),
            icon: CreditCard,
            color: "text-purple-600",
            bgColor: "bg-purple-50 dark:bg-purple-950/20",
            change: `+${expenses.length}`,
        },
        {
            title: t("perCapita"),
            value: "700,000₫",
            icon: Target,
            color: "text-orange-600",
            bgColor: "bg-orange-50 dark:bg-orange-950/20",
            change: "82%",
        },
    ];

    return (
        <div className="p-6 space-y-8">
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
                {stats.map((stat, index) => (
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
                                <p
                                    className={`text-xs ${stat.color} font-medium`}
                                >
                                    {stat.change} {t("fromLastMonth")}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
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
                        {expenses.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950 dark:to-purple-950 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                    <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                                </div>
                                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 sm:mb-2">
                                    {t("noExpenses")}
                                </h3>
                                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                                    {t("startTracking")}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 sm:space-y-3">
                                {expenses.map((expense, index) => (
                                    <motion.div
                                        key={expense.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors border border-border/50 gap-2 sm:gap-3"
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base shadow-lg ring-2 ring-white dark:ring-gray-800">
                                                {expense.purpose[0]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm sm:text-base text-foreground truncate">
                                                    {expense.purpose}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {expense.date}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        {expense.memberName}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
                                            <span className="font-semibold text-sm sm:text-base text-foreground">
                                                {expense.amount.toLocaleString(
                                                    "vi-VN"
                                                )}
                                                ₫
                                            </span>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleEditExpense(
                                                            expense
                                                        )
                                                    }
                                                    className="h-8 px-2 sm:h-9 sm:px-3 hover:bg-blue-100 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400"
                                                >
                                                    {t("edit")}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleDeleteExpense(
                                                            expense.id
                                                        )
                                                    }
                                                    className="h-8 px-2 sm:h-9 sm:px-3 hover:bg-red-100 dark:hover:bg-red-950 text-red-600 dark:text-red-400"
                                                >
                                                    {t("delete")}
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
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
        </div>
    );
};

export default Dashboard;
