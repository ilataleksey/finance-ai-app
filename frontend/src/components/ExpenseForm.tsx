import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";

type Category = {
  id: number;
  name: string;
};

type Props = {
  categories: Category[];
  onExpenseAdded: () => void;
};

export default function ExpenseForm({
  categories,
  onExpenseAdded,
}: Props) {
  const today = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [createdAt, setCreatedAt] = useState(today);

  const addExpense = async () => {
    if (!title || !amount || !categoryId) {
      alert("заполни все поля");
      return;
    };

    await apiFetch(`/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        amount: parseFloat(amount),
        category_id: Number(categoryId),
        created_at: createdAt,
      }),
    });

    setTitle("");
    setAmount("");
    setCategoryId("");

    // обновляем график
    onExpenseAdded();
  };

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
        onClick={addExpense}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Add
      </button>
    </div>
  );
};
