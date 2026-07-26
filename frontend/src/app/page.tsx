"use client";

// npm run dev - запустить сервер

import { useEffect, useState } from "react";

import { apiFetch } from "@/services/api";
import { formatLocalDate, getPeriodDateRange, type PeriodId } from "@/utils/dateRange";
import { buildDateParams } from "@/utils/dateParams";
import DashboardCards from "@/components/DashboardCards";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import ChartSection from "@/components/ChartSection";
import CategoryPieChart from "@/components/CategoryPieChart";
import BudgetSection from "@/components/BudgetSection";

import type {
  Category,
  ExpenseItem,
  DailyExpense,
  CategorySummary,
  Stats,
  Balance,
  BudgetStatus,
} from "@/types/api";

export default function Page() {
  const [chartData, setChartData] = useState<DailyExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [dateRange, setDateRange] = useState(() => getPeriodDateRange("month"));
  const [summaryData, setSummaryData] = useState<CategorySummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [balanceData, setBalanceData] = useState<Balance | null>(null);
  const [period, setPeriod] = useState<PeriodId | null>("month");
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  const { startDate, endDate } = dateRange;

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [createdAt, setCreatedAt] = useState(() => formatLocalDate(new Date()));

  const formatCurrency = (value: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const addExpense = async () => {
    if (!title || !amount || !categoryId) {
      alert("заполни все поля");
      return;
    };

    await apiFetch(`/expenses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        amount: parseFloat(amount),
        category_id: Number(categoryId),
        created_at: createdAt,
      }),
    });

    setTitle("");
    setAmount("");
    setCategoryId("");
    setIsDashboardLoading(true);
    setRefreshKey((key) => key + 1);
  };


  //=====DELETE=====
  const deleteExpense = async (id: number) => {
    await apiFetch(`/expenses/${id}`, {
      method: "DELETE",
    });
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

        if (!controller.signal.aborted) {
          setCategories(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Failed to load categories", error);
        }
      }
    }

    void loadCategories();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const query = buildDateParams(startDate, endDate);

    async function loadDashboardData() {
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
          apiFetch<BudgetStatus[]>(`/budgets/status?${query}`, { signal: controller.signal }),
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
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsDashboardLoading(false);
        }
      }
    }

    void loadDashboardData();

    return () => controller.abort();
  }, [endDate, refreshKey, startDate]);

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
      {/* HEADER */}
      <h1 className="text-3xl font-bold mb-6">Finance AI Dashboard</h1>


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

          {isDashboardLoading && (
            <div
              className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700"
              role="status"
            >
              Updating dashboard...
            </div>
          )}

          {/* CHART */}
          <ChartSection
            chartData={chartData}
            startDate={startDate}
            endDate={endDate}
            period={period}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            onReset={() => handlePeriodChange("all")}
            onPeriodChange={handlePeriodChange}
          />

          {/* PIE */}
          <CategoryPieChart
            summaryData={summaryData}
            formatCurrency={formatCurrency}
          />

          {/* BUDGET */}
          <BudgetSection
            budgetStatus={budgetStatus}
            formatCurrency={formatCurrency}
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

            categories={categories}

            setTitle={setTitle}
            setAmount={setAmount}
            setCategoryId={setCategoryId}
            setCreatedAt={setCreatedAt}

            onSubmit={addExpense}
          />

          {/* EXPENSE LIST */}
          <ExpenseList
            expenses={expenses}
            formatCurrency={formatCurrency}
            onDelete={deleteExpense}
          />

        </div>
      </div>
    </div>
  );
}
