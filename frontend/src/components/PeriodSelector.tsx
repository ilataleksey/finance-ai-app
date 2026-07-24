import type { PeriodId } from "@/utils/dateRange";

type PeriodSelectorProps = {
  period: PeriodId | null;
  onChange: (period: PeriodId) => void;
};

export const PERIODS: ReadonlyArray<{ id: PeriodId; title: string }> = [
  { id: "today", title: "Today" },
  { id: "week", title: "7 Days" },
  { id: "month", title: "Month" },
  { id: "year", title: "Year" },
  { id: "all", title: "All Time" },
];

export default function PeriodSelector({
  period,
  onChange,
}: PeriodSelectorProps) {
  return (
    <div
      aria-label="Quick date range"
      className="inline-flex max-w-full overflow-x-auto rounded-xl bg-gray-100 p-1 shadow-inner"
      role="group"
    >
      {PERIODS.map((item) => {
        const isSelected = period === item.id;

        return (
        <button
          key={item.id}
          type="button"
          aria-pressed={isSelected}
          onClick={() => onChange(item.id)}
          className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:px-4 ${
            isSelected
              ? "bg-blue-600 text-white shadow-sm"
              : "text-gray-700 hover:bg-white hover:text-gray-950"
          }`}
        >
          {item.title}
        </button>
        );
      })}
    </div>
  );
}
