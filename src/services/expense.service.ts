import axiosInstance from "@/lib/axios";
import {
    inferCategoryFromText,
    type CategoryKey,
} from "@/lib/categories";

export interface CreateExpenseDto {
    houseId: string;
    purpose: string;
    amount: number;
    category?: CategoryKey;
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
    /** Server may return a retired enum value; treat as string on read. */
    category?: CategoryKey | string;
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

export interface CategoryBreakdownRow {
    /**
     * Server can return legacy strings (e.g. expenses created when the enum
     * had more values). Consumers must run the payload through
     * `normalizeBreakdown` before rendering — that collapses unknown keys
     * into OTHER and re-narrows the type.
     */
    category: CategoryKey | string;
    total: number;
    count: number;
    percentage: number;
}

export interface ExpenseStatistics {
    month: number;
    year: number;
    totalAmount: number;
    totalExpenses: number;
    avgExpense: number;
    avgPerPerson: number;
    memberCount: number;
    growthStats: GrowthStats;
    byCategory?: CategoryBreakdownRow[];
}

export type AnalyticsPeriod = "currentMonth" | "lastMonth" | "allTime";

export interface MyAnalyticsRecentExpense {
    _id: string;
    purpose: string;
    amount: number;
    /** May be a retired category string — render via `getCategoryMeta`. */
    category: CategoryKey | string;
    createdAt: string;
    isSettled: boolean;
}

export interface MyAnalytics {
    period: AnalyticsPeriod;
    /** Sum of expenses created by the current user in the period. */
    totalSpent: number;
    myCount: number;
    /** Sum of all house expenses in the period. */
    houseTotal: number;
    houseCount: number;
    memberCount: number;
    /** Fair share per person = houseTotal / memberCount. */
    share: number;
    /** totalSpent - share. Positive = others owe you, negative = you owe. */
    balance: number;
    byCategory: CategoryBreakdownRow[];
    recent: MyAnalyticsRecentExpense[];
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

export interface ParsedQuickInput {
    amount: number;
    purpose: string;
    category: CategoryKey;
}

class ExpenseService {
    private readonly HOUSE_ID = "6834a4135d5b4d1a5a661152";

    /**
     * Parse quick-add syntax like:
     *   "+50k coffee"           → { amount: 50000, purpose: "coffee", category: FOOD }
     *   "120k di cho"           → { amount: 120000, purpose: "di cho", category: GROCERIES }
     *   "1.5m rent"             → { amount: 1500000, purpose: "rent", category: RENT }
     *   "200 utilities"         → { amount: 200, purpose: "utilities", category: UTILITIES }
     *
     * Returns null when no amount can be extracted.
     */
    parseQuickInput(raw: string): ParsedQuickInput | null {
        if (!raw) return null;
        const trimmed = raw.trim().replace(/^\+/, "");
        // Match a leading number with optional decimal + optional k/m suffix.
        const match = trimmed.match(/^([\d.,]+)\s*([kKmM]?)\s*(.*)$/);
        if (!match) return null;

        const rawNum = match[1].replace(/,/g, "");
        const suffix = match[2].toLowerCase();
        const purpose = match[3].trim();

        const base = Number(rawNum);
        if (!Number.isFinite(base) || base <= 0) return null;

        const multiplier = suffix === "k" ? 1_000 : suffix === "m" ? 1_000_000 : 1;
        const amount = Math.round(base * multiplier);

        if (!purpose) return null;

        return {
            amount,
            purpose,
            category: inferCategoryFromText(purpose),
        };
    }

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

    async getMyAnalytics(
        period: AnalyticsPeriod = "currentMonth"
    ): Promise<MyAnalytics> {
        const response = await axiosInstance.get(
            "/api/expenses/analytics/me",
            {
                params: { houseId: this.HOUSE_ID, period },
            }
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

    async updateExpense(
        expenseId: string,
        data: { purpose: string; amount: number; category?: CategoryKey }
    ) {
        try {
            const response = await axiosInstance.put(
                `/api/expenses/${expenseId}`,
                {
                    houseId: this.HOUSE_ID,
                    ...data,
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error updating expense:", error);
            throw error;
        }
    }
}

export const expenseService = new ExpenseService();
