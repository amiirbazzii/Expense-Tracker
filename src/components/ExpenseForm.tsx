"use client";

import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { Doc } from "../../convex/_generated/dataModel";

export default function ExpenseForm({ currentUser }: { currentUser: Doc<"users"> }) {
  const createExpense = useMutation(api.functions.createExpense.createExpense);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [forField, setForField] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createExpense({
        amount: parseFloat(amount),
        title,
        category,
        date: new Date(date).getTime(),
        userId: currentUser._id,
        for: forField || undefined,
      });
      setAmount("");
      setTitle("");
      setCategory("");
      setForField("");
    } catch (error) {
      console.error("Failed to create expense:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
        <label className="block mb-2 text-sm font-medium text-gray-300">Category</label>
        <motion.input whileFocus={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          disabled={isLoading}
        />
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
        className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
        disabled={isLoading}
      >
        {isLoading ? "Adding..." : "Add Expense"}
      </motion.button>
    </form>
  );
}
