import { getPlanFromPriceId } from "@/lib/plans";
import type Stripe from "stripe";

export function subscriptionToPayload(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id ?? "";
  return {
    clerkUserId: subscription.metadata.clerkUserId,
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    plan: getPlanFromPriceId(priceId),
    status: mapStripeStatus(subscription.status),
    currentPeriodEnd: (subscription.current_period_end ?? 0) * 1000,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}

export function mapStripeStatus(
  status: Stripe.Subscription.Status,
): "active" | "canceled" | "past_due" | "incomplete" | "trialing" | "unpaid" {
  const mapped: Record<string, "active" | "canceled" | "past_due" | "incomplete" | "trialing" | "unpaid"> = {
    active: "active",
    canceled: "canceled",
    past_due: "past_due",
    incomplete: "incomplete",
    incomplete_expired: "incomplete",
    trialing: "trialing",
    unpaid: "unpaid",
    paused: "canceled",
  };
  return mapped[status] ?? "active";
}
