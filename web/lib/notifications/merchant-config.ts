import { normalizePkWhatsAppTo } from "@/lib/whatsapp";

const DEFAULT_MERCHANT_ORDER_EMAIL = "waqarandcompany990@gmail.com";
const DEFAULT_MERCHANT_WHATSAPP = "+923332361713";

/** Merchant inbox for new-order alerts (Resend). */
export function getMerchantOrderEmail(): string {
  const raw = process.env.MERCHANT_ORDER_EMAIL?.trim();
  if (raw && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return raw;
  return DEFAULT_MERCHANT_ORDER_EMAIL;
}

/**
 * E.164-style merchant WhatsApp destination for Meta Cloud API sends.
 * Accepts `03332361713`, `923332361713`, or `+923332361713`.
 */
export function getMerchantWhatsAppE164(): string {
  const raw =
    process.env.MERCHANT_WHATSAPP?.trim() || DEFAULT_MERCHANT_WHATSAPP;
  const digits = normalizePkWhatsAppTo(raw);
  if (!digits) {
    const fallback = normalizePkWhatsAppTo(DEFAULT_MERCHANT_WHATSAPP);
    return fallback ? `+${fallback}` : DEFAULT_MERCHANT_WHATSAPP;
  }
  return `+${digits}`;
}
