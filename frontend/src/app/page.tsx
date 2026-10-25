"use client";

// npm run dev - запустить сервер

import { useEffect, useState } from "react";

import { ApiError, apiFetch } from "@/services/api";
import { formatLocalDate, getPeriodDateRange, type PeriodId } from "@/utils/dateRange";
import { buildDateParams } from "@/utils/dateParams";
import { getBudgetPeriod } from "@/utils/budgetPeriod";
import { formatCurrency } from "@/utils/formatCurrency";
import AppNavigation from "@/components/AppNavigation";
import DashboardCards from "@/components/DashboardCards";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import ChartSection from "@/components/ChartSection";
import CategoryPieChart from "@/components/CategoryPieChart";
import BudgetSection from "@/components/BudgetSection";
import ErrorState from "@/components/ErrorState";

import type {
  Category,
  ExpenseItem,
  DailyExpense,
  CategorySummary,
  Stats,
  Balance,
  BudgetStatus,
} from "@/types/api";

type ExpenseDeleteError = {
  expenseId: number;
  message: string;
};


function getExpenseCreateErrorMessage(error: unknown): string {
  if (
    error instanceof DOMException &&
    error.name === "TimeoutError"
  ) {
    return (
      "Сервер не ответил вовремя. Расход мог сохраниться. " +
      "Обновите список расходов перед повторной отправкой."
    );
  }

  if (error instanceof ApiError) {
    if (error.status === 422) {
      return (
        "Проверьте данные расхода: название — от 1 до 100 символов, " +
        "сумма — больше нуля, категория и дата должны быть корректными."
      );
    }

    const body = error.body;

    if (
      error.status === 404 &&
      typeof body === "object" &&
      body !== null &&
      "detail" in body &&
      body.detail === "Category not found"
    ) {
      return (
        "Выбранная категория больше недоступна. " +
        "Обновите страницу и выберите существующую категорию."
      );
    }

    if (error.status >= 500 && error.status <= 599) {
      return "Сервер временно не может сохранить расход. Попробуйте позже.";
    }

    return "Не удалось сохранить расход. Попробуйте ещё раз.";
  }

  if (error instanceof TypeError) {
    return (
      "Не удалось связаться с сервером. " +
      "Проверьте соединение и попробуйте ещё раз."
    );
  }

  return "Не удалось сохранить расход. Попробуйте ещё раз.";
}


