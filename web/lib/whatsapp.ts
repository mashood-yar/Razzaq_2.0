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

type MetaGraphErrorBody = {
  error?: {
    message?: string;
    code?: number;
    error_subcode?: number;
    type?: string;
  };
};

/** Map Meta Graph errors to actionable log lines (test mode, bad token, etc.). */
function logMetaSendFailure(status: number, detail: string): string {
  try {
    const parsed = JSON.parse(detail) as MetaGraphErrorBody;
    const err = parsed.error;
    if (!err) {
      console.error("[WhatsApp] send failed", status, detail);
      return `api_error_${status}`;
    }

    const sub = err.error_subcode;
    const msg = err.message ?? "unknown Meta error";

    if (
      sub === 131030 ||
      /not in allowed list|recipient.*not.*valid/i.test(msg)
    ) {
      console.error(
        "[WhatsApp] recipient not on Meta allow list — in developers.facebook.com → your app → WhatsApp → API Setup, add MERCHANT_WHATSAPP (+923332361713) as a test recipient until the app is Live.",
      );
      return "recipient_not_allowed";
    }

    if (err.code === 190 || /access token/i.test(msg)) {
      console.error(
        "[WhatsApp] invalid or expired WHATSAPP_API_TOKEN — generate a new permanent system-user token in Meta Business Settings.",
      );
      return "invalid_token";
    }

    if (/phone number id/i.test(msg) || err.code === 100) {
      console.error(
        "[WhatsApp] check WHATSAPP_PHONE_NUMBER_ID — use the numeric Phone number ID from API Setup, not the display phone number.",
        { code: err.code, subcode: sub },
      );
    }

    console.error("[WhatsApp] Meta API error:", msg, {
      status,
      code: err.code,
      subcode: sub,
      type: err.type,
    });
    return `api_error_${status}`;
  } catch {
    console.error("[WhatsApp] send failed", status, detail);
    return `api_error_${status}`;
  }
}

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
    const reason = logMetaSendFailure(res.status, detail);
    return { sent: false, reason };
  }

  return { sent: true };
}
