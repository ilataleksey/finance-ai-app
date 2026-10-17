import { useState } from "react";

import CategoryCreator from "@/components/CategoryCreator";
import type { Category } from "@/types/api";

import ErrorState from "@/components/ErrorState";

const NEW_CATEGORY_VALUE = "__new_category__";

type ExpenseFormProps = {
  title: string;
  amount: string;
  categoryId: string;
  createdAt: string;
  errorMessage: string | null;
  isSaving: boolean;

  categories: Category[];
  isCategoriesLoading: boolean;
  categoriesError: string | null;
  onCategoriesRetry: () => void;

  setTitle: (value: string) => void;
  setAmount: (value: string) => void;
  setCategoryId: (value: string) => void;
  setCreatedAt: (value: string) => void;

  onSubmit: () => void;
  onCreateCategory: (name: string) => Promise<void>;
};

export default function ExpenseForm({
  title,
  amount,
  categoryId,
  createdAt,
  errorMessage,
  isSaving,

  categories,
  isCategoriesLoading,
  categoriesError,
  onCategoriesRetry,

  setTitle,
  setAmount,
  setCategoryId,
  setCreatedAt,
  onSubmit,
  onCreateCategory,
}: ExpenseFormProps) {
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const areCategoriesUnavailable = isCategoriesLoading || categoriesError !== null;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-4">Add Expense</h2>

      {errorMessage && (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

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
        className="w-full mb-2 p-2 border rounded disabled:cursor-not-allowed disabled:opacity-50"
        disabled={areCategoriesUnavailable}
        aria-busy={isCategoriesLoading}
        value={isCreatingCategory ? NEW_CATEGORY_VALUE : categoryId}
        onChange={(event) => {
          if (event.target.value === NEW_CATEGORY_VALUE) {
            setIsCreatingCategory(true);
            return;
          }

          setIsCreatingCategory(false);
          setCategoryId(event.target.value);
        }}
      >
        <option value="">
          {isCategoriesLoading
            ? "Загрузка категорий…"
            : categoriesError
              ? "Категории недоступны"
              : "Select category"}
        </option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
        <option value={NEW_CATEGORY_VALUE}>+ Add a category</option>
      </select>

      {isCategoriesLoading && (
        <p className="mb-2 text-sm text-gray-500" role="status">
          Загрузка категорий…
        </p>
      )}

      {categoriesError && (
        <div className="mb-2">
          <ErrorState
            title="Категории недоступны"
            description={categoriesError}
            onRetry={onCategoriesRetry}
          />
        </div>
      )}

      {!areCategoriesUnavailable && categories.length === 0 && (
        <p className="mb-2 text-sm text-gray-600">
          Категорий пока нет. Выберите «+ Add a category», чтобы создать первую.
        </p>
      )}

      {isCreatingCategory && !areCategoriesUnavailable && (
        <div className="mb-2">
          <CategoryCreator
            onCreate={onCreateCategory}
            onCancel={() => setIsCreatingCategory(false)}
          />
        </div>
      )}

      <input
        className="w-full mb-2 p-2 border rounded"
        type="date"
        value={createdAt}
        onChange={(e) => setCreatedAt(e.target.value)}
      />

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSaving || areCategoriesUnavailable}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? "Сохранение…" : "Add"}
      </button>
    </div>
  );
};