export default function Page() {
  const [chartData, setChartData] = useState<DailyExpense[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [categoriesRefreshKey, setCategoriesRefreshKey] = useState(0);

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [dateRange, setDateRange] = useState(() => getPeriodDateRange("month"));
  const [summaryData, setSummaryData] = useState<CategorySummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [balanceData, setBalanceData] = useState<Balance | null>(null);
  const [period, setPeriod] = useState<PeriodId | null>("month");
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [expenseFormError, setExpenseFormError] = useState<string | null>(null);
  const [isExpenseSaving, setIsExpenseSaving] = useState(false);
  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(null);
  const [expenseDeleteError, setExpenseDeleteError] = useState<ExpenseDeleteError | null>(null);

  const { startDate, endDate } = dateRange;
  const budgetPeriod = getBudgetPeriod(endDate);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [createdAt, setCreatedAt] = useState(() => formatLocalDate(new Date()));

  const addExpense = async () => {
    if (isExpenseSaving || isCategoriesLoading || categoriesError !== null) {
      return;
    }
    if (!title.trim() || !amount || !categoryId) {
      setExpenseFormError("Введите название, сумму и выберите категорию.");
      return;
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setExpenseFormError("Сумма расхода должна быть больше нуля.");
      return;
    }

    setExpenseFormError(null);
    setIsExpenseSaving(true);

    try {
      await apiFetch("/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          amount: parsedAmount,
          category_id: Number(categoryId),
          created_at: createdAt,
        }),
      });

      setTitle("");
      setAmount("");
      setCategoryId("");
      setIsDashboardLoading(true);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      console.error("Failed to create expense", error);

      setExpenseFormError(getExpenseCreateErrorMessage(error));
    } finally {
      setIsExpenseSaving(false);
    }
  };

  const createCategory = async (name: string) => {
    const params = new URLSearchParams({ name });
    const category = await apiFetch<Category>(`/categories?${params.toString()}`, {
      method: "POST",
    });

    setCategories((currentCategories) => {
      return [...currentCategories, category].sort((first, second) => {
        return first.name.localeCompare(second.name);
      });
    });
    setCategoryId(String(category.id));
  };

  const deleteExpense = async (id: number) => {
    if (deletingExpenseId !== null) {
      return;
    }

    setDeletingExpenseId(id);
    setExpenseDeleteError(null);

    try {
      await apiFetch(`/expenses/${id}`, {
        method: "DELETE",
      });

      setIsDashboardLoading(true);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      console.error("Failed to delete expense", error);

      setExpenseDeleteError({
        expenseId: id,
        message: "Не удалось удалить расход. Попробуйте ещё раз.",
      });
    } finally {
      setDeletingExpenseId(null);
    }
  };

  const handleCategoriesRetry = () => {
    if (isCategoriesLoading) {
      return;
    }

    setCategoriesError(null);
    setIsCategoriesLoading(true);
    setCategoriesRefreshKey((key) => key + 1);
  };

  const handleDashboardRetry = () => {
    setDashboardError(null);
    setIsDashboardLoading(true);
    setRefreshKey((key) => key + 1);
  };

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories() {
      try {
        const data = await apiFetch<Category[]>("/categories", {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        if (!Array.isArray(data)) {
          throw new Error("Expected categories to be an array");
        }

        setCategories(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load categories", error);

          setCategoriesError(
            "Не удалось загрузить категории. Попробуйте ещё раз.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsCategoriesLoading(false);
        }
      }
    }

    void loadCategories();

    return () => controller.abort();
  }, [categoriesRefreshKey]);

  useEffect(() => {
    const controller = new AbortController();
    const query = buildDateParams(startDate, endDate);

    async function loadDashboardData() {
      setDashboardError(null);

      try {
        const [
          expensesData,
          chartData,
          summaryData,
          statsData,
          balanceData,
          budgetStatusData,
        ] = await Promise.all([
          apiFetch<ExpenseItem[]>(`/expenses/list?${query}`, { signal: controller.signal }),
          apiFetch<DailyExpense[]>(`/expenses/daily?${query}`, { signal: controller.signal }),
          apiFetch<CategorySummary[]>(`/expenses/summary?${query}`, { signal: controller.signal }),
          apiFetch<Stats>(`/expenses/stats?${query}`, { signal: controller.signal }),
          apiFetch<Balance>("/balance", { signal: controller.signal }),
          apiFetch<BudgetStatus[]>(
            `/budgets/status?year=${budgetPeriod.year}&month=${budgetPeriod.month}`,
            { signal: controller.signal },
          ),
        ]);

        if (controller.signal.aborted) {
          return;
        }

        setExpenses(Array.isArray(expensesData) ? expensesData : []);
        setChartData(Array.isArray(chartData) ? chartData : []);
        setSummaryData(Array.isArray(summaryData) ? summaryData : []);
        setStats(statsData);
        setBalanceData(balanceData);
        setBudgetStatus(Array.isArray(budgetStatusData) ? budgetStatusData : []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load dashboard data", error);
          setDashboardError(
            "Не удалось загрузить данные Dashboard. Проверьте соединение с сервером и попробуйте еще раз."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsDashboardLoading(false);
        }
      }
    }

    void loadDashboardData();

    return () => controller.abort();
  }, [
    budgetPeriod.month,
    budgetPeriod.year,
    endDate,
    refreshKey,
    startDate
  ]);

  const handlePeriodChange = (nextPeriod: PeriodId) => {
    setIsDashboardLoading(true);
    setPeriod(nextPeriod);
    setDateRange(getPeriodDateRange(nextPeriod));
  };

  const handleStartDateChange = (value: string) => {
    setIsDashboardLoading(true);
    setPeriod(null);
    setDateRange((currentRange) => ({ ...currentRange, startDate: value }));
  };

  const handleEndDateChange = (value: string) => {
    setIsDashboardLoading(true);
    setPeriod(null);
    setDateRange((currentRange) => ({ ...currentRange, endDate: value }));
  };


  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <AppNavigation />

      <h1 className="text-3xl font-bold mb-6">Finance AI Dashboard</h1>

      {dashboardError ? (
        <ErrorState
          title="Не удалось загрузить Dashboard"
          description={dashboardError}
          onRetry={handleDashboardRetry}
        />
      ) : (
        <>

          {/* CARDS */}
          <DashboardCards
            stats={stats}
            balance={balanceData}
            formatCurrency={formatCurrency}
          />

          {/* Форма */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* LEFT - CHART */}
            <div
              className="xl:col-span-2 bg-white p-4 rounded-xl shadow overflow-x-auto"
              aria-busy={isDashboardLoading}
            >

              {/* CHART */}
              <ChartSection
                chartData={chartData}
                startDate={startDate}
                endDate={endDate}
                period={period}
                isLoading={isDashboardLoading}
                onStartDateChange={handleStartDateChange}
                onEndDateChange={handleEndDateChange}
                onReset={() => handlePeriodChange("all")}
                onPeriodChange={handlePeriodChange}
              />

              {/* PIE */}
              <CategoryPieChart
                summaryData={summaryData}
                formatCurrency={formatCurrency}
                isLoading={isDashboardLoading}
              />

              {/* BUDGET */}
              <BudgetSection
                budgetStatus={budgetStatus}
                formatCurrency={formatCurrency}
                periodLabel={budgetPeriod.label}
              />
            </div>

            {/* RIGHT - FORM + LIST */}
            <div className="space-y-6">

              {/* ADD FORM */}
              <ExpenseForm
                title={title}
                amount={amount}
                categoryId={categoryId}
                createdAt={createdAt}
                errorMessage={expenseFormError}
                isSaving={isExpenseSaving}

                categories={categories}
                isCategoriesLoading={isCategoriesLoading}
                categoriesError={categoriesError}
                onCategoriesRetry={handleCategoriesRetry}

                setTitle={setTitle}
                setAmount={setAmount}
                setCategoryId={setCategoryId}
                setCreatedAt={setCreatedAt}

                onSubmit={addExpense}
                onCreateCategory={createCategory}
              />

              {/* EXPENSE LIST */}
              <ExpenseList
                expenses={expenses}
                formatCurrency={formatCurrency}
                onDelete={deleteExpense}
                isLoading={isDashboardLoading}
                deletingExpenseId={deletingExpenseId}
                deleteError={expenseDeleteError}
              />

            </div>
          </div>
        </>
      )}
      {isDashboardLoading && (
        <div
          className="pointer-events-none fixed bottom-4 right-4 z-50 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
          role="status"
        >
          Updating dashboard...
        </div>
      )}

    </div>
  );
}
