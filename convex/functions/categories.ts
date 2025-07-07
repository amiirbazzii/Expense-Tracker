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
  handler: async (ctx, { userId, name }) => {
    const canonical = name.trim().toLowerCase().replace(/\s+/g, "-");
    // Avoid duplicates for the same user
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_userId_name", (q) => q.eq("userId", userId).eq("name", canonical))
      .unique();

    if (!existing) {
      await ctx.db.insert("categories", { userId, name: canonical });
    }
    return null;
  },
});
