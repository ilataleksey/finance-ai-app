

type DateFilterProps = {
  startDate: string;
  endDate: string;

  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
};

export default function DateFilter({
  startDate,
  endDate,

  setStartDate,
  setEndDate,
}: DateFilterProps) {
  return (
    <div className="flex items-end gap-4 mb-6">
      <div>
        <label className="block text-sm text-gray-500 mb-1">
          Start Date
        </label>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-500 mb-1">
          End Date
        </label>

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      <button
        onClick={() => {
          setStartDate("");
          setEndDate("");
        }}
        className="
          px-4
          py-2
          rounded-lg
          border
          border-gray-300
          bg-white
          hover:bg-gray-100
          transition
        "
      >
        Reset
      </button>
    </div>
  );
};
