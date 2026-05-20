import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Banknote, Bell, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import NotificationSettings from "@/components/settings/NotificationSettings";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { normalizeBankAccount } from "@/lib/bank-account-form";
import { cn } from "@/lib/utils";
import { getVietnamBankByCode, VIETNAM_BANKS } from "@/lib/vietnamBanks";
import {
    authService,
    type BankAccount as BankAccountDetails,
} from "@/services/auth.service";

const BankAccount = () => {
    const { t } = useLanguage();
    const { user, setUser } = useAuth();
    const isMobile = useIsMobile();
    const [form, setForm] = useState<BankAccountDetails>(() =>
        normalizeBankAccount(authService.getBankAccount())
    );
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const profile = await authService.fetchProfile();
                if (!cancelled) {
                    setForm(normalizeBankAccount(profile.bankAccount));
                }
            } catch (error) {
                console.error("Failed to load profile:", error);
                if (!cancelled) {
                    toast.error(t("bankAccountLoadFailed"));
                }
            } finally {
                if (!cancelled) {
                    setIsLoadingProfile(false);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [t]);

    const selectedBank = useMemo(
        () => (form.bankCode ? getVietnamBankByCode(form.bankCode) : undefined),
        [form.bankCode]
    );

    const accountNoError =
        form.accountNo && !/^\d{6,20}$/.test(form.accountNo)
            ? t("bankAccountNoInvalid")
            : "";

    const canSave =
        !!form.bankCode &&
        /^\d{6,20}$/.test(form.accountNo) &&
        form.accountName.trim().length >= 2 &&
        !isSaving;

    const handleBankChange = (bankCode: string) => {
        if (!bankCode) return;
        const bank = getVietnamBankByCode(bankCode);
        if (!bank) return;
        setForm((prev) => ({
            ...prev,
            bankCode: bank.code,
            bankName: bank.shortName,
        }));
    };

    const handleAccountNoChange = (value: string) => {
        setForm((prev) => ({
            ...prev,
            accountNo: value.replace(/\D/g, "").slice(0, 20),
        }));
    };

    const handleAccountNameChange = (value: string) => {
        setForm((prev) => ({
            ...prev,
            accountName: value.toUpperCase(),
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!canSave) {
            toast.error(t("bankAccountInvalid"));
            return;
        }

        try {
            setIsSaving(true);
            const payload = {
                ...form,
                accountName: form.accountName.trim(),
            };
            const bankAccount = await authService.updateBankAccount(payload);
            setForm(normalizeBankAccount(bankAccount));
            setUser(
                user
                    ? {
                          ...user,
                          bankAccount,
                      }
                    : user
            );
            toast.success(t("bankAccountUpdated"));
        } catch (error) {
            console.error("Failed to update bank account:", error);
            toast.error(t("bankAccountUpdateFailed"));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            className="container mx-auto p-4 sm:p-6 space-y-6"
            data-protected-form
        >
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {t("bankAccountAndSettings")}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t("bankAccountPageDescription")}
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
                <Card className="border border-border shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Banknote className="h-5 w-5 text-primary" />
                            {t("bankAccountDetails")}
                        </CardTitle>
                        <CardDescription>
                            {t("bankAccountDetailsDescription")}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingProfile ? (
                            <div className="space-y-5">
                                <Skeleton className="h-11 w-full" />
                                <Skeleton className="h-11 w-full" />
                                <Skeleton className="h-11 w-full" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                        ) : (
                        <form
                            data-protected-form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="bankCode">{t("bank")}</Label>
                                {isMobile ? (
                                    <select
                                        id="bankCode"
                                        value={form.bankCode}
                                        onChange={(e) =>
                                            handleBankChange(e.target.value)
                                        }
                                        disabled={isSaving}
                                        className={cn(
                                            "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-base",
                                            "ring-offset-background focus-visible:outline-none focus-visible:ring-2",
                                            "focus-visible:ring-ring focus-visible:ring-offset-2",
                                            "disabled:cursor-not-allowed disabled:opacity-50"
                                        )}
                                    >
                                        <option value="" disabled>
                                            {t("selectVietnamBank")}
                                        </option>
                                        {VIETNAM_BANKS.map((bank) => (
                                            <option
                                                key={bank.code}
                                                value={bank.code}
                                            >
                                                {bank.shortName} ({bank.code})
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <Select
                                        value={form.bankCode || undefined}
                                        onValueChange={handleBankChange}
                                        disabled={isSaving}
                                    >
                                        <SelectTrigger
                                            className="h-11"
                                            id="bankCode"
                                        >
                                            <SelectValue
                                                placeholder={t(
                                                    "selectVietnamBank"
                                                )}
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {VIETNAM_BANKS.map((bank) => (
                                                <SelectItem
                                                    key={bank.code}
                                                    value={bank.code}
                                                >
                                                    {bank.shortName} (
                                                    {bank.code})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                {selectedBank && (
                                    <p className="text-xs text-muted-foreground">
                                        {selectedBank.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accountNo">
                                    {t("accountNo")}
                                </Label>
                                <Input
                                    id="accountNo"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    value={form.accountNo}
                                    onChange={(e) =>
                                        handleAccountNoChange(e.target.value)
                                    }
                                    placeholder={t("accountNoPlaceholder")}
                                    disabled={isSaving}
                                    className="h-11"
                                />
                                {accountNoError ? (
                                    <p className="text-xs font-medium text-destructive">
                                        {accountNoError}
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        {t("accountNoDescription")}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accountName">
                                    {t("accountName")}
                                </Label>
                                <Input
                                    id="accountName"
                                    autoComplete="name"
                                    value={form.accountName}
                                    onChange={(e) =>
                                        handleAccountNameChange(e.target.value)
                                    }
                                    placeholder={t("accountNamePlaceholder")}
                                    disabled={isSaving}
                                    className="h-11"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t("accountNameDescription")}
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={!canSave}
                                className="w-full sm:w-auto"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {t("saving")}
                                    </>
                                ) : (
                                    t("saveChanges")
                                )}
                            </Button>
                        </form>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <Card className="border border-border bg-muted/30 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">
                                {t("bankAccountPreview")}
                            </CardTitle>
                            <CardDescription>
                                {t("bankAccountPreviewDescription")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <div className="text-xs text-muted-foreground">
                                            {t("bank")}
                                        </div>
                                        <div className="mt-1 font-semibold text-foreground">
                                            {form.bankName || "-"}
                                        </div>
                                    </div>
                                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                                        <Banknote className="h-5 w-5" />
                                    </div>
                                </div>
                                <div className="mt-5 space-y-3">
                                    <div>
                                        <div className="text-xs text-muted-foreground">
                                            {t("accountNo")}
                                        </div>
                                        <div className="mt-1 font-mono text-lg font-bold tracking-wide text-foreground">
                                            {form.accountNo || "0000000000"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground">
                                            {t("accountName")}
                                        </div>
                                        <div className="mt-1 font-semibold text-foreground">
                                            {form.accountName || "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
                                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <p>{t("bankAccountSecurityNote")}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card
                        className="border border-border shadow-sm"
                        data-protected-form
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Bell className="h-5 w-5 text-primary" />
                                {t("notifications")}
                            </CardTitle>
                            <CardDescription>
                                {t("notificationsDescription")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <NotificationSettings />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BankAccount;
