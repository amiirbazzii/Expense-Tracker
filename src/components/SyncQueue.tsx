"use client";
import { useState, useEffect } from "react";
import { getPendingOnly, getFailedExpenses, removePendingExpense } from "@/lib/indexedDb";
import { updatePendingStatus } from "@/lib/indexedDb";

export default function SyncQueue() {
  const [pending, setPending] = useState<any[]>([]);
  const [failed, setFailed] = useState<any[]>([]);

  const loadQueue = async () => {
    setPending(await getPendingOnly());
    setFailed(await getFailedExpenses());
  };

  useEffect(() => {
    loadQueue();
    
    // Refresh when expenses are updated
    const handler = () => loadQueue();
    window.addEventListener("expenses-updated", handler);
    return () => window.removeEventListener("expenses-updated", handler);
  }, []);

  const handleRetry = async (localId: string) => {
    await updatePendingStatus(localId, "pending");
    window.dispatchEvent(new Event("expenses-updated"));
  };

  const handleRetryAll = async () => {
    for (const item of failed) {
      await updatePendingStatus(item.localId, "pending");
    }
    window.dispatchEvent(new Event("expenses-updated"));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Sync Queue</h2>
      
      {/* Failed Section */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-red-400">❌ Failed Expenses</h3>
          {failed.length > 0 && (
            <button 
              onClick={handleRetryAll}
              className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
            >
              Retry All
            </button>
          )}
        </div>
        
        {failed.length === 0 ? (
          <p className="text-gray-400 text-sm">All expenses synced successfully!</p>
        ) : (
          <ul className="space-y-3">
            {failed.map((item) => (
              <li key={item.localId} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                <div>
                  <p className="text-white font-medium">{item.data.title}</p>
                  <p className="text-gray-400 text-sm">${item.data.amount} • {new Date(item.data.date).toLocaleDateString()}</p>
                  {item.error && <p className="text-red-300 text-xs mt-1">{item.error}</p>}
                </div>
                <button 
                  onClick={() => handleRetry(item.localId)}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
                >
                  Retry
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Pending Section */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-400 mb-4">🕓 Pending Expenses</h3>
        
        {pending.length === 0 ? (
          <p className="text-gray-400 text-sm">No pending expenses</p>
        ) : (
          <ul className="space-y-3">
            {pending.map((item) => (
              <li key={item.localId} className="flex justify-between items-center bg-gray-700 p-3 rounded">
                <div>
                  <p className="text-white font-medium">{item.data.title}</p>
                  <p className="text-gray-400 text-sm">${item.data.amount} • {new Date(item.data.date).toLocaleDateString()}</p>
                </div>
                <span className="text-yellow-400 text-sm">Pending...</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
