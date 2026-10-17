import type { ExpenseItem } from "@/types/api";
import EmptyState from "./EmptyState";

type ExpenseListProp = {
  expenses: ExpenseItem[];
  formatCurrency: (value: number) => string;
  onDelete: (id: number) => void;
  isLoading: boolean;
  deletingExpenseId: number | null;
  deleteError: {
    expenseId: number;
    message: string;
  } | null;
};

export default function ExpenseList({
  expenses,
  formatCurrency,
  onDelete,
  isLoading,
  deletingExpenseId,
  deleteError,
}: ExpenseListProp) {
  return (
    <div
      className="bg-white p-4 rounded-xl shadow max-h-[400px] overflow-y-auto"
      aria-busy={isLoading}
    >
      <h2 className="text-lg font-semibold mb-4">Expenses</h2>

      {isLoading ? (
        <div className="py-6 text-center text-sm text-gray-500" role="status">
          Loading expenses...
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          title="No expenses found"
          description="Add an expense or select a different date range."
        />
      ) : (
        expenses.map((e) => (
          <div
            key={e.id}
            className="flex justify-between items-center border-b py-2"
          >
            <div>
              <div className="font-medium">{e.title}</div>
              <div className="text-sm text-gray-500">
                {e.category?.name}
              </div>
              <div className="text-sm text-gray-500">
                {e.created_at.split("T")[0]}
                {deleteError?.expenseId === e.id && (
                  <p className="mt-1 text-sm text-red-700" role="alert">
                    {deleteError.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div>${formatCurrency(e.amount)}</div>

              <button
                type="button"
                onClick={() => onDelete(e.id)}
                disabled={deletingExpenseId !== null}
                className="text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingExpenseId === e.id ? "Удаление…" : "Delete"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
