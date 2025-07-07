"use client";

import { useEffect } from "react";
import { useConvex, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { readPendingExpenses, removePendingExpense, updatePendingStatus } from "@/lib/indexedDb";

export default function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const convex = useConvex();
  const createExpense = useMutation(api.functions.createExpense.createExpense);

  // flush queue when we come online
  useEffect(() => {
    async function flush() {
      const queue = await readPendingExpenses();
      for (const item of queue) {
        // skip items already marked failed and we're offline? we still retry
        try {
          await createExpense(item.data as any);
          await updatePendingStatus(item.localId, "synced");
          // remove after a short delay to allow UI to show synced before disappearing
          await removePendingExpense(item.localId);
        } catch (err:any) {
          console.error("Failed to sync pending expense", err);
          await updatePendingStatus(item.localId, "failed", err?.message ?? "Unknown error");
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
