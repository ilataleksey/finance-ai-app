"use client";

import { useEffect, useRef, useState } from "react";

import type { BudgetPlan } from "@/types/api";
import { formatCurrency } from "@/utils/formatCurrency";
import { isFutureMonth, MONTH_LABELS } from "@/utils/months";

type EditingCell = {
  categoryId: number;
  month: number;
};

type BudgetPlanTableProps = {
  plan: BudgetPlan;
  savingCell: string | null;
  onSave: (categoryId: number, month: number, amount: number) => Promise<void>;
  onDelete: (categoryId: number, month: number) => Promise<void>;
  onError: (message: string) => void;
};

function getCellKey(categoryId: number, month: number): string {
  return `${categoryId}-${month}`;
}

function getPercentColor(percent: number): string {
  if (percent > 100) {
    return "text-red-600";
  }

  if (percent >= 80) {
    return "text-yellow-700";
  }

  return "text-green-700";
}

function formatCategoryName(name: string): string {
  return name ? `${name[0].toUpperCase()}${name.slice(1)}` : name;
}

export default function BudgetPlanTable({
  plan,
  savingCell,
  onSave,
  onDelete,
  onError,
}: BudgetPlanTableProps) {
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [draftAmount, setDraftAmount] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isCommittingRef = useRef(false);
  const monthlyTotals = MONTH_LABELS.map((_, monthIndex) => {
    return plan.categories.reduce(
      (totals, category) => {
        const period = category.months[monthIndex];

        return {
          planned: totals.planned + (period.planned ?? 0),
          actual: totals.actual + period.actual,
        };
      },
      { planned: 0, actual: 0 },
    );
  });

  const annualTotals = monthlyTotals.reduce(
    (totals, month) => ({
      planned: totals.planned + month.planned,
      actual: totals.actual + month.actual,
    }),
    { planned: 0, actual: 0 },
  );
  const annualTotalsPercent = annualTotals.planned > 0
    ? Math.round((annualTotals.actual / annualTotals.planned) * 10000) / 100
    : null;

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editingCell]);

  const cancelEditing = () => {
    setEditingCell(null);
    setDraftAmount("");
  };

  const startEditing = (categoryId: number, month: number, planned: number | null) => {
    if (savingCell) {
      return;
    }

    setEditingCell({ categoryId, month });
    setDraftAmount(planned?.toString() ?? "");
  };

  const commitEditing = async (deleteEmptyValue: boolean) => {
    if (!editingCell || isCommittingRef.current) {
      return;
    }

    const value = draftAmount.trim();
    const cell = editingCell;

    if (!value) {
      if (!deleteEmptyValue) {
        cancelEditing();
        return;
      }

      isCommittingRef.current = true;

      try {
        await onDelete(cell.categoryId, cell.month);
        cancelEditing();
      } catch {
        cancelEditing();
      } finally {
        isCommittingRef.current = false;
      }

      return;
    }

    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
      onError("Enter a positive budget amount.");
      cancelEditing();
      return;
    }

    isCommittingRef.current = true;

    try {
      await onSave(cell.categoryId, cell.month, amount);
      cancelEditing();
    } catch {
      cancelEditing();
    } finally {
      isCommittingRef.current = false;
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="min-w-[1180px] w-full border-collapse text-sm">
        <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
          <tr>
            <th className="sticky left-0 z-20 min-w-40 border-b border-r border-gray-200 bg-gray-50 px-4 py-3">
              Category
            </th>

            {MONTH_LABELS.map((label) => (
              <th key={label} className="min-w-28 border-b border-gray-200 px-3 py-3 text-right">
                {label}
              </th>
            ))}

            <th className="min-w-32 border-b border-l border-gray-200 px-4 py-3 text-right">
              Annual plan
            </th>
          </tr>
        </thead>

        <tbody>
          {plan.categories.map(({ category, months }) => {
            const annualPlanned = months.reduce(
              (total, period) => total + (period.planned ?? 0),
              0,
            );

            const annualActual = months.reduce(
              (total, period) => total + period.actual,
              0,
            );
            const annualPercent = annualPlanned > 0
              ? Math.round((annualActual / annualPlanned) * 10000) / 100
              : null;

            return (
              <tr key={category.id} className="border-b border-gray-100 last:border-b-0">
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-r border-gray-200 bg-white px-4 py-3 text-left font-medium text-gray-900"
                >
                  {formatCategoryName(category.name)}
                </th>

                {months.map((period) => {
                  const cellKey = getCellKey(category.id, period.month);
                  const isEditing =
                    editingCell?.categoryId === category.id && editingCell.month === period.month;
                  const isSaving = savingCell === cellKey;
                  const isFuture = isFutureMonth(plan.year, period.month);

                  return (
                    <td key={cellKey} className="px-3 py-3 align-top text-right">
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          type="number"
                          min="0"
                          step="0.01"
                          value={draftAmount}
                          onChange={(event) => setDraftAmount(event.target.value)}
                          onBlur={() => void commitEditing(false)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              void commitEditing(true);
                            }

                            if (event.key === "Escape") {
                              event.preventDefault();
                              cancelEditing();
                            }
                          }}
                          disabled={isSaving}
                          aria-label={`Budget for ${formatCategoryName(category.name)} in ${MONTH_LABELS[period.month - 1]}`}
                          className="w-24 rounded border border-blue-500 px-2 py-1 text-right text-sm outline-none ring-2 ring-blue-100 disabled:cursor-wait disabled:opacity-60"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditing(category.id, period.month, period.planned)}
                          disabled={isSaving}
                          aria-label={`Edit budget for ${formatCategoryName(category.name)} in ${MONTH_LABELS[period.month - 1]}`}
                          className="min-h-7 rounded px-1 font-medium text-gray-900 transition-colors hover:bg-blue-50 hover:text-blue-700 disabled:cursor-wait disabled:opacity-60"
                        >
                          {isSaving
                            ? "Saving…"
                            : period.planned === null
                              ? "—"
                              : `$${formatCurrency(period.planned)}`}
                        </button>
                      )}

                      {!isEditing && !isFuture && (period.planned !== null || period.actual > 0) && (
                        <div className="mt-1 text-xs text-gray-500">
                          Actual ${formatCurrency(period.actual)}
                          {period.percent !== null && (
                            <span className={`ml-1 font-medium ${getPercentColor(period.percent)}`}>
                              {period.percent}%
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}

                <td className="border-l border-gray-200 px-4 py-3 text-right align-top">
                  <div className="font-semibold text-gray-900">${formatCurrency(annualPlanned)}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    Actual ${formatCurrency(annualActual)}
                    {annualPercent !== null && (
                      <span className={`ml-1 font-medium ${getPercentColor(annualPercent)}`}>
                        {annualPercent}%
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>

        <tfoot className="bg-blue-50 text-sm">
          <tr>
            <th
              scope="row"
              className="sticky left-0 z-10 border-r border-t border-blue-100 bg-blue-50 px-4 py-3 text-left font-semibold text-gray-900"
            >
              Monthly totals
            </th>

            {monthlyTotals.map((total, monthIndex) => {
              const percent = total.planned > 0
                ? Math.round((total.actual / total.planned) * 10000) / 100
                : null;

              return (
                <td
                  key={MONTH_LABELS[monthIndex]}
                  className="border-t border-blue-100 px-3 py-3 text-right align-top"
                >
                  <div className="font-semibold text-gray-900">
                    Plan ${formatCurrency(total.planned)}
                  </div>
                  <div className="mt-1 text-xs text-gray-600">
                    Actual ${formatCurrency(total.actual)}
                    {percent !== null && (
                      <span className={`ml-1 font-medium ${getPercentColor(percent)}`}>
                        {percent}%
                      </span>
                    )}
                  </div>
                </td>
              );
            })}

            <td className="border-l border-t border-blue-100 px-4 py-3 text-right align-top">
              <div className="font-semibold text-gray-900">
                Plan ${formatCurrency(annualTotals.planned)}
              </div>
              <div className="mt-1 text-xs text-gray-600">
                Actual ${formatCurrency(annualTotals.actual)}
                {annualTotalsPercent !== null && (
                  <span className={`ml-1 font-medium ${getPercentColor(annualTotalsPercent)}`}>
                    {annualTotalsPercent}%
                  </span>
                )}
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
