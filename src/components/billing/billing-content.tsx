"use client";

import { useSearchParams } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { CurrentPlanBanner } from "./current-plan-banner";
import { PlanCard } from "./plan-card";
import type { PlanKey } from "@/lib/plans";

const PLAN_KEYS: PlanKey[] = ["free", "pro", "team"];

export function BillingContent() {
  const searchParams = useSearchParams();
  const {
    plan,
    isLoading,
    status,
    currentPeriodEnd,
    cancelAtPeriodEnd,
    subscription,
  } = useSubscription();

  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";

  const hasStripeSubscription = !!(
    subscription &&
    "stripeSubscriptionId" in subscription &&
    subscription.stripeSubscriptionId
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          Subscription activated successfully! Your plan has been upgraded.
        </div>
      )}
      {canceled && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Checkout was canceled. No charges were made.
        </div>
      )}

      <CurrentPlanBanner
        plan={plan}
        status={status}
        currentPeriodEnd={currentPeriodEnd}
        cancelAtPeriodEnd={cancelAtPeriodEnd}
        hasStripeSubscription={hasStripeSubscription}
      />

      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Available Plans
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {PLAN_KEYS.map((key) => (
            <PlanCard
              key={key}
              planKey={key}
              currentPlan={plan}
              hasStripeSubscription={hasStripeSubscription}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
