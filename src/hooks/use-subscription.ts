"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { PlanKey } from "@/lib/plans";
import { isPlanAtLeast } from "@/lib/plans";

export function useSubscription() {
  const subscription = useQuery(api.subscriptions.getSubscription);

  const plan: PlanKey = (subscription?.plan as PlanKey) ?? "free";
  const isLoading = subscription === undefined;

  return {
    subscription,
    plan,
    isLoading,
    isFree: plan === "free",
    isPro: isPlanAtLeast(plan, "pro"),
    isTeam: isPlanAtLeast(plan, "team"),
    status: subscription?.status ?? "active",
    currentPeriodEnd: subscription && "currentPeriodEnd" in subscription
      ? subscription.currentPeriodEnd
      : undefined,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
  };
}
