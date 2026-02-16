import { describe, it, expect } from "vitest";
import { mapStripeStatus, subscriptionToPayload } from "@/lib/stripe-helpers";
import type Stripe from "stripe";

describe("mapStripeStatus", () => {
  it("maps 'active' to 'active'", () => {
    expect(mapStripeStatus("active")).toBe("active");
  });

  it("maps 'canceled' to 'canceled'", () => {
    expect(mapStripeStatus("canceled")).toBe("canceled");
  });

  it("maps 'past_due' to 'past_due'", () => {
    expect(mapStripeStatus("past_due")).toBe("past_due");
  });

  it("maps 'incomplete' to 'incomplete'", () => {
    expect(mapStripeStatus("incomplete")).toBe("incomplete");
  });

  it("maps 'incomplete_expired' to 'incomplete'", () => {
    expect(mapStripeStatus("incomplete_expired")).toBe("incomplete");
  });

  it("maps 'trialing' to 'trialing'", () => {
    expect(mapStripeStatus("trialing")).toBe("trialing");
  });

  it("maps 'unpaid' to 'unpaid'", () => {
    expect(mapStripeStatus("unpaid")).toBe("unpaid");
  });

  it("maps 'paused' to 'canceled'", () => {
    expect(mapStripeStatus("paused")).toBe("canceled");
  });
});

describe("subscriptionToPayload", () => {
  function makeSubscription(overrides: Partial<{
    id: string;
    customer: string;
    status: Stripe.Subscription.Status;
    priceId: string;
    clerkUserId: string;
    currentPeriodEnd: number;
    cancelAtPeriodEnd: boolean;
  }> = {}): Stripe.Subscription {
    return {
      id: overrides.id ?? "sub_123",
      customer: overrides.customer ?? "cus_abc",
      status: overrides.status ?? "active",
      metadata: { clerkUserId: overrides.clerkUserId ?? "user_xyz" },
      items: {
        data: [{ price: { id: overrides.priceId ?? "price_pro_123" } }],
      },
      current_period_end: overrides.currentPeriodEnd ?? 1700000000,
      cancel_at_period_end: overrides.cancelAtPeriodEnd ?? false,
    } as unknown as Stripe.Subscription;
  }

  it("maps a pro subscription correctly", () => {
    const payload = subscriptionToPayload(makeSubscription());
    expect(payload).toEqual({
      clerkUserId: "user_xyz",
      stripeCustomerId: "cus_abc",
      stripeSubscriptionId: "sub_123",
      stripePriceId: "price_pro_123",
      plan: "pro",
      status: "active",
      currentPeriodEnd: 1700000000000,
      cancelAtPeriodEnd: false,
    });
  });

  it("maps a team subscription correctly", () => {
    const payload = subscriptionToPayload(
      makeSubscription({ priceId: "price_team_456", status: "trialing" }),
    );
    expect(payload.plan).toBe("team");
    expect(payload.status).toBe("trialing");
  });

  it("maps unknown priceId to free plan", () => {
    const payload = subscriptionToPayload(
      makeSubscription({ priceId: "price_unknown" }),
    );
    expect(payload.plan).toBe("free");
  });

  it("converts current_period_end to milliseconds", () => {
    const payload = subscriptionToPayload(
      makeSubscription({ currentPeriodEnd: 1000 }),
    );
    expect(payload.currentPeriodEnd).toBe(1000000);
  });

  it("preserves cancel_at_period_end flag", () => {
    const payload = subscriptionToPayload(
      makeSubscription({ cancelAtPeriodEnd: true }),
    );
    expect(payload.cancelAtPeriodEnd).toBe(true);
  });

  it("handles subscription with empty items gracefully", () => {
    const sub = {
      id: "sub_empty",
      customer: "cus_abc",
      status: "active",
      metadata: { clerkUserId: "user_xyz" },
      items: { data: [] },
      current_period_end: 1700000000,
      cancel_at_period_end: false,
    } as unknown as Stripe.Subscription;

    const payload = subscriptionToPayload(sub);
    expect(payload.stripePriceId).toBe("");
    expect(payload.plan).toBe("free");
  });
});
