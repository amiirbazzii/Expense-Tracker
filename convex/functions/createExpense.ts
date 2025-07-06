import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createExpense = mutation({
  args: {
    amount: v.number(),
    title: v.string(),
    categories: v.array(v.string()),
    for: v.optional(v.string()),
    date: v.number(), // Storing date as a timestamp
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const expenseId = await ctx.db.insert("expenses", {
      ...args,
      createdAt: Date.now(),
    });

    return expenseId;
  },
});
