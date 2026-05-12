import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { expenseService } from "@/services/expense.service";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

interface QuickExpenseInputProps {
    onSuccess?: () => void;
}

const QuickExpenseInput: React.FC<QuickExpenseInputProps> = ({ onSuccess }) => {
    const { t } = useLanguage();
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const parsedInput = expenseService.parseQuickInput(input);
        if (!parsedInput) {
            toast.error(t("quickInputInvalid"));
            return;
        }

        try {
            setIsLoading(true);
            await expenseService.createExpense({
                amount: parsedInput.amount,
                purpose: parsedInput.purpose,
            });
            toast.success(t("expenseCreated"));
            setInput("");
            onSuccess?.();
        } catch (error) {
            console.error("Error creating expense:", error);
            toast.error(t("expenseCreateFailed"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
            >
                <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t("quickInputPlaceholder")}
                    disabled={isLoading}
                    className="w-full pr-12"
                />
                <motion.button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {isLoading ? "..." : "+"}
                </motion.button>
            </motion.div>
        </form>
    );
};

export default QuickExpenseInput;
