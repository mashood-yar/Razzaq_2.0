import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
}

/** PKR line item amount — Stripe expects smallest currency unit (1 PKR = 100 paisa). */
export function stripeAmountFromPkr(totalPkr: number): number {
  return Math.max(1, Math.round(Number(totalPkr) * 100));
}
