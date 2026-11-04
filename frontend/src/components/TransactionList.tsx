import EmptyState from "@/components/EmptyState";

import type {
  TransactionFilter,
  TransactionItem,
} from "@/types/transactions";

type TransactionListProps = {
  transactions: TransactionItem[];
  filter: TransactionFilter;
  onFilterChange: (filter: TransactionFilter) => void;
  isLoading: boolean;
  formatCurrency: (value: number) => string;
  onDeleteExpense: (id: number) => void;
  deletingExpenseId: number | null;
  deleteError: {
    expenseId: number;
    message: string;
  } | null;
};

const filters: {
  value: TransactionFilter;
  label: string;
}[] = [
    { value: "all", label: "All" },
    { value: "income", label: "Income" },
    { value: "expense", label: "Expenses" },
  ];

export default function TransactionList({
  transactions,
  filter,
  onFilterChange,
  isLoading,
  formatCurrency,
  onDeleteExpense,
  deletingExpenseId,
  deleteError,
}: TransactionListProps) {
  return (
    <section
      className="rounded-xl bg-white p-4 shadow"
      aria-busy={isLoading}
      aria-labelledby="transactions-heading"
    >
      <h2
        id="transactions-heading"
        className="mb-4 text-lg font-semibold"
      >
        Transactions
      </h2>

      <div
        className="mb-4 flex flex-wrap gap-2"
        role="group"
        aria-label="Filter transactions"
      >
        {filters.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={filter === item.value}
            onClick={() => onFilterChange(item.value)}
            className={`rounded-lg px-3 py-2 text-sm ${filter === item.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <p
            className="py-6 text-center text-sm text-gray-500"
            role="status"
          >
            Loading transactions…
          </p>
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description="Add a transaction or change the type or date filters."
          />
        ) : (
          transactions.map((transaction) => {
            const isIncome = transaction.type === "income";

            const rowError =
              !isIncome &&
                deleteError?.expenseId === transaction.id
                ? deleteError.message
                : null;

            return (
              <div
                key={`${transaction.type}-${transaction.id}`}
                className="flex items-center justify-between gap-3 border-b py-3"
              >
                <div className="min-w-0">
                  <div className="break-words font-medium">
                    {transaction.description}
                  </div>

                  <div className="text-sm text-gray-500">
                    {isIncome ? "Income" : "Expense"}
                    {transaction.categoryName
                      ? ` · ${transaction.categoryName}`
                      : ""}
                  </div>

                  <div className="text-sm text-gray-500">
                    {transaction.createdAt.split("T")[0]}
                  </div>

                  {rowError && (
                    <p
                      className="mt-1 text-sm text-red-700"
                      role="alert"
                    >
                      {rowError}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col items-end gap-2">
                  <div
                    className={`font-medium ${isIncome ? "text-green-700" : "text-red-700"
                      }`}
                  >
                    {isIncome ? "+" : "−"}$
                    {formatCurrency(transaction.amount)}
                  </div>

                  {!isIncome && (
                    <button
                      type="button"
                      onClick={() => onDeleteExpense(transaction.id)}
                      disabled={deletingExpenseId !== null}
                      aria-label={`Delete expense: ${transaction.description}`}
                      className="text-sm text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingExpenseId === transaction.id
                        ? "Deleting…"
                        : "Delete"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}