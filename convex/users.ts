import { v } from "convex/values";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { ConvexError } from "convex/values";
import bcrypt from "bcryptjs";
import { internal } from "./_generated/api"; // Use the internal API object
import { Doc } from "./_generated/dataModel";

// Internal mutation to create a user.
export const createUser = internalMutation({
  args: {
    username: v.string(),
    hashedPassword: v.string(),
    tokenIdentifier: v.string(),
  },
  handler: async (ctx, { username, hashedPassword, tokenIdentifier }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();

    if (existingUser) {
      throw new ConvexError("Username is already taken.");
    }

    return await ctx.db.insert("users", {
      username,
      hashedPassword,
      tokenIdentifier,
    });
  },
});

// Public action to sign up a user.
export const signup = action({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { username, password }): Promise<Doc<"users">> => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const tokenIdentifier = crypto.randomUUID();

    await ctx.runMutation(internal.users.createUser, {
      username,
      hashedPassword,
      tokenIdentifier,
    });

    const user = await ctx.runQuery(internal.users.getUserByUsername, { username });

    if (!user) {
      throw new ConvexError("Could not find user after creation.");
    }

    return user;
  },
});

// Internal query to get a user by username.
export const getUserByUsername = internalQuery({
  args: { username: v.string() },
  handler: async (ctx, { username }): Promise<Doc<"users"> | null> => {
    return await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();
  },
});

// Public action to log in a user.
export const login = action({
  args: {
    username: v.string(),
    password: v.string(),
  },
  handler: async (ctx, { username, password }): Promise<Doc<"users">> => {
    const user = await ctx.runQuery(internal.users.getUserByUsername, { username });

    if (!user) {
      throw new ConvexError("User not found");
    }

    const isCorrectPassword = await bcrypt.compare(
      password,
      user.hashedPassword
    );

    if (!isCorrectPassword) {
      throw new ConvexError("Incorrect password");
    }

    return user;
  },
});

// Logout mutation remains the same.
export const logout = mutation({
  handler: async () => {
    // In a real app, you would invalidate the session token here.
  },
});

// currentUser query remains the same.
export const currentUser = query({
  args: {
    tokenIdentifier: v.optional(v.string()),
  },

  handler: async (ctx, { tokenIdentifier }) => {
    if (!tokenIdentifier) return null;
    return await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
      .unique();
  },
});



