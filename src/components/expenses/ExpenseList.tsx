import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    expenseService,
    Expense,
    PaginationInfo,
} from "@/services/expense.service";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface ExpenseListProps {
    refetchTrigger?: number;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ refetchTrigger = 0 }) => {
    const { t, language } = useLanguage();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const observer = useRef<IntersectionObserver>();
    const lastExpenseRef = useCallback(
        (node: HTMLDivElement) => {
            if (isLoading) return;
            if (observer.current) observer.current.disconnect();
            observer.current = new IntersectionObserver((entries) => {
                if (
                    entries[0].isIntersecting &&
                    pagination.currentPage < pagination.totalPages
                ) {
                    fetchExpenses(pagination.currentPage + 1, true);
                }
            });
            if (node) observer.current.observe(node);
        },
        [isLoading, pagination.currentPage, pagination.totalPages]
    );

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const fetchExpenses = async (page: number, append: boolean = false) => {
        try {
            setIsLoading(true);
            const response = await expenseService.getExpenses(page);
            setExpenses((prev) =>
                append ? [...prev, ...response.expenses] : response.expenses
            );
            setPagination(response.pagination);
        } catch (error) {
            console.error("Error fetching expenses:", error);
            toast.error(t("expenseFetchFailed"));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses(1);
    }, [refetchTrigger]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, "dd/MM/yyyy HH:mm", {
            locale: language === "vi" ? vi : enUS,
        });
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const renderMobileView = () => (
        <div className="space-y-4">
            {expenses.map((expense, index) => (
                <motion.div
                    key={expense._id}
                    ref={index === expenses.length - 1 ? lastExpenseRef : null}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-300"
                >
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <h3 className="font-semibold">{expense.purpose}</h3>
                            <p className="text-sm text-muted-foreground">
                                {formatDate(expense.createdAt)}
                            </p>
                            <div className="flex items-center gap-2">
                                <Avatar>
                                    <AvatarImage
                                        className="rounded-full object-cover"
                                        src={expense.createdBy?.picture}
                                    />
                                    <AvatarFallback>
                                        {expense.createdBy?.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-sm text-muted-foreground">
                                    {expense.createdBy?.name}
                                </span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-primary">
                                {formatAmount(expense.amount)}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
            {isLoading && (
                <div className="text-center py-4">
                    <p className="text-muted-foreground">{t("loading")}</p>
                </div>
            )}
        </div>
    );

    const renderTabletView = () => (
        <div className="rounded-lg border shadow-sm overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-semibold w-[35%]">
                            {t("expensePurpose")}
                        </TableHead>
                        <TableHead className="font-semibold w-[20%]">
                            {t("expenseAmount")}
                        </TableHead>
                        <TableHead className="font-semibold w-[20%]">
                            {t("expenseDate")}
                        </TableHead>
                        <TableHead className="font-semibold w-[25%]">
                            {t("expenseCreator")}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {expenses.map((expense) => (
                        <TableRow
                            key={expense._id}
                            className="hover:bg-muted/50 transition-colors"
                        >
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <span className="truncate">
                                        {expense.purpose}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="font-bold text-primary">
                                    {formatAmount(expense.amount)}
                                </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                                {formatDate(expense.createdAt)}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <Avatar>
                                            <AvatarImage
                                                className="w-8 h-8 rounded-full object-cover"
                                                src={expense.createdBy?.picture}
                                            />
                                            <AvatarFallback>
                                                {expense.createdBy?.name.charAt(
                                                    0
                                                )}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <span className="font-medium truncate">
                                        {expense.createdBy?.name}
                                    </span>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t bg-muted/30">
                    <Button
                        variant="outline"
                        onClick={() =>
                            fetchExpenses(pagination.currentPage - 1)
                        }
                        disabled={pagination.currentPage === 1 || isLoading}
                        className="flex items-center gap-2 hover:bg-background"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        {t("prevPage")}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {t("pageInfo")
                            .replace(
                                "{current}",
                                pagination.currentPage.toString()
                            )
                            .replace(
                                "{total}",
                                pagination.totalPages.toString()
                            )}
                    </span>
                    <Button
                        variant="outline"
                        onClick={() =>
                            fetchExpenses(pagination.currentPage + 1)
                        }
                        disabled={
                            pagination.currentPage === pagination.totalPages ||
                            isLoading
                        }
                        className="flex items-center gap-2 hover:bg-background"
                    >
                        {t("nextPage")}
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            {expenses.length === 0 && !isLoading ? (
                <div className="text-center py-8">
                    <p className="text-muted-foreground">{t("noExpenses")}</p>
                </div>
            ) : isMobile ? (
                renderMobileView()
            ) : (
                renderTabletView()
            )}
        </div>
    );
};

export default ExpenseList;
