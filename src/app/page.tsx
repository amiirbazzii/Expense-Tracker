"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const token = typeof window !== "undefined" ? localStorage.getItem("convex_auth_token") ?? undefined : undefined;
  const currentUser = useQuery(api.users.currentUser, { tokenIdentifier: token });
  const router = useRouter();

  if (currentUser === undefined) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (currentUser === null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">Welcome to Expense Tracker</h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto">
              Login
            </Link>
            <Link href="/signup" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto">
              Sign Up
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (typeof window !== "undefined") {
    router.replace("/expenses");
  }
  return null;
}
