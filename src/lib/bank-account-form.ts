import type { BankAccount } from "@/services/auth.service";
import { getVietnamBankByCode } from "@/lib/vietnamBanks";

export const emptyBankAccount: BankAccount = {
    bankCode: "",
    bankName: "",
    accountNo: "",
    accountName: "",
};

/** Normalize API/local data; drop unknown bank codes so Radix Select stays valid. */
export function normalizeBankAccount(raw: BankAccount | null | undefined): BankAccount {
    if (!raw) return { ...emptyBankAccount };

    const bank = raw.bankCode ? getVietnamBankByCode(raw.bankCode) : undefined;

    return {
        bankCode: bank?.code ?? "",
        bankName: bank?.shortName ?? "",
        accountNo: String(raw.accountNo ?? "")
            .replace(/\D/g, "")
            .slice(0, 20),
        accountName: String(raw.accountName ?? "").toUpperCase(),
    };
}
