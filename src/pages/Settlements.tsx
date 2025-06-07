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

const Settlements = () => {
    const { t } = useLanguage();
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [selectedSettlement, setSelectedSettlement] =
        useState<SettlementDetail | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

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
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {t("settlements")}
                    </h1>
                    <p className="text-muted-foreground mt-2">
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
                    settlements.map((settlement) => (
                        <Card
                            key={settlement._id}
                            className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20"
                            onClick={() =>
                                fetchSettlementDetail(settlement._id)
                            }
                        >
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    {/* Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-primary/10 rounded-lg">
                                                <Receipt className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/20 border border-primary/10 text-primary">
                                                <span className="text-xs font-medium">
                                                    {formatDate(
                                                        settlement.createdAt
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className="px-2 py-0.5"
                                        >
                                            <CreditCard className="h-3 w-3 mr-1" />
                                            {settlement.totalExpenses}
                                        </Badge>
                                    </div>

                                    {/* Amount */}
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            {t("totalExpenses")}
                                        </div>
                                        <div className="text-lg font-bold text-primary">
                                            {formatCurrency(
                                                settlement.totalAmount
                                            )}
                                        </div>
                                    </div>

                                    {/* Creator */}
                                    {settlement.createdBy && (
                                        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border">
                                            <div className="relative">
                                                <Avatar>
                                                    <AvatarImage
                                                        className="rounded-full object-cover"
                                                        src={
                                                            settlement.createdBy
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
                                            <div>
                                                <div className="text-xs text-muted-foreground">
                                                    {t("settledBy")}
                                                </div>
                                                <div className="text-sm font-medium">
                                                    {settlement.createdBy.name}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
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

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="w-[350px] sm:w-[500px] mx-auto rounded-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex text-lg font-bold justify-center">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/20 border border-primary/10 text-primary">
                                {selectedSettlement &&
                                    formatDate(selectedSettlement.createdAt)}
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedSettlement && (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                                    <span className="text-sm text-muted-foreground">
                                        {t("totalExpenses")}
                                    </span>
                                    <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                                        {formatCurrency(
                                            selectedSettlement.totalAmount
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-2.5 rounded-lg bg-green-50 dark:bg-green-950/20">
                                    <span className="text-sm text-muted-foreground">
                                        {t("averagePerPerson")}
                                    </span>
                                    <span className="text-base font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(
                                            selectedSettlement.avgPerPerson
                                        )}
                                    </span>
                                </div>
                                {selectedSettlement.createdBy && (
                                    <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-primary/5 dark:bg-primary/10">
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
                                    </div>
                                )}
                            </div>

                            {/* Transactions */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-medium text-muted-foreground px-1">
                                    {t("transactions")}
                                </h3>
                                {selectedSettlement.transactions.map(
                                    (transaction) => (
                                        <div
                                            key={transaction._id}
                                            className="p-2.5 rounded-lg bg-background/50 border border-border/50"
                                        >
                                            {/* From */}
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <div className="relative">
                                                    <Avatar className="border border-red-500 object-cover">
                                                        <AvatarImage
                                                            className="rounded-full"
                                                            src={
                                                                transaction.from
                                                                    .picture
                                                            }
                                                        />
                                                        <AvatarFallback>
                                                            {transaction.from.name.charAt(
                                                                0
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                                        <span className="text-sm text-white">
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
                                            <div className="flex justify-center my-1.5">
                                                <div className="text-sm font-semibold text-blue-600 px-2.5 py-0.5 rounded-full bg-blue-50">
                                                    {formatCurrency(
                                                        transaction.amount
                                                    )}
                                                </div>
                                            </div>

                                            {/* To */}
                                            <div className="flex items-center gap-2">
                                                <div className="relative">
                                                    <Avatar className="border border-green-500 object-cover">
                                                        <AvatarImage
                                                            className="rounded-full object-cover"
                                                            src={
                                                                transaction.to
                                                                    .picture
                                                            }
                                                        />
                                                        <AvatarFallback>
                                                            {transaction.to.name.charAt(
                                                                0
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                                        <span className="text-sm text-white">
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
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Settlements;
