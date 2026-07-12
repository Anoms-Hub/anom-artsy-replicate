import Stripe from "stripe";
import { ENV } from "../_core/env";

export const stripe = new Stripe(ENV.stripeSecretKey || "sk_test_placeholder", {
  apiVersion: "2026-06-24.dahlia",
});
