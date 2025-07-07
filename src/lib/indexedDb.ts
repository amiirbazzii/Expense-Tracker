import { openDB, IDBPDatabase } from "idb";
import { Doc } from "../../convex/_generated/dataModel";

export type SyncStatus = "pending" | "synced" | "failed";

export interface PendingExpense {
  localId: string; // uuid used as key
  data: Omit<Doc<"expenses">, "_id" | "_creationTime"> & {
    tempDate: number; // timestamp when queued
  };
  syncStatus: SyncStatus;
  error?: string;
}

type ExpenseDB = IDBPDatabase<unknown> & {
  get(storeName: "expenses", key: string): Promise<Doc<"expenses"> | undefined>;
  getAll(storeName: "expenses"): Promise<Doc<"expenses">[]>;
  put(storeName: "expenses", value: Doc<"expenses">): Promise<string>;

  getAll(storeName: "pendingExpenses"): Promise<PendingExpense[]>;
  put(storeName: "pendingExpenses", value: PendingExpense): Promise<string>;
  delete(storeName: "pendingExpenses", key: string): Promise<void>;
}

let dbPromise: Promise<ExpenseDB> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB("expenseTracker", 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("expenses")) {
          db.createObjectStore("expenses", { keyPath: "_id" });
        }
        if (!db.objectStoreNames.contains("pendingExpenses")) {
          db.createObjectStore("pendingExpenses", { keyPath: "localId" });
        } else if (db.version === 1) {
          // version bump: ensure existing records get default syncStatus
          const store = (tx: any) => tx.objectStore("pendingExpenses");
          // can't easily migrate here; we'll default when reading if missing
        }
      },
    }) as unknown as Promise<ExpenseDB>;
  }
  return dbPromise;
}

// Helpers
export async function cacheExpenses(expenses: Doc<"expenses">[]) {
  const db = await getDB();
  const tx = db.transaction("expenses", "readwrite");
  for (const ex of expenses) {
    await tx.store.put(ex);
  }
  await tx.done;
}

export async function readCachedExpenses(): Promise<Doc<"expenses">[]> {
  const db = await getDB();
  return db.getAll("expenses");
}

export async function addPendingExpense(pending: Omit<PendingExpense, "syncStatus">) {
  const record: PendingExpense = { ...pending, syncStatus: "pending" };
  const db = await getDB();
  await db.put("pendingExpenses", record);
}

export async function updatePendingStatus(localId: string, status: SyncStatus, error?: string) {
  const db = await getDB();
  const rec = (await db.get("pendingExpenses" as any, localId)) as unknown as PendingExpense | undefined;
  if (!rec) return;
  rec.syncStatus = status;
  if (error) rec.error = error;
  await db.put("pendingExpenses", rec);
}

export async function readPendingExpenses(): Promise<PendingExpense[]> {
  const db = await getDB();
  const all = (await db.getAll("pendingExpenses")) as unknown as PendingExpense[];
  // backfill syncStatus if undefined (old records)
  return all.map((r) => ({ ...r, syncStatus: r.syncStatus ?? "pending" }));
}

export async function getFailedExpenses() {
  const all = await readPendingExpenses();
  return all.filter((e) => e.syncStatus === "failed");
}

export async function getPendingOnly() {
  const all = await readPendingExpenses();
  return all.filter((e) => e.syncStatus === "pending");
}

export async function removePendingExpense(localId: string) {
  const db = await getDB();
  await db.delete("pendingExpenses", localId);
}
