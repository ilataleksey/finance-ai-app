import { useState } from "react";

import { ApiError } from "@/services/api";
import type { IncomeCreate } from "@/types/api";
import { formatLocalDate } from "@/utils/dateRange";
import IncomeSourceField from "@/components/IncomeSourceField";

type IncomeFormProps = {
  onCreate: (income: IncomeCreate) => Promise<void>;
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
      return "Income source not found. Reload sources and select an existing one.";
    }
    if (error.status === 422) {
      return "Check the source, positive amount, and income date.";
    }

    if (error.status >= 500 && error.status <= 599) {
      return "The server could not save the income. Try again later.";
    }

    return "Could not save the income. Please try again.";
  }

  if (error instanceof TypeError) {
    return "Could not reach the server. Check your connection.";
  }

  return "Could not save the income. Please try again.";
}

export default function IncomeForm({ onCreate }: IncomeFormProps) {
  const [sourceId, setSourceId] = useState("");
  const [amount, setAmount] = useState("");
  const [createdAt, setCreatedAt] = useState(
    () => formatLocalDate(new Date()),
  );
  const [isSaving, setIsSaving] = useState(false);
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

    setIsSaving(true);

    try {
      await onCreate({
        source_id: Number(sourceId),
        amount: parsedAmount,
        created_at: createdAt,
      });

      setAmount("");
      setSuccessMessage("Income saved.");
    } catch (error) {
      console.error("Failed to create income", error);
      setErrorMessage(getIncomeErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-4 text-lg font-semibold">Add income</h2>

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
        {isSaving ? "Saving…" : "Add income"}
      </button>
    </div>
  );
}
