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

