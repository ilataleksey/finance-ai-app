import type { ExpenseItem } from "@/types/api";

type ExpenseListProp = {
  expenses: ExpenseItem[];
  formatCurrency: (value: number) => string;
  onDelete: (id: number) => void;
};

export default function ExpenseList({
  expenses,
  formatCurrency,
  onDelete,
}: ExpenseListProp) {
  return (
    <div className="bg-white p-4 rounded-xl shadow max-h-[400px] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Expenses</h2>

      {expenses.map((e) => (
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
            </div>
          </div>

          <div className="flex items-center gap-2">

          </div>

          <div className="flex items-center gap-3">
            <div>${formatCurrency(e.amount)}</div>

            <button
              onClick={() => onDelete(e.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
