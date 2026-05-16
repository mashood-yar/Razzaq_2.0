/**
 * Optional WhatsApp Cloud API notifications.
 * Set `false` to honor `WHATSAPP_ENABLED` and Meta credentials in env.
 */
export const WHATSAPP_INTEGRATION_DISABLED = false;

/**
 * Set WHATSAPP_ENABLED=true and Meta credentials in env.
 */
export function isWhatsAppEnabled(): boolean {
  if (WHATSAPP_INTEGRATION_DISABLED) return false;
  return process.env.WHATSAPP_ENABLED === "true";
}

export async function sendWhatsAppText(toE164: string, body: string): Promise<void> {
  if (!isWhatsAppEnabled()) return;
  const token = process.env.WHATSAPP_API_TOKEN?.trim();
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  if (!token || !phoneId) {
    console.warn("[WhatsApp] enabled but missing WHATSAPP_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID");
    return;
  }

  const normalized = toE164.replace(/\D/g, "");
  if (normalized.length < 10) return;

  const res = await fetch(
    `https://graph.facebook.com/v21.0/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: normalized.startsWith("92")
          ? normalized
          : normalized.startsWith("0")
            ? `92${normalized.slice(1)}`
            : `92${normalized}`,
        type: "text",
        text: { body },
      }),
    },
  );

  if (!res.ok) {
    const t = await res.text();
    console.error("[WhatsApp] send failed", res.status, t);
  }
}
