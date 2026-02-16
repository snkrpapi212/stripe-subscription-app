"use client";

import { useState } from "react";
import type { PlanKey } from "@/lib/plans";
import { PLANS } from "@/lib/plans";

interface CurrentPlanBannerProps {
  plan: PlanKey;
  status: string;
  currentPeriodEnd?: number;
  cancelAtPeriodEnd: boolean;
  hasStripeSubscription: boolean;
}

export function CurrentPlanBanner({
  plan,
  status,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  hasStripeSubscription,
}: CurrentPlanBannerProps) {
  const [loading, setLoading] = useState(false);

  async function handleManageBilling() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  }

  const renewalDate = currentPeriodEnd
    ? new Date(currentPeriodEnd).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Current Plan</p>
          <p className="text-2xl font-bold text-gray-900">
            {PLANS[plan].name}{" "}
            <span className="text-lg font-normal text-gray-500">
              {PLANS[plan].price}
            </span>
          </p>
          {cancelAtPeriodEnd && renewalDate && (
            <p className="mt-1 text-sm text-amber-600">
              Cancels on {renewalDate}
            </p>
          )}
          {!cancelAtPeriodEnd && renewalDate && status === "active" && (
            <p className="mt-1 text-sm text-gray-500">
              Renews on {renewalDate}
            </p>
          )}
          {status === "past_due" && (
            <p className="mt-1 text-sm font-medium text-red-600">
              Payment past due — please update your payment method
            </p>
          )}
        </div>
        {hasStripeSubscription && (
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Manage Billing"}
          </button>
        )}
      </div>
    </div>
  );
}
