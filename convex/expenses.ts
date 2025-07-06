import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { ConvexError } from "convex/values";

const getUser = async (
  ctx: QueryCtx | MutationCtx,
  tokenIdentifier: string | null
) => {
  if (!tokenIdentifier) {
    return null;
  }
  return await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
    .unique();
};



export const getExpenses = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("expenses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Fetch expenses for a specific user and month
export const getMonthlyExpenses = query({
  args: {
    userId: v.id("users"),
    year: v.number(), // e.g. 2025
    month: v.number(), // 1-12
  },
  handler: async (ctx, { userId, year, month }) => {
    const expenses = await ctx.db
      .query("expenses")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();

    const start = new Date(year, month - 1, 1).getTime();
    const end = new Date(year, month, 1).getTime();

    return expenses.filter((e) => e.date >= start && e.date < end);
  },
});

