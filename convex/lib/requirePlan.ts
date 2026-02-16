import { QueryCtx, MutationCtx } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";

type PlanKey = "free" | "pro" | "team";

const PLAN_HIERARCHY: Record<PlanKey, number> = {
  free: 0,
  pro: 1,
  team: 2,
};

export async function requirePlan(
  ctx: QueryCtx | MutationCtx,
  minimumPlan: PlanKey,
): Promise<Doc<"subscriptions"> | { plan: "free"; status: "active" }> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  const currentPlan: PlanKey = (subscription?.plan as PlanKey) ?? "free";

  if (PLAN_HIERARCHY[currentPlan] < PLAN_HIERARCHY[minimumPlan]) {
    throw new Error(
      `This feature requires the ${minimumPlan} plan. You are on the ${currentPlan} plan.`,
    );
  }

  return subscription ?? { plan: "free" as const, status: "active" as const };
}
