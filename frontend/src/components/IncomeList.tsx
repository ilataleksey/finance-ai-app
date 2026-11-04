import type { IncomeItem } from "@/types/api";
import EmptyState from "@/components/EmptyState";

type IncomeListProps = {
  incomes: IncomeItem[];
  isLoading: boolean;
  formatCurrency: (value: number) => string;
};

export default function IncomeList({
  incomes,
  isLoading,
  formatCurrency,
}: IncomeListProps) {
  return (
    <div
      className="max-h-[400px] overflow-y-auto rounded-xl bg-white p-4 shadow"
      aria-busy={isLoading}
    >
      <h2 className="mb-4 text-lg font-semibold">Income</h2>

      {isLoading ? (
        <p
          className="py-6 text-center text-sm text-gray-500"
          role="status"
        >
          Loading income…
        </p>
      ) : incomes.length === 0 ? (
        <EmptyState
          title="No income found"
          description="Add income or select a different date range."
        />
      ) : (
        incomes.map((income) => (
          <div
            key={income.id}
            className="flex items-center justify-between gap-3 border-b py-2"
          >
            <div className="min-w-0">
              <div className="break-words font-medium">
                {income.source}
              </div>

              <div className="text-sm text-gray-500">
                {income.created_at.split("T")[0]}
              </div>
            </div>

            <div className="shrink-0 font-medium text-green-700">
              +${formatCurrency(income.amount)}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
