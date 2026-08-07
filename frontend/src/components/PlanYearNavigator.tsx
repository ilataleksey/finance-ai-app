import { MAX_PLAN_YEAR, MIN_PLAN_YEAR } from "@/utils/months";

type PlanYearNavigatorProps = {
  year: number;
  onYearChange: (year: number) => void;
};

export default function PlanYearNavigator({
  year,
  onYearChange,
}: PlanYearNavigatorProps) {
  return (
    <div className="flex items-center gap-3" aria-label="Plan year">
      <button
        type="button"
        onClick={() => onYearChange(year - 1)}
        disabled={year <= MIN_PLAN_YEAR}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Previous year"
      >
        ←
      </button>

      <span className="min-w-16 text-center text-xl font-semibold">{year}</span>

      <button
        type="button"
        onClick={() => onYearChange(year + 1)}
        disabled={year >= MAX_PLAN_YEAR}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Next year"
      >
        →
      </button>
    </div>
  );
}
