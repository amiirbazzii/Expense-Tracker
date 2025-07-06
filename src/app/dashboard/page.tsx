"use client";
import { useConvex, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { Doc } from "../../../convex/_generated/dataModel";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ExpensesList from "@/components/ExpensesList";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

function MonthPicker({ year, month, onChange }: { year: number; month: number; onChange: (y: number, m: number) => void }) {
  return (
    <input
      type="month"
      value={`${year}-${String(month).padStart(2, "0")}`}
      onChange={(e) => {
        const [y, m] = e.target.value.split("-").map(Number);
        onChange(y, m);
      }}
      className="bg-gray-700 text-white p-2 rounded-lg"
    />
  );
}

export default function DashboardPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("convex_auth_token") ?? undefined : undefined;
  const currentUser = useQuery(api.users.currentUser, { tokenIdentifier: token });
  const router = useRouter();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const expenses = useQuery(
    api.expenses.getMonthlyExpenses,
    currentUser ? { userId: currentUser._id, year, month } : "skip"
  );

  if (currentUser === undefined || expenses === undefined) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-white">Loading...</div>
    );
  }
  if (currentUser === null) {
    router.push("/");
    return null;
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });
  const chartData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 text-white">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Your Expense Overview</h1>
        <Link href="/expenses" className="px-4 py-2 bg-blue-600 rounded-lg">Back to Expenses</Link>
      </header>
      <div className="mb-4">
        <MonthPicker year={year} month={month} onChange={(y, m) => { setYear(y); setMonth(m); }} />
      </div>
      {expenses.length === 0 ? (
        <p>No expenses for this month.</p>
      ) : (
        <>
          <p className="mb-4 text-xl">Total: ${total.toFixed(2)}</p>
          <div className="w-full h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie dataKey="value" data={chartData} outerRadius={120} label>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ExpensesList expenses={expenses} />
        </>
      )}
    </div>
  );
}
