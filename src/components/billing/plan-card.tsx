"use client";

import { useState } from "react";
import type { PlanKey } from "@/lib/plans";
import { PLANS, isPlanAtLeast } from "@/lib/plans";

interface PlanCardProps {
  planKey: PlanKey;
  currentPlan: PlanKey;
  hasStripeSubscription: boolean;
}

export function PlanCard({ planKey, currentPlan, hasStripeSubscription }: PlanCardProps) {
  const [loading, setLoading] = useState(false);
  const plan = PLANS[planKey];
  const isCurrent = planKey === currentPlan;
  const isUpgrade = !isPlanAtLeast(currentPlan, planKey);
  const isDowngrade = isPlanAtLeast(currentPlan, planKey) && !isCurrent;

  async function handleCheckout() {
    if (!plan.priceId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: plan.priceId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`flex flex-col rounded-2xl border-2 p-6 ${
        isCurrent
          ? "border-indigo-600 bg-indigo-50"
          : "border-gray-200 bg-white"
      }`}
    >
      {isCurrent && (
        <span className="mb-2 inline-block self-start rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
          Current Plan
        </span>
      )}
      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
      <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
      <p className="mt-4 text-3xl font-bold text-gray-900">{plan.price}</p>
      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <div className="mt-6">
        {isCurrent ? (
          <button
            disabled
            className="w-full rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-400"
          >
            Current Plan
          </button>
        ) : isUpgrade ? (
          <button
            onClick={hasStripeSubscription ? handlePortal : handleCheckout}
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Redirecting..." : "Upgrade"}
          </button>
        ) : isDowngrade ? (
          <button
            onClick={handlePortal}
            disabled={loading}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? "Redirecting..." : "Downgrade"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
