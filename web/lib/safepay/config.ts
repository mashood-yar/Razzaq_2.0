/**
 * Safepay URLs align with @sfpy/node-sdk v3.x (`dist/utils/constants.js` + `checkout.js`):
 * - API: sandbox `https://sandbox.api.getsafepay.com`, live `https://api.getsafepay.com`
 * - Hosted pay: sandbox `https://sandbox.api.getsafepay.com/checkout/pay`, live `https://getsafepay.com/checkout/pay`
 */

/** Safepay REST API origin (no trailing slash). */
export function safepayApiBase(): string {
  const explicit = process.env.SAFEPAY_API_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return process.env.SAFEPAY_ENV === "live"
    ? "https://api.getsafepay.com"
    : "https://sandbox.api.getsafepay.com";
}

/**
 * Base URL for hosted checkout **before** `/pay` (i.e. `.../checkout`).
 * Override with SAFEPAY_CHECKOUT_BASE_URL if Safepay changes routing.
 */
export function safepayCheckoutBasePath(): string {
  const explicit = process.env.SAFEPAY_CHECKOUT_BASE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return process.env.SAFEPAY_ENV === "live"
    ? "https://getsafepay.com/checkout"
    : "https://sandbox.api.getsafepay.com/checkout";
}

/** `environment` field for POST /order/v1/init (SDK uses lowercase). */
export function safepayInitEnvironment():
  | "sandbox"
  | "production"
  | "development" {
  return process.env.SAFEPAY_ENV === "live" ? "production" : "sandbox";
}

/**
 * Same value as query param `env` on hosted checkout (`Checkout.create` in SDK).
 */
export function safepayCheckoutEnvParam():
  | "sandbox"
  | "production"
  | "development" {
  return safepayInitEnvironment();
}

/**
 * Hosted checkout URL per @sfpy/node-sdk `Checkout.create`:
 * `beacon`, `cancel_url`, `env`, `order_id`, `redirect_url`, `source`, `webhooks`.
 */
export function safepayHostedCheckoutUrl(opts: {
  beaconToken: string;
  orderId: string;
  redirectUrl: string;
  cancelUrl: string;
  source?: string;
  webhooks?: boolean;
}): string {
  const base = `${safepayCheckoutBasePath()}/pay`;
  const qs = new URLSearchParams({
    beacon: opts.beaconToken,
    cancel_url: opts.cancelUrl,
    env: safepayCheckoutEnvParam(),
    order_id: opts.orderId,
    redirect_url: opts.redirectUrl,
    source: opts.source ?? "custom",
    webhooks: String(opts.webhooks ?? true),
  });
  return `${base}?${qs.toString()}`;
}
