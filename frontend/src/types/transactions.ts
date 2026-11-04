export type TransactionType = "income" | "expense";

export type TransactionFilter = "all" | TransactionType;

export type TransactionItem = {
  id: number;
  type: TransactionType;
  description: string;
  amount: number;
  createdAt: string;
  categoryName?: string;
};

export type TransactionReference = {
  id: number;
  type: TransactionType;
};

export type TransactionDeleteError = TransactionReference & {
  message: string;
};