import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSubscription = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const clerkUserId = identity.subject;
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (!subscription) {
      return { plan: "free" as const, status: "active" as const, cancelAtPeriodEnd: false };
    }

    return subscription;
  },
});

export const ensureSubscriptionRecord = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const clerkUserId = identity.subject;
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("subscriptions", {
      clerkUserId,
      plan: "free",
      status: "active",
      cancelAtPeriodEnd: false,
      updatedAt: Date.now(),
    });
  },
});

export const upsertSubscription = mutation({
  args: {
    webhookSecret: v.string(),
    clerkUserId: v.string(),
    stripeCustomerId: v.string(),
    stripeSubscriptionId: v.string(),
    stripePriceId: v.string(),
    plan: v.union(v.literal("free"), v.literal("pro"), v.literal("team")),
    status: v.union(
      v.literal("active"),
      v.literal("canceled"),
      v.literal("past_due"),
      v.literal("incomplete"),
      v.literal("trialing"),
      v.literal("unpaid"),
    ),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
  },
  handler: async (ctx, args) => {
    const secret = process.env.CONVEX_WEBHOOK_SECRET;
    if (!secret || args.webhookSecret !== secret) {
      throw new Error("Unauthorized");
    }

    const { webhookSecret: _, ...data } = args;
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", data.clerkUserId))
      .unique();

    const record = {
      ...data,
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, record);
    } else {
      await ctx.db.insert("subscriptions", record);
    }
  },
});

export const deleteSubscription = mutation({
  args: {
    webhookSecret: v.string(),
    stripeSubscriptionId: v.string(),
  },
  handler: async (ctx, args) => {
    const secret = process.env.CONVEX_WEBHOOK_SECRET;
    if (!secret || args.webhookSecret !== secret) {
      throw new Error("Unauthorized");
    }

    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_stripeSubscriptionId", (q) =>
        q.eq("stripeSubscriptionId", args.stripeSubscriptionId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        plan: "free",
        status: "canceled",
        stripeSubscriptionId: undefined,
        stripePriceId: undefined,
        cancelAtPeriodEnd: false,
        updatedAt: Date.now(),
      });
    }
  },
});
