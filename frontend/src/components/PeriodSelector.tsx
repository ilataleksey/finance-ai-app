type PeriodSelectorProps = {
  period: string;
  setPeriod: (value: string) => void;
};

export const PERIODS = [
  { id: "today", title: "Today" },
  { id: "week", title: "7 Days" },
  { id: "month", title: "Month" },
  { id: "year", title: "Year" },
  { id: "all", title: "All Time" },
]

export default function PeriodSelector({
  period,
  setPeriod,
}: PeriodSelectorProps) {

  return (

    <div className="inline-flex rounded-xl bg-gray-200 p-1">

      {PERIODS.map((item) => (

        <button
          key={item.id}
          onClick={() => setPeriod(item.id)}
          className={`
                        px-4
                        py-2
                        rounded-lg
                        transition-all
                        duration-300
                        ease-in-out

                        ${period === item.id
              ? "bg-blue-600 text-white shadow"
              : "text-gray-700 hover:bg-gray-300"
            }
                    `}
        >

          {item.title}

        </button>

      ))}

    </div>

  );

}