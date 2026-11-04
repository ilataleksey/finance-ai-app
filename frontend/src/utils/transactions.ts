import type { ExpenseItem, IncomeItem } from "@/types/api";
import type { TransactionItem } from "@/types/transactions";

export function buildTransactions(
    expenses: ExpenseItem[],
    incomes: IncomeItem[],
): TransactionItem[] {
    const expenseTransactions: TransactionItem[] = expenses.map(
        (expense) => ({
            id: expense.id,
            type: "expense",
            description: expense.title,
            amount: expense.amount,
            createdAt: expense.created_at,
            categoryName: expense.category?.name,
        }),
    );

    const incomeTransactions: TransactionItem[] = incomes.map(
        (income) => ({
            id: income.id,
            type: "income",
            description: income.source,
            amount: income.amount,
            createdAt: income.created_at,
        }),
    );

    return [...expenseTransactions, ...incomeTransactions].sort(
        (first, second) => {
            const dateDifference =
                new Date(second.createdAt).getTime() -
                new Date(first.createdAt).getTime();

            if (dateDifference !== 0) {
                return dateDifference;
            }

            if (first.type !== second.type) {
                return first.type === "income" ? -1 : 1;
            }

            return second.id - first.id;
        },
    );
}