export const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export const MIN_PLAN_YEAR = 2000;
export const MAX_PLAN_YEAR = 2100;

export function isFutureMonth(year: number, month: number, now = new Date()): boolean {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  return year > currentYear || (year === currentYear && month > currentMonth);
}
