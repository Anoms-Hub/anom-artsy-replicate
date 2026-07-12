import { Router, Request, Response } from "express";
import { stripe } from "./client";
import { ENV } from "../_core/env";
import { getDb } from "../db";
import { orders, userSubscriptions } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const stripeWebhookRouter = Router();

stripeWebhookRouter.post("/", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return res.json({ verified: true });
  }

  console.log(`[Webhook] Event: ${event.type} | ID: ${event.id}`);

  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    switch (event.type) {
      // ── One-time payment completed ────────────────────────────────────────
      case "checkout.session.completed": {
        const session = event.data.object;
        if (session.mode !== "payment") break;

        const userId = parseInt(session.metadata?.user_id ?? "0", 10);
        const productId = session.metadata?.product_id ?? "unknown";
        const productName = session.metadata?.product_name ?? "Unknown Product";
        const amountTotal = session.amount_total ?? 0;

        if (userId > 0) {
          await db.insert(orders).values({
            userId,
            stripeSessionId: session.id,
            stripePaymentIntentId: session.payment_intent ?? null,
            productId,
            productName,
            amount: amountTotal,
            currency: session.currency ?? "usd",
            status: "completed",
          }).onDuplicateKeyUpdate({ set: { status: "completed" } });

          console.log(`[Webhook] Order saved for user ${userId}: ${productName} ($${amountTotal / 100})`);
        }
        break;
      }

      // ── Subscription created or updated ───────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const userId = parseInt(sub.metadata?.user_id ?? "0", 10);
        const planId = sub.metadata?.plan_id ?? sub.items?.data?.[0]?.price?.metadata?.planId ?? "explorer";
        const stripePriceId = sub.items?.data?.[0]?.price?.id ?? "";
        const currentPeriodEnd = (sub.current_period_end ?? 0) * 1000; // to ms

        if (userId > 0) {
          await db.insert(userSubscriptions).values({
            userId,
            stripeSubscriptionId: sub.id,
            stripePriceId,
            planId,
            status: sub.status,
            currentPeriodEnd,
            cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
          }).onDuplicateKeyUpdate({
            set: {
              status: sub.status,
              stripePriceId,
              planId,
              currentPeriodEnd,
              cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
            },
          });

          console.log(`[Webhook] Subscription ${event.type} for user ${userId}: plan=${planId} status=${sub.status}`);
        }
        break;
      }

      // ── Subscription deleted / canceled ───────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        await db
          .update(userSubscriptions)
          .set({ status: "canceled" })
          .where(eq(userSubscriptions.stripeSubscriptionId, sub.id));

        console.log(`[Webhook] Subscription canceled: ${sub.id}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error("[Webhook] Handler error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }

  return res.json({ received: true });
});
