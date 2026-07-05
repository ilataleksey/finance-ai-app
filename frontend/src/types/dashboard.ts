export type Stats = {
  total_expenses: number;
  transactions_count: number;
  avg_per_day: number;
  top_category: string;
};

export type Balance = {
  balance: number;
};

export type DashboardCardProps = {
  stats: Stats | null;
  balance: Balance | null;
  formatCurrency: (value: number) => string;
};
