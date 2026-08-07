"use client";

import { useState } from "react";

type CategoryCreatorProps = {
  onCreate: (name: string) => Promise<void>;
  onCancel?: () => void;
};

export default function CategoryCreator({ onCreate, onCancel }: CategoryCreatorProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const categoryName = name.trim();

    if (!categoryName) {
      setError("Enter a category name.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onCreate(categoryName);
      setName("");
      onCancel?.();
    } catch {
      setError("Could not add the category. It may already exist.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-blue-100 bg-blue-50 p-3">
      <label htmlFor="new-category" className="block text-sm font-medium text-gray-700">
        New category
      </label>

      <div className="mt-2 flex gap-2">
        <input
          id="new-category"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. Health"
          disabled={isSubmitting}
          className="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-wait"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:bg-blue-300"
        >
          {isSubmitting ? "Adding…" : "Add"}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white disabled:cursor-wait"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
