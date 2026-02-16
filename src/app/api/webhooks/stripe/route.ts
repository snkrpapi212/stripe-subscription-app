import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPlanFromPriceId } from "@/lib/plans";
import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === "subscription" && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );
          await relayToConvex("upsert", subscriptionToPayload(subscription));
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await relayToConvex("upsert", subscriptionToPayload(subscription));
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await relayToConvex("delete", {
          stripeSubscriptionId: subscription.id,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string,
          );
          await relayToConvex("upsert", subscriptionToPayload(subscription));
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

function subscriptionToPayload(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id ?? "";
  return {
    clerkUserId: subscription.metadata.clerkUserId,
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    plan: getPlanFromPriceId(priceId),
    status: mapStripeStatus(subscription.status),
    currentPeriodEnd: subscription.current_period_end * 1000,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  };
}

function mapStripeStatus(
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

async function relayToConvex(type: string, data: Record<string, unknown>) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const secret = process.env.CONVEX_WEBHOOK_SECRET;

  if (!convexUrl || !secret) {
    throw new Error("Missing CONVEX_URL or CONVEX_WEBHOOK_SECRET");
  }

  // Convex HTTP actions are at the same domain as the deployment URL
  const httpUrl = convexUrl.replace(".cloud", ".site");
  const response = await fetch(`${httpUrl}/stripe-webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ type, data }),
  });

  if (!response.ok) {
    throw new Error(`Convex relay failed: ${response.status} ${await response.text()}`);
  }
}
