import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    username: v.string(),
    hashedPassword: v.string(),
    tokenIdentifier: v.string(),
  })
    .index("by_username", ["username"])
    .index("by_token", ["tokenIdentifier"]),
  expenses: defineTable({
    amount: v.number(),
    title: v.string(),
    category: v.string(),
    for: v.optional(v.string()),
    date: v.number(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
});
