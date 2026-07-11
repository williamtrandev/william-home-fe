import { useState } from "react";
import { Download, ExternalLink, Loader2, QrCode, Share2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { BankAccount } from "@/services/auth.service";
import { buildVietQrUrl } from "@/lib/vietqr";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface VietQrCardProps {
    bankAccount?: BankAccount | null;
    amount: number;
    description: string;
    recipientName: string;
}

const VietQrCard = ({
    bankAccount,
    amount,
    description,
    recipientName,
}: VietQrCardProps) => {
    const { t } = useLanguage();
    const [isShareOpen, setIsShareOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const qrUrl = buildVietQrUrl({ bankAccount, amount, description });
    const formattedAmount = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);

    const loadImage = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });

    const createTransferImage = async () => {
        if (!qrUrl || !bankAccount) return null;

        const canvas = document.createElement("canvas");
        canvas.width = 900;
        canvas.height = 1280;
        const ctx = canvas.getContext("2d");
        if (!ctx) return null;

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#2563eb";
        ctx.fillRect(0, 0, canvas.width, 190);
        ctx.fillStyle = "#ffffff";
        ctx.font = "700 44px Arial";
        ctx.fillText(t("scanQrToPay"), 60, 76);
        ctx.font = "700 38px Arial";
        ctx.fillText(formattedAmount, 60, 136);
        ctx.font = "500 24px Arial";
        ctx.fillText(description.slice(0, 80), 60, 170);

        const qrImage = await loadImage(qrUrl);
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(180, 230, 540, 540);
        ctx.drawImage(qrImage, 220, 270, 460, 460);

        ctx.font = "500 28px Arial";
        ctx.fillStyle = "#475569";
        ctx.fillText(`${bankAccount.bankName} - ${bankAccount.accountNo}`, 60, 850);
        ctx.fillText(bankAccount.accountName, 60, 900);

        ctx.fillStyle = "#e0f2fe";
        ctx.fillRect(60, 970, 780, 110);
        ctx.fillStyle = "#0f172a";
        ctx.font = "700 24px Arial";
        ctx.fillText(t("transferContent"), 90, 1010);
        ctx.font = "500 26px Arial";
        ctx.fillText(description.slice(0, 70), 90, 1055);

        return new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, "image/png")
        );
    };

    const downloadBlob = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `vietqr-${bankAccount?.accountNo ?? "transfer"}.png`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownload = async () => {
        if (!qrUrl) return;
        try {
            setIsGenerating(true);
            const blob = await createTransferImage();
            if (blob) {
                downloadBlob(blob);
                return;
            }
            window.open(qrUrl, "_blank", "noopener,noreferrer");
        } catch (error) {
            console.error("Failed to generate QR image:", error);
            window.open(qrUrl, "_blank", "noopener,noreferrer");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = async () => {
        if (!qrUrl) return;
        try {
            setIsGenerating(true);
            const blob = await createTransferImage();
            if (!blob) {
                window.open(qrUrl, "_blank", "noopener,noreferrer");
                return;
            }
            const file = new File([blob], "vietqr-transfer.png", {
                type: "image/png",
            });
            if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: t("scanQrToPay"),
                    text: description,
                });
                return;
            }
            downloadBlob(blob);
        } catch (error) {
            console.error("Failed to share QR image:", error);
            window.open(qrUrl, "_blank", "noopener,noreferrer");
        } finally {
            setIsGenerating(false);
        }
    };

    if (!qrUrl) {
        return (
            <div className="mt-3 rounded-lg border border-dashed border-border bg-muted/30 p-3 text-center text-xs text-muted-foreground">
                {t("bankAccountMissing")}
            </div>
        );
    }

    return (
        <>
            <div className="mt-3 overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-sm">
                <div className="flex items-center justify-between gap-3 bg-primary/10 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <QrCode className="h-4 w-4" />
                        </span>
                        {t("scanQrToPay")}
                    </div>
                    <div className="rounded-full bg-background px-3 py-1 text-sm font-bold text-primary shadow-sm">
                        {formattedAmount}
                    </div>
                </div>
                <div className="grid gap-4 p-4 sm:grid-cols-[232px_1fr] sm:items-center">
                    <div className="mx-auto overflow-hidden rounded-2xl border border-border bg-white p-3 shadow-inner">
                        <img
                            src={qrUrl}
                            alt={t("vietQrAlt")}
                            className="h-52 w-52 object-contain"
                            loading="lazy"
                        />
                    </div>
                    <div className="min-w-0 space-y-3 text-sm">
                        <div className="rounded-xl bg-muted/50 p-3">
                            <div className="text-xs text-muted-foreground">
                                {t("accountName")}
                            </div>
                            <div className="mt-1 font-semibold text-foreground">
                                {bankAccount?.accountName}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="min-w-0 rounded-lg bg-muted/50 p-2">
                                <div className="text-muted-foreground">
                                    {t("bank")}
                                </div>
                                <div className="mt-1 break-words font-medium text-foreground">
                                    {bankAccount?.bankName}
                                </div>
                            </div>
                            <div className="min-w-0 rounded-lg bg-muted/50 p-2">
                                <div className="text-muted-foreground">
                                    {t("accountNo")}
                                </div>
                                <div className="mt-1 break-all font-medium text-foreground">
                                    {bankAccount?.accountNo}
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl bg-muted/50 p-3 text-xs">
                            <div className="text-muted-foreground">
                                {t("transferContent")}
                            </div>
                            <div className="mt-1 break-words font-medium text-foreground">
                                {description}
                            </div>
                        </div>
                        <div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsShareOpen(true)}
                                className="w-full"
                            >
                                <ExternalLink className="h-4 w-4" />
                                {t("fullQrInfo")}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
                <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-xl max-h-[92vh] overflow-y-auto p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>{t("fullQrInfo")}</DialogTitle>
                        <DialogDescription>
                            {t("fullQrInfoDescription")}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="rounded-3xl border border-border bg-white p-5 text-slate-950 shadow-sm">
                        <div className="rounded-2xl bg-blue-600 p-4 text-white">
                            <div className="text-sm font-semibold">
                                {t("scanQrToPay")}
                            </div>
                            <div className="mt-1 text-2xl font-bold">
                                {formattedAmount}
                            </div>
                        </div>
                        <div className="mt-5 flex justify-center">
                            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                                <img
                                    src={qrUrl}
                                    alt={t("vietQrAlt")}
                                    className="h-64 w-64 object-contain"
                                />
                            </div>
                        </div>
                        <div className="mt-5 space-y-3">
                            <div>
                                <div className="text-xs text-slate-500">
                                    {t("accountName")}
                                </div>
                                <div className="font-bold">
                                    {bankAccount?.accountName}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="min-w-0 rounded-xl bg-slate-100 p-3">
                                    <div className="text-xs text-slate-500">
                                        {t("bank")}
                                    </div>
                                    <div className="mt-1 break-words font-semibold">
                                        {bankAccount?.bankName}
                                    </div>
                                </div>
                                <div className="min-w-0 rounded-xl bg-slate-100 p-3">
                                    <div className="text-xs text-slate-500">
                                        {t("accountNo")}
                                    </div>
                                    <div className="mt-1 break-all font-semibold">
                                        {bankAccount?.accountNo}
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl bg-slate-100 p-3 text-sm">
                                <div className="text-xs text-slate-500">
                                    {t("transferContent")}
                                </div>
                                <div className="mt-1 font-semibold">
                                    {description}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleDownload}
                            disabled={isGenerating}
                        >
                            <Download className="h-4 w-4" />
                            {t("downloadImage")}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleShare}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Share2 className="h-4 w-4" />
                            )}
                            {t("shareImage")}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default VietQrCard;
