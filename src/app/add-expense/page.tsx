"use client";

import { useQuery } from "convex/react";
import PageTransition from "@/components/PageTransition";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ExpenseForm from "../../components/ExpenseForm";
import Link from "next/link";
import { Doc } from "../../../convex/_generated/dataModel";

function AddExpenseContent({ currentUser }: { currentUser: Doc<"users"> }) {
  const router = useRouter();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Add New Expense
        </h1>
        <div className="flex gap-2">
          <Link
            href="/expenses"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            View Expenses
          </Link>
          <Link
            href="/settings"
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Settings
          </Link>
        </div>
      </header>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <ExpenseForm currentUser={currentUser} />
      </div>
    </div>
  );
}

export default function AddExpensePage() {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("convex_auth_token") ?? undefined
      : undefined;

  const currentUser = useQuery(api.users.currentUser, {
    tokenIdentifier: token,
  });
  const router = useRouter();

  useEffect(() => {
    if (currentUser === null) {
      router.push("/");
    }
  }, [currentUser, router]);

  if (currentUser === undefined) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (currentUser === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-2xl">Redirecting...</div>
      </div>
    );
  }

  return (
    <PageTransition>
      <AddExpenseContent currentUser={currentUser} />
    </PageTransition>
  );
}
