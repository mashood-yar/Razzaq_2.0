/**
 * Optional WhatsApp Cloud API notifications.
 * Set `false` to honor `WHATSAPP_ENABLED` and Meta credentials in env.
 */
export const WHATSAPP_INTEGRATION_DISABLED = false;

const META_GRAPH_API_VERSION = "v21.0";

export type WhatsAppConfigMissing =
  | "WHATSAPP_API_TOKEN"
  | "WHATSAPP_PHONE_NUMBER_ID";

export type WhatsAppConfigStatus = {
  enabled: boolean;
  ready: boolean;
  missing: WhatsAppConfigMissing[];
};

export type WhatsAppSendResult =
  | { sent: true }
  | { sent: false; reason: string };

/**
 * Set WHATSAPP_ENABLED=true and Meta credentials in env.
 */
export function isWhatsAppEnabled(): boolean {
  if (WHATSAPP_INTEGRATION_DISABLED) return false;
  return process.env.WHATSAPP_ENABLED === "true";
}

/**
 * Meta Cloud API `to` field: country code + national number, digits only (no +).
 * Accepts `03332361713`, `923332361713`, or `+923332361713`.
 */
export function normalizePkWhatsAppTo(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;

  if (digits.startsWith("92") && digits.length >= 12) return digits;
  if (digits.startsWith("0") && digits.length >= 10) return `92${digits.slice(1)}`;
  if (digits.length === 10) return `92${digits}`;
  if (digits.startsWith("92")) return digits;

  return `92${digits}`;
}

/** Non-throwing config check for logs and dry-runs. */
export function getWhatsAppConfigStatus(): WhatsAppConfigStatus {
  const enabled = isWhatsAppEnabled();
  const missing: WhatsAppConfigMissing[] = [];

  if (!process.env.WHATSAPP_API_TOKEN?.trim()) {
    missing.push("WHATSAPP_API_TOKEN");
  }
  if (!process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()) {
    missing.push("WHATSAPP_PHONE_NUMBER_ID");
  }

  return {
    enabled,
    ready: enabled && missing.length === 0,
    missing,
  };
}

export async function sendWhatsAppText(
  to: string,
  body: string,
): Promise<WhatsAppSendResult> {
  if (!isWhatsAppEnabled()) {
    return { sent: false, reason: "WHATSAPP_ENABLED is not true" };
  }

  const config = getWhatsAppConfigStatus();
  if (!config.ready) {
    const reason = `missing ${config.missing.join(" and ")}`;
    console.warn(`[WhatsApp] enabled but ${reason}`);
    return { sent: false, reason };
  }

  const token = process.env.WHATSAPP_API_TOKEN!.trim();
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID!.trim();
  const toDigits = normalizePkWhatsAppTo(to);

  if (!toDigits) {
    console.warn("[WhatsApp] invalid recipient phone:", to);
    return { sent: false, reason: "invalid_recipient" };
  }

  const res = await fetch(
    `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toDigits,
        type: "text",
        text: { body },
      }),
    },
  );

  if (!res.ok) {
    const detail = await res.text();
    console.error("[WhatsApp] send failed", res.status, detail);
    return { sent: false, reason: `api_error_${res.status}` };
  }

  return { sent: true };
}
