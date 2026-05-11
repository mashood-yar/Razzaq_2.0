import { createHmac, timingSafeEqual } from "crypto";

/**
 * Safepay signs webhooks with HMAC-SHA512 over the raw JSON body bytes.
 * @see https://safepay-docs.netlify.app/developers/webhooks/verify-hmac-signatures/
 * Header name is typically `x-sfpy-signature` (compare case-insensitively).
 */
export function verifySafepayWebhookSignature(
  rawBodyUtf8: string,
  signatureHeader: string | null,
  webhookSecret: string,
): boolean {
  if (!signatureHeader?.trim() || !webhookSecret) return false;

  const expectedHex = createHmac("sha512", webhookSecret)
    .update(rawBodyUtf8, "utf8")
    .digest("hex");

  let received = signatureHeader.trim();
  received = /^sha512=/i.test(received)
    ? received.replace(/^sha512=/i, "")
    : received;

  try {
    const a = Buffer.from(received.toLowerCase(), "hex");
    const b = Buffer.from(expectedHex.toLowerCase(), "hex");
    return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
