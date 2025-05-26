
export interface Expense {
  id: string;
  amount: number;
  purpose: string;
  date: string;
  memberName: string;
  memberId: string;
}

export interface MonthlyExpenses {
  month: number;
  year: number;
  expenses: Expense[];
  isFinalized: boolean;
}
