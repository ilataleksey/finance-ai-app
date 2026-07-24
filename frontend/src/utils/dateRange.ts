export const PERIOD_IDS = ["today", "week", "month", "year", "all"] as const;

export type PeriodId = (typeof PERIOD_IDS)[number];

export type DateRange = {
  startDate: string;
  endDate: string;
};

/** Formats a Date for an <input type="date"> using the user's local calendar day. */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Returns an inclusive date range for a predefined period.
 * "7 Days" includes today and the preceding six local calendar days.
 */
export function getPeriodDateRange(
  period: PeriodId,
  now = new Date(),
): DateRange {
  const endDate = formatLocalDate(now);

  switch (period) {
    case "today":
      return { startDate: endDate, endDate };

    case "week": {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);

      return { startDate: formatLocalDate(start), endDate };
    }

    case "month":
      return {
        startDate: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`,
        endDate,
      };

    case "year":
      return { startDate: `${now.getFullYear()}-01-01`, endDate };

    case "all":
      return { startDate: "", endDate: "" };
  }
}
