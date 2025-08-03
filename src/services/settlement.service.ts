import axiosInstance from "@/lib/axios";

export interface Settlement {
    _id: string;
    totalAmount: number;
    totalExpenses: number;
    createdAt: string;
    createdBy: {
        _id: string;
        email: string;
        name: string;
        picture?: string;
    };
}

export interface Expense {
    _id: string;
    house: string;
    createdBy: {
        _id: string;
        email: string;
        name: string;
        picture?: string;
    };
    purpose: string;
    amount: number;
    isSettled: boolean;
    createdAt: string;
    updatedAt: string;
    settledAt?: string;
}

export interface SettlementDetail extends Settlement {
    avgExpense: number;
    avgPerPerson: number;
    amountPerPerson: Array<{
        user: string;
        amount: number;
        _id: string;
    }>;
    transactions: Array<{
        from: {
            _id: string;
            email: string;
            name: string;
            picture?: string;
        };
        to: {
            _id: string;
            email: string;
            name: string;
            picture?: string;
        };
        amount: number;
        _id: string;
    }>;
    createdBy: {
        _id: string;
        email: string;
        name: string;
        picture?: string;
    };
    expenses: Expense[];
}

export interface SettlementsResponse {
    settlements: Settlement[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
    };
}

class SettlementService {
    private baseUrl = "/api";

    async getSettlements(page: number = 1): Promise<SettlementsResponse> {
        try {
            const response = await axiosInstance.get(`${this.baseUrl}/settlements`, {
                params: { page },
            });
            return response.data;
        } catch (error) {
            console.error("Error fetching settlements:", error);
            throw error;
        }
    }

    async getSettlementDetail(id: string): Promise<SettlementDetail> {
        try {
            const response = await axiosInstance.get(
                `${this.baseUrl}/settlements/${id}`
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching settlement detail:", error);
            throw error;
        }
    }
}

export const settlementService = new SettlementService();
