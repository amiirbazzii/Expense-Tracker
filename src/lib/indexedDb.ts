import { openDB, IDBPDatabase } from "idb";
import { Doc } from "../../convex/_generated/dataModel";

export interface PendingExpense {
  localId: string; // uuid used as key
  data: Omit<Doc<"expenses">, "_id" | "_creationTime"> & {
    tempDate: number; // timestamp when queued
  };
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
    dbPromise = openDB("expenseTracker", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("expenses")) {
          db.createObjectStore("expenses", { keyPath: "_id" });
        }
        if (!db.objectStoreNames.contains("pendingExpenses")) {
          db.createObjectStore("pendingExpenses", { keyPath: "localId" });
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

export async function addPendingExpense(pending: PendingExpense) {
  const db = await getDB();
  await db.put("pendingExpenses", pending);
}

export async function readPendingExpenses(): Promise<PendingExpense[]> {
  const db = await getDB();
  return db.getAll("pendingExpenses");
}

export async function removePendingExpense(localId: string) {
  const db = await getDB();
  await db.delete("pendingExpenses", localId);
}
