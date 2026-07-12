import { Router } from "express";
import { stripe } from "./client";
import { DIGITAL_PRODUCTS, SUBSCRIPTION_PLANS, getProductById, getPlanById } from "./products";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const stripeCheckoutRouter = Router();

// Helper: get or create Stripe customer for a user
async function getOrCreateStripeCustomer(userId: number, email: string, name: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const user = userRows[0];

  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { userId: userId.toString() },
  });

  await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, userId));
  return customer.id;
}

// POST /api/stripe/checkout/product — one-time purchase
stripeCheckoutRouter.post("/product", async (req, res) => {
  try {
    const { productId } = req.body as { productId: string };
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const product = getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const customerId = await getOrCreateStripeCustomer(user.id, user.email ?? "", user.name ?? "");
    const origin = req.headers.origin ?? "https://anomarsty.lol";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              description: product.description,
              metadata: { productId: product.id },
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      allow_promotion_codes: true,
      client_reference_id: user.id.toString(),
      metadata: {
        user_id: user.id.toString(),
        product_id: product.id,
        product_name: product.name,
        customer_email: user.email ?? "",
        customer_name: user.name ?? "",
      },
      success_url: `${origin}/orders?session_id={CHECKOUT_SESSION_ID}&success=1`,
      cancel_url: `${origin}/shop?canceled=1`,
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error("[Stripe checkout/product]", err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/stripe/checkout/subscription — recurring subscription
stripeCheckoutRouter.post("/subscription", async (req, res) => {
  try {
    const { planId } = req.body as { planId: string };
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const plan = getPlanById(planId);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    const customerId = await getOrCreateStripeCustomer(user.id, user.email ?? "", user.name ?? "");
    const origin = req.headers.origin ?? "https://anomarsty.lol";

    // Build price data — use stripePriceId if set, otherwise create inline price
    const priceData: any = plan.stripePriceId
      ? { price: plan.stripePriceId }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Sanctuary ${plan.name} Membership`,
              description: plan.description,
              metadata: { planId: plan.id },
            },
            unit_amount: plan.price,
            recurring: { interval: plan.interval },
          },
        };

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ ...priceData, quantity: 1 }],
      mode: "subscription",
      allow_promotion_codes: true,
      client_reference_id: user.id.toString(),
      metadata: {
        user_id: user.id.toString(),
        plan_id: plan.id,
        customer_email: user.email ?? "",
        customer_name: user.name ?? "",
      },
      success_url: `${origin}/orders?session_id={CHECKOUT_SESSION_ID}&success=1&type=subscription`,
      cancel_url: `${origin}/shop?canceled=1`,
    });

    return res.json({ url: session.url });
  } catch (err: any) {
    console.error("[Stripe checkout/subscription]", err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/stripe/products — public product list
stripeCheckoutRouter.get("/products", (_req, res) => {
  res.json({ products: DIGITAL_PRODUCTS, plans: SUBSCRIPTION_PLANS });
});
