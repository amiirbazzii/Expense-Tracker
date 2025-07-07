"use client";
import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { cacheExpenses, readCachedExpenses, readPendingExpenses } from "@/lib/indexedDb";
import type { SyncStatus } from "@/lib/indexedDb";
import { Doc } from "../../convex/_generated/dataModel";

export type ExpenseWithStatus = Doc<"expenses"> & { syncStatus?: SyncStatus; error?: string };

export default function useCachedExpenses(userId: string) {
  const live = useQuery(api.expenses.getExpenses, { userId: userId as any });
  const [data, setData] = useState<ExpenseWithStatus[] | undefined>(live);

  // When online & data arrives, cache it
  useEffect(() => {
    if (live !== undefined) {
      const liveWithStatus = (live ?? []).map((e) => ({ ...e, syncStatus: "synced" as SyncStatus }));
      setData(liveWithStatus);
      cacheExpenses(live).catch(() => null);
    }
  }, [live]);

  // initial offline load
  useEffect(() => {
    async function loadOffline() {
      if (navigator.onLine) return; // only if offline
      const cached = await readCachedExpenses();
      const pending = await readPendingExpenses();
      const pendingDocs = pending.map((p) => ({
        ...p.data,
        _id: p.localId as any,
        _creationTime: p.data.tempDate,
        syncStatus: p.syncStatus,
        error: p.error,
      })) as ExpenseWithStatus[];
      const cachedWithStatus: ExpenseWithStatus[] = cached.map((c) => ({ ...c, syncStatus: "synced" as SyncStatus }));
      setData([...cachedWithStatus, ...pendingDocs]);
    }
    loadOffline();
  }, [userId]);

  // listen to custom event for pending updates
  useEffect(() => {
    const handler = async () => {
      const cached = await readCachedExpenses();
      const pending = await readPendingExpenses();
      const pendingDocs = pending.map((p) => ({
        ...p.data,
        _id: p.localId as any,
        _creationTime: p.data.tempDate,
        syncStatus: p.syncStatus,
        error: p.error,
      })) as ExpenseWithStatus[];
      const cachedWithStatus: ExpenseWithStatus[] = cached.map((c) => ({ ...c, syncStatus: "synced" as SyncStatus }));
      setData([...cachedWithStatus, ...pendingDocs]);
    };
    window.addEventListener("expenses-updated", handler);
    return () => window.removeEventListener("expenses-updated", handler);
  }, []);

  return data;
}
