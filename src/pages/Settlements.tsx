import React, { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
    ChevronLeft,
    ChevronRight,
    Receipt,
    CreditCard,
    Eye,
    List,
    ArrowRight,
    ImageIcon,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
    settlementService,
    type Settlement,
    type SettlementDetail,
} from "@/services/settlement.service";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageLightbox from "@/components/ui/ImageLightbox";
import VietQrCard from "@/components/payments/VietQrCard";

const Settlements = () => {
    const { t } = useLanguage();
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedSettlement, setSelectedSettlement] =
        useState<SettlementDetail | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [previewReceipt, setPreviewReceipt] = useState<{
        expenseId: string;
        index: number;
    } | null>(null);

    const fetchSettlements = async (page: number) => {
        try {
            setLoading(true);
            const data = await settlementService.getSettlements(page);
            setSettlements(data.settlements);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error("Error fetching settlements:", error);
            toast.error(t("expenseFetchFailed"));
        } finally {
            setLoading(false);
        }
    };

    const fetchSettlementDetail = async (id: string) => {
        try {
            const data = await settlementService.getSettlementDetail(id);
            setSelectedSettlement(data);
            setIsDetailOpen(true);
        } catch (error) {
            console.error("Error fetching settlement detail:", error);
            toast.error(t("expenseFetchFailed"));
        }
    };

    useEffect(() => {
        fetchSettlements(currentPage);
    }, [currentPage]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), "dd/MM/yyyy HH:mm");
    };

    const formatShortDate = (dateString: string) => {
        return format(new Date(dateString), "dd/MM HH:mm");
    };

    const buildSettlementQrDescription = (
        fromName: string,
        toName: string,
        dateString?: string
    ) =>
        t("settlementQrContent")
            .replace("{from}", fromName)
            .replace("{to}", toName)
            .replace(
                "{date}",
                format(new Date(dateString ?? Date.now()), "dd/MM/yyyy")
            );

    const previewExpense = previewReceipt
        ? selectedSettlement?.expenses.find(
              (expense) => expense._id === previewReceipt.expenseId
          )
        : undefined;

    const previewImages =
        previewExpense?.attachments?.map((attachment) => ({
            url: attachment.url,
            caption: previewExpense.purpose,
        })) ?? [];

    const renderReceiptPreview = (
        expense: SettlementDetail["expenses"][number]
    ) => {
        const list = expense.attachments ?? [];
        if (!list.length) return null;

        const shown = list.slice(0, 2);
        const extra = list.length - shown.length;

        return (
            <button
                type="button"
                onClick={() =>
                    setPreviewReceipt({
                        expenseId: expense._id,
                        index: 0,
                    })
                }
                className="inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={t("viewReceipt")}
            >
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="shrink-0">{t("attachments")}</span>
                <div className="flex items-center -space-x-1 shrink-0">
                    {shown.map((attachment) => (
                        <span
                            key={attachment.publicId}
                            className="block w-6 h-6 rounded-full overflow-hidden border-2 border-background shadow-sm"
                        >
                            <img
                                src={attachment.url}
                                alt=""
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </span>
                    ))}
                    {extra > 0 && (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border-2 border-background bg-card text-[10px] font-semibold text-muted-foreground shadow-sm">
                            +{extra}
                        </span>
                    )}
                </div>
                <span className="tabular-nums">{list.length}</span>
            </button>
        );
    };

    const renderMobileSettlementCard = (settlement: Settlement) => (
        <Card
            key={settlement._id}
            className="overflow-hidden border border-border shadow-sm active:scale-[0.99] transition-transform"
            onClick={() => fetchSettlementDetail(settlement._id)}
        >
            <CardContent className="p-0">
                <button
                    type="button"
                    className="w-full p-4 text-left"
                    aria-label={t("viewDetails")}
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                <Receipt className="h-3.5 w-3.5" />
                                {formatShortDate(settlement.createdAt)}
                            </div>
                            <div className="mt-3 text-2xl font-bold text-foreground">
                                {formatCurrency(settlement.totalAmount)}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {settlement.totalExpenses} {t("expenses").toLowerCase()}
                            </div>
                        </div>
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                            <ChevronRight className="h-5 w-5" />
                        </div>
                    </div>

                    {settlement.createdBy && (
                        <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                            <div className="text-xs text-muted-foreground">
                                {t("settledBy")}
                            </div>
                            <div className="flex items-center gap-2 min-w-0">
                                <Avatar className="h-7 w-7">
                                    <AvatarImage
                                        className="rounded-full object-cover"
                                        src={settlement.createdBy.picture}
                                    />
                                    <AvatarFallback className="text-xs">
                                        {settlement.createdBy.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="max-w-[9rem] truncate text-sm font-medium">
                                    {settlement.createdBy.name}
                                </span>
                            </div>
                        </div>
                    )}
                </button>
            </CardContent>
        </Card>
    );

    const renderTransactionCard = (
        transaction: SettlementDetail["transactions"][number]
    ) => (
        <div
            key={transaction._id}
            className="rounded-xl border border-border bg-card p-3 shadow-sm"
        >
            <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Avatar className="h-8 w-8 border border-rose-500">
                        <AvatarImage
                            className="rounded-full object-cover"
                            src={transaction.from.picture}
                        />
                        <AvatarFallback>
                            {transaction.from.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                            {transaction.from.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {t("needsToPay")}
                        </div>
                    </div>
                </div>

                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />

                <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                    <div className="min-w-0 text-right">
                        <div className="truncate text-sm font-medium">
                            {transaction.to.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {t("willReceive")}
                        </div>
                    </div>
                    <Avatar className="h-8 w-8 border border-emerald-500">
                        <AvatarImage
                            className="rounded-full object-cover"
                            src={transaction.to.picture}
                        />
                        <AvatarFallback>{transaction.to.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
            <div className="mt-3 rounded-lg bg-primary/10 px-3 py-2 text-center text-sm font-bold text-primary">
                {formatCurrency(transaction.amount)}
            </div>
            <VietQrCard
                bankAccount={transaction.to.bankAccount}
                amount={transaction.amount}
                description={buildSettlementQrDescription(
                    transaction.from.name,
                    transaction.to.name,
                    selectedSettlement?.createdAt
                )}
                recipientName={transaction.to.name}
            />
        </div>
    );

    const renderExpenseCard = (
        expense: SettlementDetail["expenses"][number]
    ) => (
        <div
            key={expense._id}
            className="rounded-xl border border-border bg-card p-3 shadow-sm"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Receipt className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-foreground">
                                {expense.purpose}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {formatDate(expense.createdAt)}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="shrink-0 text-right text-sm font-bold text-primary">
                    {formatCurrency(expense.amount)}
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                <div className="flex min-w-0 items-center gap-2">
                    <Avatar className="h-7 w-7">
                        <AvatarImage
                            className="rounded-full object-cover"
                            src={expense.createdBy.picture}
                        />
                        <AvatarFallback className="text-xs">
                            {expense.createdBy.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-xs text-muted-foreground">
                        {expense.createdBy.name}
                    </span>
                </div>
                {!!expense.attachments?.length && renderReceiptPreview(expense)}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="container mx-auto p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <div className="grid gap-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <div className="flex items-center justify-between mb-5 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                        {t("settlements")}
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                        {t("settlementDetails")}
                    </p>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
                {settlements.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                            <Receipt className="h-12 w-12 text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">
                                {t("noSettlements")}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {t("noSettlementsDescription")}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t("settledAt")}</TableHead>
                                    <TableHead>{t("expenses")}</TableHead>
                                    <TableHead>{t("settledBy")}</TableHead>
                                    <TableHead className="text-right">
                                        {t("totalExpenses")}
                                    </TableHead>
                                    <TableHead className="text-right">
                                        {t("viewDetails")}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {settlements.map((settlement) => (
                                    <TableRow
                                        key={settlement._id}
                                        className="hover:bg-muted/50 cursor-pointer"
                                    >
                                        <TableCell>
                                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 border border-primary/10 text-primary">
                                                <span className="text-sm font-medium">
                                                    {formatDate(
                                                        settlement.createdAt
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className="px-3 py-1"
                                            >
                                                <CreditCard className="h-4 w-4 mr-2" />
                                                {settlement.totalExpenses}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {settlement.createdBy && (
                                                <div className="flex items-center gap-2">
                                                    <div className="relative">
                                                        <Avatar>
                                                            <AvatarImage
                                                                className="rounded-full object-cover"
                                                                src={
                                                                    settlement
                                                                        .createdBy
                                                                        .picture
                                                                }
                                                            />
                                                            <AvatarFallback>
                                                                {settlement.createdBy.name.charAt(
                                                                    0
                                                                )}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                    <span className="text-sm font-medium">
                                                        {
                                                            settlement.createdBy
                                                                .name
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-primary">
                                            {formatCurrency(
                                                settlement.totalAmount
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    fetchSettlementDetail(
                                                        settlement._id
                                                    )
                                                }
                                                title={t("viewDetails")}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden grid gap-4">
                {settlements.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                            <Receipt className="h-10 w-10 text-muted-foreground/50 mb-3" />
                            <h3 className="text-base font-semibold mb-1">
                                {t("noSettlements")}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {t("noSettlementsDescription")}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    settlements.map(renderMobileSettlementCard)
                )}
            </div>

            {settlements.length > 0 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                        {t("page")} {currentPage} {t("of")} {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                            setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                            )
                        }
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <Dialog
                open={isDetailOpen}
                onOpenChange={(open) => {
                    setIsDetailOpen(open);
                    if (!open) setPreviewReceipt(null);
                }}
            >
                <DialogContent className="w-[calc(100vw-1rem)] sm:w-full sm:max-w-2xl mx-auto rounded-xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="flex text-lg font-bold justify-center">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/10 text-primary text-sm">
                                {selectedSettlement &&
                                    formatDate(selectedSettlement.createdAt)}
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedSettlement && (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                <div className="rounded-xl bg-primary/10 p-3">
                                    <span className="text-sm text-muted-foreground">
                                        {t("totalExpenses")}
                                    </span>
                                    <div className="mt-1 text-xl font-bold text-primary">
                                        {formatCurrency(
                                            selectedSettlement.totalAmount
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-xl bg-muted p-3">
                                    <span className="text-sm text-muted-foreground">
                                        {t("averagePerPerson")}
                                    </span>
                                    <div className="mt-1 text-xl font-bold text-foreground">
                                        {formatCurrency(
                                            selectedSettlement.avgPerPerson
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {selectedSettlement.createdBy && (
                                    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
                                        <div>
                                            <div className="text-xs text-muted-foreground">
                                                {t("settledBy")}
                                            </div>
                                            <div className="text-sm font-medium">
                                                {
                                                    selectedSettlement.createdBy
                                                        .name
                                                }
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <Avatar>
                                                <AvatarImage
                                                    className="rounded-full object-cover"
                                                    src={
                                                        selectedSettlement
                                                            .createdBy.picture
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {selectedSettlement.createdBy.name.charAt(
                                                        0
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tabs for Transactions and Expenses */}
                            <Tabs defaultValue="transactions" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="transactions" className="flex items-center gap-2 text-xs sm:text-sm">
                                        <ArrowRight className="h-4 w-4" />
                                        {t("transactions")}
                                    </TabsTrigger>
                                    <TabsTrigger value="expenses" className="flex items-center gap-2 text-xs sm:text-sm">
                                        <List className="h-4 w-4" />
                                        {t("expenses")}
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="transactions" className="space-y-2 mt-4">
                                    <h3 className="text-sm font-medium text-muted-foreground px-1">
                                        {t("transactions")}
                                    </h3>
                                    {selectedSettlement.transactions.map(
                                        renderTransactionCard
                                    )}
                                </TabsContent>

                                <TabsContent value="expenses" className="space-y-2 mt-4">
                                    <h3 className="text-sm font-medium text-muted-foreground px-1">
                                        {t("expenses")} ({selectedSettlement.expenses.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {selectedSettlement.expenses.map(
                                            renderExpenseCard
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            <ImageLightbox
                images={previewImages}
                openIndex={previewReceipt?.index ?? null}
                onClose={() => setPreviewReceipt(null)}
            />
        </div>
    );
};

export default Settlements;
