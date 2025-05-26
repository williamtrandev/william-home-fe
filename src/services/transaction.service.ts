import axiosInstance from "@/lib/axios";

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
    category: string;
    userId: string;
}

class TransactionService {
    async getTransactions() {
        const response = await axiosInstance.get<Transaction[]>(
            "/api/transactions"
        );
        return response.data;
    }

    async getTransaction(id: string) {
        const response = await axiosInstance.get<Transaction>(
            `/api/transactions/${id}`
        );
        return response.data;
    }

    async createTransaction(data: Omit<Transaction, "id" | "userId">) {
        const response = await axiosInstance.post<Transaction>(
            "/api/transactions",
            data
        );
        return response.data;
    }

    async updateTransaction(id: string, data: Partial<Transaction>) {
        const response = await axiosInstance.put<Transaction>(
            `/api/transactions/${id}`,
            data
        );
        return response.data;
    }

    async deleteTransaction(id: string) {
        await axiosInstance.delete(`/api/transactions/${id}`);
    }
}

export const transactionService = new TransactionService();
