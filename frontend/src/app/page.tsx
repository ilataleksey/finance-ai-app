"use client";

// npm run dev - запустить сервер

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  ResponsiveContainer,
} from "recharts";

import { apiFetch } from "@/services/api";
import { buildDateParams } from "@/utils/dateParams";
import DashboardCards from "@/components/DashboardCards";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import type {
  Category,
  ExpenseItem,
  DailyExpense,
  CategorySummary,
  Stats,
  Balance,
  BudgetStatus,
} from "@/types/api";

content: {
  "./src/app/**/*.{js, ts, jsx,tsx}"
}

export default function Page() {
  const [chartData, setChartData] = useState<DailyExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summaryData, setSummaryData] = useState<CategorySummary[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [balanceData, setBalanceData] = useState<Balance | null>(null);
  const [period, setPeriod] = useState("month");
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);

  const PERIOD = [
    { id: "day", title: "DAY" },
    { id: "week", title: "WEEK" },
    { id: "week_to_date", title: "WTD" },
    { id: "month", title: "MNT" },
    { id: "month_to_day", title: "MTD" },
    { id: "year", title: "YR" },
    { id: "year_to_day", title: "YTD" },
    { id: "custom", title: "Other" },
  ]

  const formatCurrency = (value: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const getBudgetBarColor = (percent: number) => {
    if (percent > 100) {
      return "bg-red-500";
    }

    if (percent >= 80) {
      return "bg-yellow-500";
    }

    return "bg-green-500";
  }

  //=====ЗАГРУЗКА ДАННЫХ=====

  // загрузка списка категорий
  const fetchExpenses = async () => {
    const data = await apiFetch(`/expenses/list?${buildDateParams(startDate, endDate)}`);
    setExpenses(Array.isArray(data) ? data : []);
  };

  // загрузка категорий
  const fetchCategories = async () => {
    const data = await apiFetch(`/categories`);
    setCategories(Array.isArray(data) ? data : []);
  };

  // загрузка данных для графика
  const fetchChart = async () => {
    const data = await apiFetch(`/expenses/daily?${buildDateParams(startDate, endDate)}`);
    setChartData(Array.isArray(data) ? data : []);
  };

  // загрузка итогов по категориям
  const fetchSummary = async () => {
    const data = await apiFetch(`/expenses/summary?${buildDateParams(startDate, endDate)}`);
    setSummaryData(Array.isArray(data) ? data : []);
  };

  // фильтр по датам
  const fetchStats = async () => {
    const data = await apiFetch(`/expenses/stats?${buildDateParams(startDate, endDate)}`);
    setStats(data);
  };

  // загрузка баланса
  const fetchBalance = async () => {
    const data = await apiFetch(`/balance`);
    setBalanceData(data);
  }

  // загрузка бюджета
  const fetchBudgetStatus = async () => {
    const data = await apiFetch(`/budgets/status?${buildDateParams(startDate, endDate)}`);

    setBudgetStatus(Array.isArray(data) ? data : []);
  };

  // вычисление дат для фильтра кнопками
  const applyPeriod = (period: string) => {
    const today = new Date();

    let start = "";
    let end = today.toISOString().split("T")[0];

    switch (period) {
      case "today":
        start = end;
        break;

      case "week":
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);

        start = weekAgo.toISOString().split("T")[0]
        break;

      case "month":
        start = `${today.getFullYear()}-${String(
          today.getMonth() + 1
        ).padStart(2, "0")}-01`;
        break;

      case "year":
        start = `${today.getFullYear()}-01-01`;
        break;

      case "all":
        start = "";
        end = "";
        break;
    }

    setStartDate(start);
    setEndDate(end);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const refreshData = () => {
    fetchExpenses();
    fetchChart();
    fetchSummary();
    fetchStats();
    fetchBalance();
    fetchBudgetStatus();
  }

  useEffect(() => {
    refreshData();
  }, [startDate, endDate]);

  useEffect(() => {
    applyPeriod(period);
  }, [period]);


  const COLORS = [
    "#3BB2F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
  ];

  //=====УДАЛЕНИЕ=====
  const deleteExpense = async (id: number) => {
    await apiFetch(`/expenses/${id}`, {
      method: "DELETE",
    });

    refreshData();
  }

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
        <div className="xl:col-span-2 bg-white p-4 rounded-xl shadow overflow-x-auto">
          {/* График */}
          <h2 className="text-lg font-semibold mb-4">Daily Expenses</h2>
          {/* FILTERS */}
          <div className="flex items-end gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border p-2 rounded"
              />
            </div>

            <button
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
            >
              Reset
            </button>
          </div>

          {/* FILTERS BUTTONS */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={() => setPeriod("today")}>
              Today
            </button>

            <button onClick={() => setPeriod("week")}>
              Week
            </button>

            <button onClick={() => setPeriod("month")}>
              Month
            </button>

            <button onClick={() => setPeriod("year")}>
              Year
            </button>

            <button onClick={() => setPeriod("all")}>
              All
            </button>
          </div>

          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monoton" dataKey="total" />
              </LineChart>
            </ResponsiveContainer>
          </div>


          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">
              Expenses by Category
            </h2>

            <div className="flex flex-col xl:flex-row items-center gap-10">
              <div className="w-full h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summaryData.map((item, index) => ({
                        ...item,
                        fill: COLORS[index % COLORS.length],
                        total: Number(item.total),
                      }))}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#3B82F6"
                      isAnimationActive={false}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2">
                {summaryData.map((item, index) => (
                  <div
                    key={item.category}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor:
                          COLORS[index % COLORS.length],
                      }}
                    />
                    <div className="capitalize whitespace-nowrap">
                      {item.category}
                    </div>
                    <div className="font-semibold whitespace-nowrap">
                      ${formatCurrency(item.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BUDGET */}
          <div className="mt-8 bg-white p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold mb-4">
              Category Budgets
            </h2>

            {budgetStatus.length === 0 ? (
              <div className="text-gray-500 text-sm">
                No budgets yet
              </div>
            ) : (
              <div className="space-y-4">
                {budgetStatus.map((item) => {
                  const barWidth = Math.min(item.percent, 100);

                  return (
                    <div key={item.category}>
                      <div className="flex item-center justify-between mb-1 gap-4">
                        <div className="font-medium capitalize">
                          {item.category}
                        </div>

                        <div className="text-sm text-gray-600 whitespace-nowrap">
                          ${formatCurrency(item.spent)} / ${formatCurrency(item.budget)} (
                          {item.percent}%)
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className={`h-3 rounded-full ${getBudgetBarColor(item.percent)}`}
                          style={{
                            width: `${barWidth}%`,
                          }}
                        />
                      </div>

                      {item.percent > 100 && (
                        <div className="text-xs text-red-500 mt-1">
                          Budget exceeded
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT - FORM + LIST */}
        <div className="space-y-6">

          {/* ADD FORM */}
          <ExpenseForm
            categories={categories}
            onExpenseAdded={refreshData}
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
