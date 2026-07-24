

type DateFilterProps = {
  startDate: string;
  endDate: string;

  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onReset: () => void;
};

export default function DateFilter({
  startDate,
  endDate,

  onStartDateChange,
  onEndDateChange,
  onReset,
}: DateFilterProps) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-4">
      <div>
        <label className="mb-1 block text-sm text-gray-500">
          Start Date
        </label>

        <input
          type="date"
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
          className="rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm text-gray-500">
          End Date
        </label>

        <input
          type="date"
          value={endDate}
          onChange={(event) => onEndDateChange(event.target.value)}
          className="rounded-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <button
        type="button"
        onClick={onReset}
        className="rounded-lg border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Reset
      </button>
    </div>
  );
};
