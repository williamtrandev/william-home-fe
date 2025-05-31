import axiosInstance from "@/lib/axios";

export interface CreateExpenseDto {
    houseId: string;
    purpose: string;
    amount: number;
}

export interface Expense {
    _id: string;
    house: string;
    createdBy: {
        _id: string;
        email: string;
        name: string;
        picture: string;
    };
    purpose: string;
    amount: number;
    isSettled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

export interface GetExpensesResponse {
    expenses: Expense[];
    pagination: PaginationInfo;
}

interface GrowthStats {
    totalAmountGrowth: string;
    totalExpensesGrowth: string;
    avgExpenseGrowth: string;
    avgPerPersonGrowth: string;
}

interface ExpenseStatistics {
    month: number;
    year: number;
    totalAmount: number;
    totalExpenses: number;
    avgExpense: number;
    avgPerPerson: number;
    memberCount: number;
    growthStats: GrowthStats;
}

interface PaymentResult {
    totalAmount: number;
    totalExpenses: number;
    avgExpense: number;
    avgPerPerson: number;
    amountPerPerson: Array<{
        user: {
            _id: string;
            email: string;
            name: string;
            picture: string;
        };
        amount: number;
    }>;
    transactions: Array<{
        from: {
            _id: string;
            email: string;
            name: string;
            picture: string;
        };
        to: {
            _id: string;
            email: string;
            name: string;
            picture: string;
        };
        amount: number;
    }>;
}

class ExpenseService {
    private readonly HOUSE_ID = "6834a4135d5b4d1a5a661152";

    async createExpense(data: Omit<CreateExpenseDto, "houseId">) {
        try {
            const response = await axiosInstance.post("/api/expenses", {
                houseId: this.HOUSE_ID,
                ...data,
            });
            return response.data;
        } catch (error) {
            console.error("Error creating expense:", error);
            throw error;
        }
    }

    async getExpenses(
        page: number = 1,
        limit: number = 10
    ): Promise<GetExpensesResponse> {
        try {
            const response = await axiosInstance.get(
                `/api/expenses/house/${this.HOUSE_ID}`,
                {
                    params: {
                        page,
                        limit,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error fetching expenses:", error);
            throw error;
        }
    }

    async getStatistics(): Promise<ExpenseStatistics> {
        const response = await axiosInstance.get(
            `/api/expenses/house/${this.HOUSE_ID}/statistics`
        );
        return response.data;
    }

    async calculatePayments(): Promise<PaymentResult> {
        try {
            const response = await axiosInstance.post(
                `/api/expenses/calculate/${this.HOUSE_ID}`
            );
            return response.data;
        } catch (error) {
            console.error("Error calculating payments:", error);
            throw error;
        }
    }
}

export const expenseService = new ExpenseService();
