import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/stripe-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const secret = process.env.CONVEX_WEBHOOK_SECRET;
    const authHeader = request.headers.get("Authorization");

    if (!secret || authHeader !== `Bearer ${secret}`) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    if (type === "upsert") {
      await ctx.runMutation(internal.subscriptions.upsertSubscription, data);
    } else if (type === "delete") {
      await ctx.runMutation(internal.subscriptions.deleteSubscription, {
        stripeSubscriptionId: data.stripeSubscriptionId,
      });
    }

    return new Response("OK", { status: 200 });
  }),
});

export default http;
