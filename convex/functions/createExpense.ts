import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createExpense = mutation({
  args: {
    amount: v.number(),
    title: v.string(),
    categories: v.optional(v.array(v.string())),
    // legacy single category
    category: v.optional(v.string()),
    for: v.optional(v.string()),
    date: v.number(), // Storing date as a timestamp
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const categories = args.categories ?? (args.category ? [args.category] : []);
    const expenseId = await ctx.db.insert("expenses", {
      ...args,
      categories,
      createdAt: Date.now(),
    });

    return expenseId;
  },
});
