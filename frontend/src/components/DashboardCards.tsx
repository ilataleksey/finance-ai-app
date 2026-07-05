import { DashboardCardProps } from "@/types/dashboard";

export default function DashboardCards({
  stats,
  balance,
  formatCurrency,
}: DashboardCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">

      <div className="bg-white p-4 rounded-xl shadow">
        <div className="text-sm text-gray-500">Balance</div>
        <div className="text-2xl font-bold mt-2">
          ${formatCurrency(balance?.balance ?? 0)}
        </div>
      </div>


      <div className="bg-white p-4 rounded-xl shadow">
        <div className="text-sm text-gray-500">Total Expenses</div>
        <div className="text-2xl font-bold mt-2">
          ${formatCurrency(stats?.total_expenses ?? 0)}
        </div>
      </div>


      <div className="bg-white p-4 rounded-xl shadow">
        <div className="text-sm text-gray-500">Transactions</div>
        <div className="text-2xl font-bold mt-2">
          {formatCurrency(stats?.transactions_count ?? 0)}
        </div>
      </div>


      <div className="bg-white p-4 rounded-xl shadow">
        <div className="text-sm text-gray-500">Avr Per Day</div>
        <div className="text-2xl font-bold mt-2">
          ${formatCurrency(stats?.avg_per_day ?? 0)}
        </div>
      </div>


      <div className="bg-white p-4 rounded-xl shadow">
        <div className="text-sm text-gray-500">Top Category</div>
        <div className="text-2xl font-bold mt-2">
          {stats?.top_category ?? "-"}
        </div>
      </div>
    </div>
  );
}
