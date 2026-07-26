import {
  PieChart,
  Pie,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { CategorySummary } from "@/types/api";
import EmptyState from "./EmptyState";

type CategoryPieChartProps = {
  summaryData: CategorySummary[];
  formatCurrency: (value: number) => string;
  isLoading: boolean;
};

const CATEGORY_COLORS = [
  "#3BB2F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

export default function CategoryPieChart({
  summaryData,
  formatCurrency,
  isLoading,
}: CategoryPieChartProps) {
  const chartData = summaryData.map((item, index) => ({
    ...item,
    fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    total: Number(item.total),
  }));

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold mb-4">
        Expenses by Category
      </h2>

      {isLoading ? (
        <div className="h-[350px]" />
      ) : summaryData.length === 0 ? (
        <div className="flex h-[350px] items-center">
          <div className="w-full">
            <EmptyState
              title="No category data"
              description="Add an expense or select a different date range."
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-10 xl:flex-row">
          <div className="w-full h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#3B82F6"
                  isAnimationActive={false}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {summaryData.map((item, index) => (
              <div
                key={item.category}
                className="flex items-center gap-2"
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                  }}
                />
                <div className="capitalize whitespace-nowrap">
                  {item.category}
                </div>
                <div className="font-semibold whitespace-nowrap">
                  ${formatCurrency(item.total)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}