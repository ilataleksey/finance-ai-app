import { useState } from "react";

import { ApiError } from "@/services/api";
import type { IncomeCreate, IncomeItem } from "@/types/api";
import { formatLocalDate } from "@/utils/dateRange";
import IncomeSourceField from "@/components/IncomeSourceField";

type IncomeFormProps = {
  editingIncome: IncomeItem | null;
  isSaving: boolean;
  onSave: (income: IncomeCreate) => Promise<void>;
  onCancelEdit: () => void;
};

function getIncomeErrorMessage(error: unknown): string {
  if (
    error instanceof DOMException &&
    error.name === "TimeoutError"
  ) {
    return (
      "The server did not respond in time. The income may have been saved. " +
      "Check your income records before submitting again."
    );
  }

  if (error instanceof ApiError) {
    if (error.status === 404) {
      const body = error.body;

      if (
        typeof body === "object" &&
        body !== null &&
        "detail" in body &&
        body.detail === "Income not found"
      ) {
        return "This income no longer exists. Cancel editing and refresh the page.";
      }

      return "Income source not found. Refresh the page and select an existing source.";
    }

    return "Could not save the income. Please try again.";
  }

  if (error instanceof TypeError) {
    return "Could not reach the server. Check your connection.";
  }

  return "Could not save the income. Please try again.";
}

export default function IncomeForm({
  editingIncome,
  isSaving,
  onSave,
  onCancelEdit,
}: IncomeFormProps) {
  const [sourceId, setSourceId] = useState(
    () => editingIncome ? String(editingIncome.source_id) : "",
  );
  const [amount, setAmount] = useState(
    () => editingIncome ? String(editingIncome.amount) : "",
  );
  const [createdAt, setCreatedAt] = useState(
    () =>
      editingIncome?.created_at.split("T")[0] ??
      formatLocalDate(new Date()),
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (isSaving) {
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    const parsedAmount = Number(amount);

    if (!sourceId) {
      setErrorMessage("Select an income source.");
      return;
    }

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Income amount must be greater than zero.");
      return;
    }

    if (!createdAt) {
      setErrorMessage("Select an income date.");
      return;
    }

    const savedDate =
      editingIncome &&
        createdAt === editingIncome.created_at.split("T")[0]
        ? editingIncome.created_at
        : createdAt;

    try {
      await onSave({
        source_id: Number(sourceId),
        amount: parsedAmount,
        created_at: savedDate,
      });

      if (!editingIncome) {
        setAmount("");
        setSuccessMessage("Income saved.");
      }
    } catch (error) {
      setErrorMessage(getIncomeErrorMessage(error));
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-4 text-lg font-semibold">
        {editingIncome ? "Edit income" : "Add income"}
      </h2>

      {errorMessage && (
        <p
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      {successMessage && (
        <p
          className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800"
          role="status"
        >
          {successMessage}
        </p>
      )}

      <IncomeSourceField
        value={sourceId}
        onChange={(value) => {
          setSourceId(value);
          setSuccessMessage(null);
        }}
        disabled={isSaving}
      />

      <label htmlFor="income-amount" className="mb-1 block text-sm">
        Amount
      </label>
      <input
        id="income-amount"
        className="mb-3 w-full rounded border p-2"
        type="number"
        step="0.01"
        value={amount}
        disabled={isSaving}
        onChange={(event) => {
          setAmount(event.target.value);
          setSuccessMessage(null);
        }}
      />

      <label htmlFor="income-date" className="mb-1 block text-sm">
        Date
      </label>
      <input
        id="income-date"
        className="mb-3 w-full rounded border p-2"
        type="date"
        value={createdAt}
        disabled={isSaving}
        onChange={(event) => {
          setCreatedAt(event.target.value);
          setSuccessMessage(null);
        }}
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSaving}
        className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving
          ? "Saving…"
          : editingIncome
            ? "Save changes"
            : "Add income"
        }
      </button>

      {editingIncome && (
        <button
          type="button"
          onClick={onCancelEdit}
          disabled={isSaving}
          className="mt-2 w-full rounded border border-gray-300 p-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
