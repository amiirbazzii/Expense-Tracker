"use client";

import { useEffect } from "react";
import { useConvex, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { readPendingExpenses, removePendingExpense } from "@/lib/indexedDb";

export default function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const convex = useConvex();
  const createExpense = useMutation(api.functions.createExpense.createExpense);

  // flush queue when we come online
  useEffect(() => {
    async function flush() {
      const queue = await readPendingExpenses();
      for (const item of queue) {
        try {
          await createExpense(item.data as any);
          await removePendingExpense(item.localId);
        } catch (err) {
          console.error("Failed to sync pending expense", err);
        }
      }
      // notify others
      window.dispatchEvent(new Event("expenses-updated"));
    }

    if (navigator.onLine) flush();

    const handleOnline = () => flush();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [createExpense]);

  return <>{children}</>;
}
