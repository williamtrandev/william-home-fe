import { useMemo, useState, type FormEvent } from "react";
import { Banknote, Loader2, ShieldCheck } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    authService,
    type BankAccount as BankAccountDetails,
} from "@/services/auth.service";
import { getVietnamBankByCode, VIETNAM_BANKS } from "@/lib/vietnamBanks";

const emptyBankAccount: BankAccountDetails = {
    bankCode: "",
    bankName: "",
    accountNo: "",
    accountName: "",
};

const BankAccount = () => {
    const { t } = useLanguage();
    const { user, setUser } = useAuth();
    const initialBankAccount = authService.getBankAccount();
    const [form, setForm] = useState<BankAccountDetails>(
        initialBankAccount ?? emptyBankAccount
    );
    const [isSaving, setIsSaving] = useState(false);

    const selectedBank = useMemo(
        () => getVietnamBankByCode(form.bankCode),
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
        const bank = getVietnamBankByCode(bankCode);
        setForm((prev) => ({
            ...prev,
            bankCode,
            bankName: bank?.shortName ?? "",
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
            setForm(bankAccount);
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
        <div className="container mx-auto p-4 sm:p-6 space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {t("bankAccount")}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t("bankAccountDescription")}
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
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label>{t("bank")}</Label>
                                <Select
                                    value={form.bankCode}
                                    onValueChange={handleBankChange}
                                    disabled={isSaving}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue
                                            placeholder={t("selectVietnamBank")}
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {VIETNAM_BANKS.map((bank) => (
                                            <SelectItem
                                                key={bank.code}
                                                value={bank.code}
                                            >
                                                {bank.shortName} ({bank.code})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                    </CardContent>
                </Card>

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
            </div>
        </div>
    );
};

export default BankAccount;
