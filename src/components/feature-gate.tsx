"use client";

import { ReactNode } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { isPlanAtLeast, PLANS } from "@/lib/plans";
import type { PlanKey } from "@/lib/plans";
import Link from "next/link";

interface FeatureGateProps {
  minimum: PlanKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ minimum, children, fallback }: FeatureGateProps) {
  const { plan, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <div className="animate-pulse rounded-xl border border-gray-200 bg-gray-100 p-6 h-24" />
    );
  }

  if (isPlanAtLeast(plan, minimum)) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
      <p className="text-sm font-medium text-gray-600">
        This feature requires the{" "}
        <span className="font-bold text-indigo-600">{PLANS[minimum].name}</span>{" "}
        plan.
      </p>
      <Link
        href="/settings/billing"
        className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Upgrade Now
      </Link>
    </div>
  );
}
