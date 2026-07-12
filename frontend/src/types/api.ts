export type Category = {
    id: number;
    name: string;
};

export type ExpenseItem = {
    id: number;
    title: string;
    amount: number;
    created_at: string;
    category: Category;
};

export type BudgetStatus = {
    category: string;
    budget: number;
    spent: number;
    percent: number;
};

export type DailyExpense = {
    date: string;
    total: number;
};

export type CategorySummary = {
    category: string;
    total: number;
};

export type Stats = {
    total_expenses: number;
    transactions_count: number;
    avg_per_day: number;
    top_category: string;
};

export type Balance = {
    balance: number;
};
