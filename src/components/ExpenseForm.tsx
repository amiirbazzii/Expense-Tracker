"use client";

import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import CategoryTagInput from "./CategoryTagInput";
import { api } from "../../convex/_generated/api";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Doc } from "../../convex/_generated/dataModel";

export default function ExpenseForm({ currentUser }: { currentUser: Doc<"users"> }) {
  const createExpense = useMutation(api.functions.createExpense.createExpense);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [forField, setForField] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!amount) newErrors.general = "Amount is required";
    else if (parseFloat(amount) <= 0) newErrors.general = "Amount must be positive";
    else if (!title.trim()) newErrors.general = "Title is required";
    else if (categories.length === 0) newErrors.general = "At least one category is required";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      await createExpense({
        amount: parseFloat(amount),
        title,
        categories,
        date: new Date(date).getTime(),
        userId: currentUser._id,
        for: forField || undefined,
      });
      setAmount("");
      setTitle("");
      setCategories([]);
      setForField("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error("Failed to create expense:", error);
      setErrors({ general: "Failed to add expense. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    {success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="mb-4 flex items-center gap-2 text-green-400 font-semibold"
        >
          <span>✔ Expense added!</span>
        </motion.div>
      )}
      {errors.general && (
        <p className="mb-4 text-red-400 text-sm">{errors.general}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-300">Amount</label>
        <motion.input whileFocus={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-300">Title</label>
        <motion.input whileFocus={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-300">Categories</label>
        <CategoryTagInput userId={currentUser._id as any} value={categories} onChange={setCategories} />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-300">For (optional)</label>
        <motion.input whileFocus={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}
          type="text"
          value={forField}
          onChange={(e) => setForField(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-300">Date</label>
        <motion.input whileFocus={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
      </div>
      <motion.button whileTap={{ scale: 0.95 }}
        type="submit"
        className={`w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed ${isLoading ? 'opacity-50' : ''}`}
        disabled={isLoading}
      >
        {isLoading ? "Adding..." : "Add Expense"}
      </motion.button>
    </form>
  </>
  );
}
