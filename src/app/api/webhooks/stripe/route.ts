import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import { subscriptionToPayload } from "@/lib/stripe-helpers";

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

async function relayToConvex(type: string, data: Record<string, unknown>) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const secret = process.env.CONVEX_WEBHOOK_SECRET;

  if (!convexUrl || !secret) {
    throw new Error("Missing CONVEX_URL or CONVEX_WEBHOOK_SECRET");
  }

  // In production, Convex HTTP actions use .site instead of .cloud
  // For local dev (127.0.0.1), use the CONVEX_SITE_URL env var or same URL
  const httpUrl = process.env.CONVEX_SITE_URL
    ?? (convexUrl.includes(".cloud")
      ? convexUrl.replace(".cloud", ".site")
      : convexUrl);

  const targetUrl = `${httpUrl}/stripe-webhook`;
  console.log(`Relaying webhook to: ${targetUrl}`);

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secret}`,
    },
    body: JSON.stringify({ type, data }),
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Convex relay failed: ${response.status} ${text} (URL: ${targetUrl})`);
    throw new Error(`Convex relay failed: ${response.status} ${text}`);
  }
}
