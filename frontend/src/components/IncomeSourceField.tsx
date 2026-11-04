import { useEffect, useState } from "react";

import { ApiError, apiFetch } from "@/services/api";
import type { IncomeSource } from "@/types/api";

import { formatDisplayName } from "@/utils/formatDisplayName";

const NEW_SOURCE_VALUE = "__new_source__";

type IncomeSourceFieldProps = {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
};

export default function IncomeSourceField({
  value,
  onChange,
  disabled,
}: IncomeSourceFieldProps) {
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSources() {
      try {
        const data = await apiFetch<IncomeSource[]>("/income-sources", {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        if (!Array.isArray(data)) {
          throw new Error("Expected income sources to be an array");
        }

        setSources(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load income sources", error);
          setLoadError("Could not load income sources.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadSources();

    return () => controller.abort();
  }, [refreshKey]);

  const retry = () => {
    if (isLoading || disabled) {
      setIsCreating(false);
      setCreateError(null);
      return;
    }

    onChange("");
    setLoadError(null);
    setIsLoading(true);
    setRefreshKey((key) => key + 1);
  };

  const createSource = async () => {
    if (isSubmitting || disabled) {
      return;
    }

    const trimmedName = name.trim();

    if (trimmedName.length === 0 || trimmedName.length > 100) {
      setCreateError("Source name must contain 1–100 characters.");
      return;
    }

    setCreateError(null);
    setIsSubmitting(true);

    try {
      const source = await apiFetch<IncomeSource>("/income-sources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      setSources((current) =>
        [...current, source].sort((first, second) =>
          first.name.localeCompare(second.name),
        ),
      );

      onChange(String(source.id));
      setName("");
      setIsCreating(false);
    } catch (error) {
      console.error("Failed to create income source", error);

      setCreateError(
        error instanceof ApiError && error.status === 409
          ? "This income source already exists. Select it from the list."
          : "Could not confirm creation. Check sources before trying again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isUnavailable =
    disabled || isLoading || loadError !== null || isSubmitting;

  return (
    <div className="mb-3">
      <label htmlFor="income-source" className="mb-1 block text-sm">
        Source
      </label>

      <select
        id="income-source"
        value={isCreating ? NEW_SOURCE_VALUE : value}
        disabled={isUnavailable}
        aria-busy={isLoading}
        onChange={(event) => {
          setCreateError(null);

          if (event.target.value === NEW_SOURCE_VALUE) {
            onChange("");
            setIsCreating(true);
            return;
          }

          setIsCreating(false);
          onChange(event.target.value);
        }}
        className="w-full rounded border p-2 disabled:opacity-50"
      >
        <option value="">
          {isLoading ? "Loading sources…" : "Select an income source"}
        </option>

        {sources.map((source) => (
          <option key={source.id} value={source.id}>
            {formatDisplayName(source.name)}
          </option>
        ))}
        <option value={NEW_SOURCE_VALUE}>+ Add income source</option>
      </select>

      {loadError && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {loadError}
        </p>
      )}

      {loadError && !isLoading && (
        <button
          type="button"
          onClick={retry}
          disabled={disabled || isSubmitting}
          className="mt-2 text-sm text-blue-700 disabled:opacity-50"
        >
          Retry
        </button>
      )}

      {!isLoading && !loadError && sources.length === 0 && (
        <p className="mt-2 text-sm text-gray-600">
          No income sources yet. Select “+ Add income source” to create your first one.
        </p>
      )}

      {isCreating && (
        <fieldset
          disabled={isUnavailable}
          className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3"
        >
          <label
            htmlFor="new-income-source"
            className="block text-sm font-medium text-gray-700"
          >
            New income source
          </label>

          <div className="mt-2 flex gap-2">
            <input
              id="new-income-source"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Salary"
              className="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-wait"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void createSource();
                }
              }}
            />

            <button
              type="button"
              onClick={createSource}
              className="rounded bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-wait disabled:bg-blue-300"
            >
              {isSubmitting ? "Adding…" : "Add"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setName("");
                setCreateError(null);
              }}
              className="rounded px-3 py-2 text-sm font-medium text-gray-600 hover:bg-white disabled:cursor-wait"
            >
              Cancel
            </button>
          </div>
        </fieldset>
      )}

      {createError && isCreating && (
        <div className="mt-2">
          <p className="text-sm text-red-700" role="alert">
            {createError}
          </p>

          <button
            type="button"
            onClick={retry}
            disabled={disabled || isSubmitting || isLoading}
            className="mt-2 text-sm text-blue-700 disabled:opacity-50"
          >
            Check sources
          </button>
        </div>
      )}
    </div>
  );
}