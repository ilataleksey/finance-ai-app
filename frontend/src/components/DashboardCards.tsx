import type { DashboardCardProps } from "@/types/dashboard";
import { formatDisplayName } from "@/utils/formatDisplayName";

export default function DashboardCards({
  stats,
  balance,
  incomeForPeriod,
  isLoading,
  formatCurrency,
}: DashboardCardProps) {
  const money = (value: number) =>
    `${value < 0 ? "−" : ""}$${formatCurrency(Math.abs(value))}`;

  const netCashFlow = stats
    ? incomeForPeriod - stats.total_expenses
    : null;

  const cards = [
    {
      label: "All-time balance",
      value: balance ? money(balance.balance) : "—",
    },
    {
      label: "Income for period",
      value: stats ? money(incomeForPeriod) : "—",
    },
    {
      label: "Expenses for period",
      value: stats ? money(stats.total_expenses) : "—",
    },
    {
      label: "Net cash flow for period",
      value: netCashFlow === null ? "—" : money(netCashFlow),
    },
    {
      label: "Expense count",
      value: stats ? formatCurrency(stats.transactions_count) : "—",
    },
    {
      label: "Average daily expenses",
      value: stats ? money(stats.avg_per_day) : "—",
    },
    {
      label: "Top expense category",
      value: stats?.top_category
        ? formatDisplayName(stats.top_category)
        : "—",
    },
  ];

  return (
    <div
      className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4"
      aria-busy={isLoading}
    >
      {cards.map(({ label, value }) => (
        <div key={label} className="rounded-xl bg-white p-4 shadow">
          <div className="text-sm text-gray-500">{label}</div>
          <div className="mt-2 text-2xl font-bold">
            {isLoading ? "—" : value}
          </div>
        </div>
      ))}
    </div>
  );
}