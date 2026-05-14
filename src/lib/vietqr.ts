import type { BankAccount } from "@/services/auth.service";

export const buildVietQrUrl = ({
    bankAccount,
    amount,
    description,
}: {
    bankAccount?: BankAccount | null;
    amount: number;
    description: string;
}) => {
    if (!bankAccount?.bankCode || !bankAccount.accountNo) return null;

    const bankCode = encodeURIComponent(bankAccount.bankCode);
    const accountNo = encodeURIComponent(bankAccount.accountNo);
    const query = new URLSearchParams({
        amount: String(Math.round(amount)),
        addInfo: description.slice(0, 80),
        accountName: bankAccount.accountName,
    });

    return `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png?${query.toString()}`;
};
