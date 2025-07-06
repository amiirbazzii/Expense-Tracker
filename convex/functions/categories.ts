import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const getUserCategories = query({
  args: { userId: v.id("users"), prefix: v.string() },
  returns: v.array(v.object({ name: v.string() })),
  handler: async (ctx, { userId, prefix }) => {
    const lower = prefix.toLowerCase();
    const list = await ctx.db
      .query("categories")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
    return list
      .filter((c) => c.name.toLowerCase().startsWith(lower))
      .map((c) => ({ name: c.name }));
  },
});

export const createCategory = mutation({
  args: { userId: v.id("users"), name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("categories", args);
    return null;
  },
});
