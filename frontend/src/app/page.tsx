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
import ChartSection from "@/components/ChartSection";
import CategoryPieChart from "@/components/CategoryPieChart";
import BudgetSection from "@/components/BudgetSection";
import ErrorState from "@/components/ErrorState";
import IncomeForm from "@/components/IncomeForm";
import TransactionList from "@/components/TransactionList";
import { buildTransactions } from "@/utils/transactions";
import type { TransactionFilter } from "@/types/transactions";

import type {
  Category,
  ExpenseItem,
  DailyExpense,
  CategorySummary,
  Stats,
  Balance,
  BudgetStatus,
  IncomeCreate,
  IncomeItem,
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
      "The server did not respond in time. The expense may have been saved. " +
      "Check your expense records before submitting again."
    );
  }

  if (error instanceof ApiError) {
    if (error.status === 422) {
      return (
        "Check the expense details: description must contain 1–100 characters, " +
        "amount must be positive, and category and date must be valid."
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
        "The selected category is no longer available. " +
        "Refresh the page and select an existing category."
      );
    }

    if (error.status >= 500 && error.status <= 599) {
      return "The server could not save the expense. Try again later.";
    }

    return "Could not save the expense. Please try again.";
  }

  if (error instanceof TypeError) {
    return (
      "Could not reach the server. " +
      "Check your connection."
    );
  }

  return "Could not save the expense. Please try again.";
}


export default function Page() {
  const [chartData, setChartData] = useState<DailyExpense[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [categoriesRefreshKey, setCategoriesRefreshKey] = useState(0);

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
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
  const [operationType, setOperationType] = useState<"expense" | "income">("expense");
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>("all");

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
      setExpenseFormError("Enter a description, amount, and category.");
      return;
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setExpenseFormError("Expense amount must be greater than zero.");
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


  const addIncome = async (income: IncomeCreate): Promise<void> => {
    await apiFetch<IncomeItem>("/incomes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(income),
    });

    setIsDashboardLoading(true);
    setRefreshKey((key) => key + 1);
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
        message: "Could not delete the expense. Please try again.",
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
            "Could not load categories.Please try again.",
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
          incomesData,
        ] = await Promise.all([
          apiFetch<ExpenseItem[]>(`/expenses/list?${query}`, { signal: controller.signal }),
          apiFetch<DailyExpense[]>(`/expenses/daily?${query}`, { signal: controller.signal }),
          apiFetch<CategorySummary[]>(`/expenses/summary?${query}`, { signal: controller.signal }),
          apiFetch<Stats>(`/expenses/stats?${query}`, { signal: controller.signal }),
          apiFetch<Balance>("/balance", { signal: controller.signal }),
          apiFetch<BudgetStatus[]>(`/budgets/status?year=${budgetPeriod.year}&month=${budgetPeriod.month}`, { signal: controller.signal },),
          apiFetch<IncomeItem[]>(`/incomes?${query}`, { signal: controller.signal, }),
        ]);

        if (controller.signal.aborted) {
          return;
        }

        if (!Array.isArray(incomesData)) {
          throw new Error("Expected income records to be an array");
        }

        setExpenses(Array.isArray(expensesData) ? expensesData : []);
        setIncomes(incomesData);
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

  const transactions = buildTransactions(expenses, incomes);

  const visibleTransactions = transactions.filter((transaction) => {
    return (
      transactionFilter === "all" ||
      transaction.type === transactionFilter
    );
  });


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
              <div
                className="flex gap-2"
                role="group"
                aria-label="Transaction type"
              >
                <button
                  type="button"
                  aria-pressed={operationType === "expense"}
                  onClick={() => setOperationType("expense")}
                  className={`rounded-lg px-4 py-2 ${operationType === "expense"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700"
                    }`}
                >
                  Expense
                </button>

                <button
                  type="button"
                  aria-pressed={operationType === "income"}
                  onClick={() => setOperationType("income")}
                  className={`rounded-lg px-4 py-2 ${operationType === "income"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700"
                    }`}
                >
                  Income
                </button>
              </div>


              <div hidden={operationType !== "expense"}>
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
              </div>

              <div hidden={operationType !== "income"}>
                <IncomeForm onCreate={addIncome} />
              </div>


              {/* TRANSACTION LIST */}
              <TransactionList
                transactions={visibleTransactions}
                filter={transactionFilter}
                onFilterChange={setTransactionFilter}
                isLoading={isDashboardLoading}
                formatCurrency={formatCurrency}
                onDeleteExpense={deleteExpense}
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
