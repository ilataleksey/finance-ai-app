import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import DateFilters from "@/components/DateFilters";
import PeriodSelector from "@/components/PeriodSelector";
import type { PeriodId } from "@/utils/dateRange";
import type { DailyExpense } from "@/types/api";

type ChartSectionProps = {
  chartData: DailyExpense[];
  startDate: string;
  endDate: string;
  period: PeriodId | null;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onReset: () => void;
  onPeriodChange: (period: PeriodId) => void;
};

export default function ChartSection({
  chartData,
  startDate,
  endDate,
  period,
  onStartDateChange,
  onEndDateChange,
  onReset,
  onPeriodChange,
}: ChartSectionProps) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold">Daily Expenses</h2>

      {/* FILTERS */}
      <DateFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
        onReset={onReset}
      />

      <PeriodSelector
        period={period}
        onChange={onPeriodChange}
      />

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}