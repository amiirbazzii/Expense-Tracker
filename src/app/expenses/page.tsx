"use client";

import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ExpenseForm from "../../components/ExpenseForm";
import ExpensesList from "@/components/ExpensesList";
import { Doc } from "../../../convex/_generated/dataModel";

// This component renders the main content of the page when the user is authenticated.
function ExpensesPageContent({ currentUser }: { currentUser: Doc<"users"> }) {
  const expenses = useQuery(api.expenses.getExpenses);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Welcome, {currentUser.username}
        </h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Add New Expense
            </h2>
            <ExpenseForm currentUser={currentUser} />
          </div>
        </div>
        <div className="lg:col-span-3">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">
              Your Expenses
            </h2>
            <ExpensesList expenses={expenses} />
          </div>
        </div>
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
