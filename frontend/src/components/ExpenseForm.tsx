import type { Category } from "@/types/api";

type ExpenseFormProps = {
  title: string;
  amount: string;
  categoryId: string;
  createdAt: string;

  categories: Category[];

  setTitle: (value: string) => void;
  setAmount: (value: string) => void;
  setCategoryId: (value: string) => void;
  setCreatedAt: (value: string) => void;

  onSubmit: () => void;
};

export default function ExpenseForm({
  title,
  amount,
  categoryId,
  createdAt,

  categories,

  setTitle,
  setAmount,
  setCategoryId,
  setCreatedAt,
  onSubmit,
}: ExpenseFormProps) {


  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Add Expense</h2>

      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="w-full mb-2 p-2 border rounded"
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <select
        className="w-full mb-2 p-2 border rounded"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        className="w-full mb-2 p-2 border rounded"
        type="date"
        value={createdAt}
        onChange={(e) => setCreatedAt(e.target.value)}
      />

      <button
        onClick={onSubmit}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Add
      </button>
    </div>
  );
};
