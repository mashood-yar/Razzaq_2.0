import {
  WHATSAPP_INTEGRATION_DISABLED,
  normalizePkWhatsAppTo,
} from "@/lib/whatsapp";

function resolveBusinessPhoneDigits(): string | null {
  const candidates = [
    process.env.WHATSAPP_BUSINESS_PHONE?.trim(),
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE?.trim(),
    process.env.MERCHANT_WHATSAPP?.trim(),
    process.env.NEXT_PUBLIC_CHECKOUT_UPAISA_NUMBER?.trim(),
  ];

  for (const raw of candidates) {
    if (!raw) continue;
    const digits = normalizePkWhatsAppTo(raw);
    if (digits) return digits;
  }

  return null;
}

/**
 * Deep-link for customers to WhatsApp Razzaq with order context (optional feature).
 */
export function customerSupportWhatsAppUrl(orderNumber: string): string | null {
  if (WHATSAPP_INTEGRATION_DISABLED) return null;
  if (process.env.WHATSAPP_ENABLED !== "true") return null;

  const digits = resolveBusinessPhoneDigits();
  if (!digits) return null;

  const msg = encodeURIComponent(
    `Hello — I need help with Razzaq Luxe order ${orderNumber}.`,
  );
  return `https://wa.me/${digits}?text=${msg}`;
}
