import type { BudgetStatus } from "@/types/api";

type BudgetSectionProps = {
  budgetStatus: BudgetStatus[];
  formatCurrency: (value: number) => string;
};

function getBudgetBarColor(percent: number): string {
  if (percent > 100) {
    return "bg-red-500";
  }

  if (percent >= 80) {
    return "bg-yellow-500";
  }

  return "bg-green-500";
}

export default function BudgetSection({
  budgetStatus,
  formatCurrency,
}: BudgetSectionProps) {
  return (
    <section className="mt-8 bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">
        Category Budgets
      </h2>

      {budgetStatus.length === 0 ? (
        <div className="text-gray-500 text-sm">
          No budgets yet
        </div>
      ) : (
        <div className="space-y-4">
          {budgetStatus.map((item) => {
            const barWidth = Math.min(item.percent, 100);

            return (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1 gap-4">
                  <div className="font-medium capitalize">
                    {item.category}
                  </div>

                  <div className="text-sm text-gray-600 whitespace-nowrap">
                    ${formatCurrency(item.spent)} / ${formatCurrency(item.budget)} (
                    {item.percent}%)
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className={`h-3 rounded-full ${getBudgetBarColor(item.percent)}`}
                    style={{
                      width: `${barWidth}%`,
                    }}
                  />
                </div>

                {item.percent > 100 && (
                  <div className="text-xs text-red-500 mt-1">
                    Budget exceeded
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}