/**
 * Deep-link for customers to WhatsApp Razzaq with order context (optional feature).
 */
export function customerSupportWhatsAppUrl(orderNumber: string): string | null {
  if (process.env.WHATSAPP_ENABLED !== "true") return null;

  const raw =
    process.env.WHATSAPP_BUSINESS_PHONE?.trim() ||
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE?.trim();
  if (!raw) return null;

  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;

  const msg = encodeURIComponent(
    `Assalamualaikum — I need help with Razzaq Luxe order ${orderNumber}.`,
  );
  return `https://wa.me/${digits}?text=${msg}`;
}
