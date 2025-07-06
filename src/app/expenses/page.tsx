"use client";

import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import ExpensesList from "@/components/ExpensesList";
import Link from "next/link";
import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Doc } from "../../../convex/_generated/dataModel";

// This component renders the main content of the page when the user is authenticated.
const COLORS = ["#A3A1FB", "#FFD6A5", "#FFADAD", "#CAFFBF", "#BDB2FF", "#FDFFB6", "#9BF6FF"];

function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload || payload.length === 0) return null;
    const { name, value } = payload[0];
  const color = payload[0]?.payload?.fill ?? payload[0].fill ?? payload[0].color ?? "#ffffff";
  return (
    <div
      style={{ backgroundColor: color, color: "#111111" }}
      className="shadow-lg text-sm font-semibold px-3 py-2 rounded-lg"
    >
      {`${name}: $${(value as number).toFixed(2)}`}
    </div>
  );
}


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

function ExpensesPageContent({ currentUser }: { currentUser: Doc<"users"> }) {
  const expenses = useQuery(api.expenses.getExpenses, { userId: currentUser._id });

  // dashboard data
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const monthlyExpenses = useQuery(api.expenses.getMonthlyExpenses, { userId: currentUser._id, year, month });
  const logout = useMutation(api.users.logout);
  const router = useRouter();
  const convex = useConvex();

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem("convex_auth_token");
    await convex.setAuth(async () => null);
    // Full page reload to ensure all state is cleared
    window.location.href = "/";
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Expenses</h1>
          <MonthPicker year={year} month={month} onChange={(y,m)=>{setYear(y);setMonth(m);}} />
        </div>

        <div className="flex gap-2">
          <Link
            href="/add-expense"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Expense
          </Link>
          <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
        </div>
      </header>
      {/* Chart Section */}
      {monthlyExpenses === undefined ? (
        <div className="text-center text-gray-400 mb-8">Loading chart...</div>
      ) : monthlyExpenses.length === 0 ? (
        <div className="text-center text-gray-400 mb-8">No expenses for selected month.</div>
      ) : (
        (() => {
          const total = monthlyExpenses.reduce((s,e)=>s+e.amount,0);
          const byCat: Record<string, number> = {};
          monthlyExpenses.forEach(e=>{byCat[e.category]=(byCat[e.category]||0)+e.amount;});
          const data = Object.entries(byCat).map(([name,value])=>({name,value}));
          return (
            <div className="relative w-full mb-8 bg-gray-800 p-4 rounded-lg flex flex-col items-center sm:flex-row sm:h-80">
              <div className="relative w-full h-64 sm:h-full sm:flex-1">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={data}
                      innerRadius={90}
                      outerRadius={100}
                      paddingAngle={4}
                      cornerRadius={10}
                      labelLine={false}
                      label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {data.map((entry: {name: string; value: number}, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} wrapperStyle={{ outline: "none" }} isAnimationActive={false} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-white">${total.toFixed(0)}</span>
                </div>
              </div>

            </div>
          );
        })()
      )}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <ExpensesList expenses={expenses} />
      </div>
    </div>
  );
}

// This is the main component that handles the authentication flow.
export default function ExpensesPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("convex_auth_token") ?? undefined : undefined;
  const currentUser = useQuery(api.users.currentUser, { tokenIdentifier: token });
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    // We only want to redirect if the query is done and the user is null.
    if (currentUser === null) {
      router.push("/");
    }
  }, [currentUser, router]);

  // While the query is loading, show a loading screen.
  if (currentUser === undefined) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  // If the user is not logged in, show a redirecting screen while the useEffect kicks in.
  if (currentUser === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-2xl">Redirecting...</div>
      </div>
    );
  }

  // If the user is logged in, render the main page content.
  return <ExpensesPageContent currentUser={currentUser} />;
}
