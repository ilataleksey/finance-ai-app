import { PERIODS } from "@/constants/periods";

type DateFilterProps = {
  startDate: string;
  endDate: string;
  period: string;

  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setPeriod: (value: string) => void;
};

export default function DateFilter({
  startDate,
  endDate,
  period,

  setStartDate,
  setEndDate,
  setPeriod,
}: DateFilterProps) {
  return (
    <div>
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
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Reset
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {PERIODS.map((item) => (
          <button
            key={item.id}
            onClick={() => setPeriod(item.id)}
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
};
