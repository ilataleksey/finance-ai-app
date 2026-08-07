"use client";

import { useEffect, useState } from "react";

import AppNavigation from "@/components/AppNavigation";
import BudgetPlanTable from "@/components/BudgetPlanTable";
import PlanYearNavigator from "@/components/PlanYearNavigator";
import { apiFetch } from "@/services/api";
import type { Budget, BudgetPlan } from "@/types/api";
import { MAX_PLAN_YEAR, MIN_PLAN_YEAR } from "@/utils/months";

function getCellKey(categoryId: number, month: number): string {
  return `${categoryId}-${month}`;
}

export default function PlanPage() {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [plan, setPlan] = useState<BudgetPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingCell, setSavingCell] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadPlan() {
      try {
        const data = await apiFetch<BudgetPlan>(`/budgets/plan?year=${year}`, {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setPlan(data);
          setError(null);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          console.error("Failed to load budget plan", loadError);
          setError("Could not load the budget plan. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadPlan();

    return () => controller.abort();
  }, [year]);

  const handleYearChange = (nextYear: number) => {
    if (nextYear < MIN_PLAN_YEAR || nextYear > MAX_PLAN_YEAR) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setYear(nextYear);
  };

  const refreshPlan = async () => {
    const data = await apiFetch<BudgetPlan>(`/budgets/plan?year=${year}`);
    setPlan(data);
  };

  const saveBudget = async (categoryId: number, month: number, amount: number) => {
    const cellKey = getCellKey(categoryId, month);
    setSavingCell(cellKey);
    setError(null);

    try {
      await apiFetch<Budget>("/budgets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category_id: categoryId,
          amount,
          year,
          month,
        }),
      });

      await refreshPlan();
    } catch (saveError) {
      console.error("Failed to save budget", saveError);
      setError("Could not save the budget. Please try again.");
      throw saveError;
    } finally {
      setSavingCell(null);
    }
  };

  const deleteBudget = async (categoryId: number, month: number) => {
    const cellKey = getCellKey(categoryId, month);
    setSavingCell(cellKey);
    setError(null);

    try {
      const params = new URLSearchParams({
        category_id: String(categoryId),
        year: String(year),
        month: String(month),
      });

      await apiFetch<void>(`/budgets?${params.toString()}`, {
        method: "DELETE",
      });

      await refreshPlan();
    } catch (deleteError) {
      console.error("Failed to delete budget", deleteError);
      setError("Could not delete the budget. Please try again.");
      throw deleteError;
    } finally {
      setSavingCell(null);
    }
  };

  const isCurrentPlanLoaded = plan?.year === year;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <AppNavigation />

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Plan</h1>
          <p className="mt-1 text-gray-600">
            Plan monthly limits and compare them with actual spending.
          </p>
        </div>

        <PlanYearNavigator year={year} onYearChange={handleYearChange} />
      </div>

      {error && (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {isLoading || !isCurrentPlanLoaded ? (
        <div
          className="rounded-xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm"
          role="status"
        >
          Loading budget plan…
        </div>
      ) : plan.categories.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">No categories yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Create categories before setting monthly spending limits.
          </p>
        </div>
      ) : (
        <BudgetPlanTable
          plan={plan}
          savingCell={savingCell}
          onSave={saveBudget}
          onDelete={deleteBudget}
          onError={setError}
        />
      )}
    </main>
  );
}
