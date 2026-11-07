import type { Balance, Stats } from "@/types/api";

export type DashboardCardProps = {
  stats: Stats | null;
  balance: Balance | null;
  incomeForPeriod: number;
  isLoading: boolean;
  formatCurrency: (value: number) => string;
};
