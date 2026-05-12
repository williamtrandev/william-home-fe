import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
    expenseService,
    Expense,
    PaginationInfo,
    type Attachment,
} from "@/services/expense.service";
import { isKnownCategory, type CategoryKey } from "@/lib/categories";
import CategoryBadge from "@/components/categories/CategoryBadge";
import CategoryPicker from "@/components/categories/CategoryPicker";
import AttachmentsField from "@/components/expenses/AttachmentsField";
import ImageLightbox from "@/components/ui/ImageLightbox";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Edit2, Paperclip } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNotifications } from "@/hooks/useNotifications";

interface ExpenseListProps {
    onUpdateExpense?: () => void;
    refetchTrigger?: number;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
    onUpdateExpense,
    refetchTrigger,
}) => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [editingExpense, setEditingExpense] = useState<{
        id: string;
        purpose: string;
        amount: number;
        category: CategoryKey;
        createdById: string;
        attachments: Attachment[];
    } | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    // Drives the row-level (read-only) lightbox when a viewer taps a thumb.
    const [previewExpense, setPreviewExpense] = useState<{
        expenseId: string;
        index: number;
    } | null>(null);
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

    // Add notification handler
    useNotifications(() => {
        console.log("Notification received, refreshing expenses...");
        fetchExpenses(pagination.currentPage);
    });

    // Add effect to listen for refetchTrigger changes
    useEffect(() => {
        if (refetchTrigger) {
            fetchExpenses(1);
        }
    }, [refetchTrigger]);

    // Initial fetch
    useEffect(() => {
        fetchExpenses(1);
    }, []);

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
            onUpdateExpense?.();
        } catch (error) {
            console.error("Error fetching expenses:", error);
            toast.error(t("expenseFetchFailed"));
        } finally {
            setIsLoading(false);
        }
    };

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

    const formatAmountInput = (value: string) => {
        // Remove all non-digit characters
        const digits = value.replace(/\D/g, "");
        // Format with thousand separator
        return new Intl.NumberFormat("vi-VN").format(Number(digits));
    };

    const parseAmountInput = (value: string) => {
        // Remove all non-digit characters and convert to number
        return Number(value.replace(/\D/g, ""));
    };

    const handleEdit = (expense: Expense) => {
        setEditingExpense({
            id: expense._id,
            purpose: expense.purpose,
            amount: expense.amount,
            category: isKnownCategory(expense.category)
                ? expense.category
                : "OTHER",
            createdById: expense.createdBy?._id ?? "",
            attachments: expense.attachments ?? [],
        });
        setShowEditDialog(true);
    };

    // Sync the local list when an attachment changes inside the dialog so the
    // thumbnails in the row update without a full refetch.
    const handleAttachmentsChange = (next: Attachment[]) => {
        setEditingExpense((prev) => (prev ? { ...prev, attachments: next } : prev));
        if (editingExpense) {
            const id = editingExpense.id;
            setExpenses((rows) =>
                rows.map((r) =>
                    r._id === id ? { ...r, attachments: next } : r
                )
            );
        }
    };

    const handleSave = async () => {
        if (!editingExpense) return;

        try {
            setIsLoading(true);
            await expenseService.updateExpense(editingExpense.id, {
                purpose: editingExpense.purpose,
                amount: editingExpense.amount,
                category: editingExpense.category,
            });
            toast.success(t("expenseUpdated"));
            fetchExpenses(pagination.currentPage);
            setShowEditDialog(false);
        } catch (error) {
            console.error("Error updating expense:", error);
            toast.error(t("expenseUpdateFailed"));
        } finally {
            setIsLoading(false);
            setEditingExpense(null);
        }
    };

    const handleCancel = () => {
        setEditingExpense(null);
        setShowEditDialog(false);
    };

    const renderRowThumbnails = (expense: Expense) => {
        const list = expense.attachments ?? [];
        if (!list.length) return null;
        const shown = list.slice(0, 3);
        const extra = list.length - shown.length;
        return (
            <div className="flex items-center gap-1.5">
                {shown.map((a, idx) => (
                    <button
                        key={a.publicId}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPreviewExpense({
                                expenseId: expense._id,
                                index: idx,
                            });
                        }}
                        className="block w-9 h-9 rounded-md overflow-hidden border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        aria-label={t("viewReceipt")}
                    >
                        <img
                            src={a.url}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </button>
                ))}
                {extra > 0 && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setPreviewExpense({
                                expenseId: expense._id,
                                index: shown.length,
                            });
                        }}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-border bg-muted text-xs font-medium text-muted-foreground hover:bg-muted/80"
                        aria-label={t("viewReceipt")}
                    >
                        +{extra}
                    </button>
                )}
            </div>
        );
    };

    const previewImages =
        previewExpense
            ? expenses
                  .find((e) => e._id === previewExpense.expenseId)
                  ?.attachments?.map((a) => ({ url: a.url })) ?? []
            : [];

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
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold">
                                    {expense.purpose}
                                </h3>
                                <CategoryBadge category={expense.category} />
                            </div>
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
                            {renderRowThumbnails(expense)}
                        </div>
                        <div className="text-right ml-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(expense)}
                                className="mb-2"
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
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
                                <div className="flex items-center gap-2 flex-wrap">
                                    <CategoryBadge
                                        category={expense.category}
                                        variant="compact"
                                    />
                                    <span className="truncate">
                                        {expense.purpose}
                                    </span>
                                    {!!expense.attachments?.length && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setPreviewExpense({
                                                    expenseId: expense._id,
                                                    index: 0,
                                                })
                                            }
                                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-muted text-xs text-muted-foreground hover:bg-muted/80"
                                            aria-label={t("viewReceipt")}
                                        >
                                            <Paperclip className="w-3 h-3" />
                                            {expense.attachments.length}
                                        </button>
                                    )}
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
                                                className="rounded-full object-cover"
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
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(expense)}
                                        className="ml-auto"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
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

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                {/*
                  Wider + scrollable so the attachment grid and the 4-col
                  category picker both fit without clipping on phones. The
                  inner scrollable region keeps the header/buttons visible
                  while long content (attachments) scrolls between them.
                */}
                <DialogContent className="w-[calc(100vw-2rem)] sm:w-full sm:max-w-md max-h-[90vh] mx-auto rounded-lg flex flex-col p-0">
                    <DialogHeader className="px-6 pt-6 pb-2 shrink-0">
                        <DialogTitle className="text-center text-lg">
                            {t("editExpense")}
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm">
                            {t("editExpenseDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 px-6 pb-6 overflow-y-auto">
                        <div className="space-y-2">
                            <Label htmlFor="purpose">{t("purpose")}</Label>
                            <Input
                                id="purpose"
                                value={editingExpense?.purpose || ""}
                                onChange={(e) =>
                                    setEditingExpense(
                                        editingExpense
                                            ? {
                                                  ...editingExpense,
                                                  purpose: e.target.value,
                                              }
                                            : null
                                    )
                                }
                                className="bg-background/90 border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amount">{t("amount")}</Label>
                            <Input
                                id="amount"
                                type="text"
                                inputMode="numeric"
                                value={
                                    editingExpense?.amount
                                        ? formatAmountInput(
                                              editingExpense.amount.toString()
                                          )
                                        : ""
                                }
                                onChange={(e) =>
                                    setEditingExpense(
                                        editingExpense
                                            ? {
                                                  ...editingExpense,
                                                  amount: parseAmountInput(
                                                      e.target.value
                                                  ),
                                              }
                                            : null
                                    )
                                }
                                className="bg-background/90 border-primary/30 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        {editingExpense && (
                            <AttachmentsField
                                expenseId={editingExpense.id}
                                attachments={editingExpense.attachments}
                                onChange={handleAttachmentsChange}
                                // Any house member can attach/remove receipts.
                                // The dialog is only reachable from an authed
                                // session inside the user's house.
                                canEdit={!!user}
                            />
                        )}
                        <div className="space-y-2">
                            <Label>{t("category")}</Label>
                            <CategoryPicker
                                value={editingExpense?.category}
                                onChange={(next) =>
                                    setEditingExpense(
                                        editingExpense
                                            ? { ...editingExpense, category: next }
                                            : null
                                    )
                                }
                                disabled={isLoading}
                            />
                        </div>
                        <div className="flex justify-center gap-3 mt-4">
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="w-28 sm:w-32"
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={isLoading}
                                className="w-28 sm:w-32"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        {t("saving")}
                                    </div>
                                ) : (
                                    t("save")
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ImageLightbox
                images={previewImages}
                openIndex={previewExpense?.index ?? null}
                onClose={() => setPreviewExpense(null)}
            />
        </div>
    );
};

export default ExpenseList;
