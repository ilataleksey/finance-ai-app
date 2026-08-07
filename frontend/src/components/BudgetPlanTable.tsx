import type { BudgetPlan } from "@/types/api";
import { formatCurrency } from "@/utils/formatCurrency";
import { isFutureMonth, MONTH_LABELS } from "@/utils/months";

type BudgetPlanTableProps = {
  plan: BudgetPlan;
}

function getPercentColor(percent: number): string {
  if (percent > 100) {
    return "text-red-600";
  }

  if (percent >= 80) {
    return "text-yellow-700";
  }

  return "text-green-700";
}

export default function BudgetPlanTable({
  plan,
}: BudgetPlanTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-[1180px] w-full border-collapse text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="sticky left-0 z-20 min-w-40 border-b border-r border-gray-200 bg-gray-50 px-4 py-3">
              Category
            </th>

            {MONTH_LABELS.map((label) => (
              <th key={label} className="min-w-28 border-b border-gray-200 px-3 py-3 text-right">
                {label}
              </th>
            ))}

            <th className="min-w-32 border-b border-l border-gray-200 px-4 py-3 text-right">
              Annual plan
            </th>
          </tr>
        </thead>

        <tbody>
          {plan.categories.map(({ category, months }) => {
            const annualPlanned = months.reduce(
              (total, period) => total + (period.planned ?? 0),
              0,
            );

            const annualActual = months.reduce(
              (total, period) => total + period.actual,
              0,
            );

            return (
              <tr key={category.id} className="border-b border-gray-100 last:border-b-0">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-gray-200 bg-white px-4 py-3 text-left font-medium text-gray-900"
                >
                  {category.name}
                </th>

                {months.map((period) => {
                  const isFuture = isFutureMonth(plan.year, period.month);

                  return (
                    <td key={period.month} className="px-3 py-3 align-top text-right">
                      <div className="min-h-7 px-1 font-medium text-gray-900">
                        {period.planned === null ? "—" : `$${formatCurrency(period.planned)}`}
                      </div>

                      {!isFuture && (period.planned !== null || period.actual > 0) && (
                        <div className="mt-1 text-xs text-gray-500">
                          Actual ${formatCurrency(period.actual)}
                          {period.percent !== null && (
                            <span className={`ml-1 font-medium ${getPercentColor(period.percent)}`}>
                              {period.percent}%
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}

                <td className="border-l border-gray-200 px-4 py-3 text-right align-top">
                  <div className="font-semibold text-gray-900">${formatCurrency(annualPlanned)}</div>
                  <div className="mt-1 text-xs text-gray-500">Actual ${formatCurrency(annualActual)}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
