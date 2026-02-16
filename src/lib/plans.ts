export const PLANS = {
  free: {
    name: "Free",
    description: "Get started with the basics",
    price: "$0",
    priceId: null,
    features: [
      "Up to 3 projects",
      "Basic analytics",
      "Community support",
    ],
  },
  pro: {
    name: "Pro",
    description: "For professionals who need more",
    price: "$50/mo",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID ?? "",
    features: [
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
    ],
  },
  team: {
    name: "Team",
    description: "For teams that need to collaborate",
    price: "$100/mo",
    priceId: process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID ?? "",
    features: [
      "Everything in Pro",
      "Team management",
      "SSO authentication",
      "Dedicated account manager",
      "SLA guarantee",
    ],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

const PLAN_HIERARCHY: Record<PlanKey, number> = {
  free: 0,
  pro: 1,
  team: 2,
};

export function isPlanAtLeast(currentPlan: PlanKey, requiredPlan: PlanKey): boolean {
  return PLAN_HIERARCHY[currentPlan] >= PLAN_HIERARCHY[requiredPlan];
}

export function getPlanFromPriceId(priceId: string): PlanKey {
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_TEAM_PRICE_ID) return "team";
  if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID) return "pro";
  return "free";
}
