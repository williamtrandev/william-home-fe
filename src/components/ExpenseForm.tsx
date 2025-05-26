import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { Expense } from "@/types/expense";

interface ExpenseFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (expense: Omit<Expense, "id">) => void;
    editingExpense?: Expense | null;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
    isOpen,
    onClose,
    onSubmit,
    editingExpense,
}) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        amount: "",
        purpose: "",
        date: "",
        memberName: "William Nguyen",
    });

    // Load editing expense data when it changes
    useEffect(() => {
        if (editingExpense) {
            // Convert date from dd-mm-yyyy to yyyy-mm-dd for input
            const [day, month, year] = editingExpense.date.split("-");
            const formattedDate = `${year}-${month}-${day}`;

            setFormData({
                amount: editingExpense.amount.toString(),
                purpose: editingExpense.purpose,
                date: formattedDate,
                memberName: editingExpense.memberName,
            });
        } else {
            // Reset form when not editing
            const today = new Date();
            const formattedDate = `${today.getFullYear()}-${String(
                today.getMonth() + 1
            ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

            setFormData({
                amount: "",
                purpose: "",
                date: formattedDate,
                memberName: "William Nguyen",
            });
        }
    }, [editingExpense]);

    const handleSubmit = () => {
        if (formData.amount && formData.purpose && formData.date) {
            // Convert date from yyyy-mm-dd to dd-mm-yyyy
            const [year, month, day] = formData.date.split("-");
            const formattedDate = `${day}-${month}-${year}`;

            onSubmit({
                amount: Number(formData.amount),
                purpose: formData.purpose,
                date: formattedDate,
                memberName: formData.memberName,
                memberId: "1",
            });
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {editingExpense ? t("edit") : t("addExpense")}
                    </DialogTitle>
                </DialogHeader>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="amount">{t("amount")} (VND)</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={formData.amount}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    amount: e.target.value,
                                })
                            }
                            placeholder="100,000"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="purpose">{t("purpose")}</Label>
                        <Input
                            id="purpose"
                            value={formData.purpose}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    purpose: e.target.value,
                                })
                            }
                            placeholder="Đi chợ, ăn uống..."
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="date">{t("date")}</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    date: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="flex gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            {t("cancel")}
                        </Button>
                        <Button onClick={handleSubmit} className="flex-1">
                            {t("save")}
                        </Button>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default ExpenseForm;
