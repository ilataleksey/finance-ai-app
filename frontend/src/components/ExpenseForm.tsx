import { useState } from "react";

import CategoryCreator from "@/components/CategoryCreator";
import type { Category } from "@/types/api";

import ErrorState from "@/components/ErrorState";

import { formatDisplayName } from "@/utils/formatDisplayName";

const NEW_CATEGORY_VALUE = "__new_category__";

type ExpenseFormProps = {
  title: string;
  amount: string;
  categoryId: string;
  createdAt: string;
  errorMessage: string | null;
  isSaving: boolean;
  isEditing: boolean;
  onCancelEdit: () => void;

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
  isEditing,
  onCancelEdit,

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
    <fieldset
      disabled={isSaving}
      className="rounded-xl bg-white p-4 shadow"
    >
      <h2 className="mb-4 text-lg font-semibold">
        {isEditing ? "Edit expense" : "Add expense"}
      </h2>

      {errorMessage && (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <label htmlFor="expense-title" className="mb-1 block text-sm">
        Description
      </label>
      <input
        id="expense-title"
        className="mb-3 w-full rounded border p-2"
        placeholder="e.g. Groceries"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label htmlFor="expense-amount" className="mb-1 block text-sm">
        Amount
      </label>
      <input
        id="expense-amount"
        className="mb-3 w-full rounded border p-2"
        step="0.01"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <label htmlFor="expense-category" className="mb-1 block text-sm">
        Category
      </label>
      <select
        id="expense-category"
        className="mb-3 w-full rounded border p-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            ? "Loading categories…"
            : categoriesError
              ? "Categories unavailable"
              : "Select category"}
        </option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {formatDisplayName(c.name)}
          </option>
        ))}
        <option value={NEW_CATEGORY_VALUE}>+ Add a category</option>
      </select>

      {isCategoriesLoading && (
        <p className="mb-2 text-sm text-gray-500" role="status">
          Loading categories…
        </p>
      )}

      {categoriesError && (
        <div className="mb-2">
          <ErrorState
            title="Categories unavailable"
            description={categoriesError}
            onRetry={onCategoriesRetry}
          />
        </div>
      )}

      {!areCategoriesUnavailable && categories.length === 0 && (
        <p className="mb-2 text-sm text-gray-600">
          No categories yet. Select “+ Add a category” to create your first one.
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

      <label htmlFor="expense-date" className="mb-1 block text-sm">
        Date
      </label>
      <input
        id="expense-date"
        className="mb-3 w-full rounded border p-2"
        type="date"
        value={createdAt}
        onChange={(e) => setCreatedAt(e.target.value)}
      />

      <button
        type="button"
        onClick={onSubmit}
        disabled={isSaving || areCategoriesUnavailable || isCreatingCategory}
        className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving
          ? "Saving…"
          : isEditing
            ? "Save changes"
            : "Add expense"}
      </button>

      {isEditing && (
        <button
          type="button"
          onClick={onCancelEdit}
          disabled={isSaving}
          className="mt-2 w-full rounded border border-gray-300 p-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
      )}
    </fieldset>
  );
};
