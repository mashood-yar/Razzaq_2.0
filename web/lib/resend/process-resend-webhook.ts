import type { SupabaseClient } from "@supabase/supabase-js";
import type { WebhookEventPayload } from "resend";
import { sendEmail } from "@/lib/admin/email";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { RESEND_ORDER_EMAIL_KIND } from "@/lib/resend/order-email-tags";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

type OrderTags = { orderId: string; emailKind: string };

function tagsFromEmailData(
  data: { tags?: Record<string, string> } | undefined,
): OrderTags | null {
  const tags = data?.tags;
  if (!tags) return null;
  const orderId = tags.order_id;
  const emailKind = tags.email_kind;
  if (!orderId || !emailKind || !isUuid(orderId)) return null;
  return { orderId, emailKind };
}

function bounceDetailText(event: WebhookEventPayload): string {
  try {
    switch (event.type) {
      case "email.bounced":
        return JSON.stringify(event.data.bounce);
      case "email.failed":
        return JSON.stringify(event.data.failed);
      case "email.suppressed":
        return JSON.stringify(event.data.suppressed);
      case "email.complained":
        return "complained (spam report)";
      default:
        return event.type;
    }
  } catch {
    return String(event.type);
  }
}

async function sendBounceAlert(payload: {
  orderId: string;
  emailKind: string | null;
  eventType: string;
  detail: string;
  resendEmailId: string;
}) {
  const to =
    process.env.RESEND_BOUNCE_ALERT_EMAIL?.trim() ||
    process.env.RESEND_ALERT_EMAIL?.trim();
  if (!to) return;

  const subject = `[Razzaq] Email issue: ${payload.eventType}`;
  const html = `<p><strong>Resend webhook — transactional email problem</strong></p>
<ul>
<li><strong>Order ID:</strong> ${payload.orderId}</li>
<li><strong>Email kind:</strong> ${payload.emailKind ?? "—"}</li>
<li><strong>Event:</strong> ${payload.eventType}</li>
<li><strong>Resend email id:</strong> ${payload.resendEmailId}</li>
</ul>
<pre style="background:#f4f4f4;padding:12px;border-radius:8px;white-space:pre-wrap">${escapeHtml(
    payload.detail,
  )}</pre>`;
  try {
    await sendEmail({ to, subject, html });
  } catch (e) {
    console.error("[Resend webhook] bounce alert email failed:", e);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function patchOrderTxnFields(
  supabase: SupabaseClient,
  orderId: string,
  patch: Record<string, unknown>,
) {
  const { error } = await supabase
    .from("orders")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) throw error;
}

/**
 * Updates `orders` from Resend events when tags include `order_id` + `email_kind`
 * (see `orderEmailTags` on outbound sends). Optional admin alert via
 * `RESEND_BOUNCE_ALERT_EMAIL` or `RESEND_ALERT_EMAIL`.
 */
export async function processResendWebhookEvent(event: WebhookEventPayload) {
  if (
    event.type === "contact.created" ||
    event.type === "contact.updated" ||
    event.type === "contact.deleted" ||
    event.type === "domain.created" ||
    event.type === "domain.updated" ||
    event.type === "domain.deleted" ||
    event.type === "email.received"
  ) {
    return;
  }

  const tags =
    "data" in event && event.data && typeof event.data === "object"
      ? tagsFromEmailData(
          event.data as { tags?: Record<string, string> },
        )
      : null;
  if (!tags) return;

  const resendEmailId =
    "data" in event &&
    event.data &&
    "email_id" in event.data &&
    typeof (event.data as { email_id?: string }).email_id === "string"
      ? (event.data as { email_id: string }).email_id
      : "unknown";

  const supabase = createServiceRoleClient();
  const createdAt =
    "data" in event && event.data && "created_at" in event.data
      ? (event.data as { created_at: string }).created_at
      : new Date().toISOString();

  if (event.type === "email.delivered") {
    const patch: Record<string, unknown> = {};
    if (
      tags.emailKind === RESEND_ORDER_EMAIL_KIND.CONFIRMATION ||
      tags.emailKind === RESEND_ORDER_EMAIL_KIND.ORDER_CODE
    ) {
      patch.confirmation_email_delivered_at = createdAt;
    } else if (tags.emailKind === RESEND_ORDER_EMAIL_KIND.SHIPPED) {
      patch.shipped_notice_email_delivered_at = createdAt;
    } else if (tags.emailKind === RESEND_ORDER_EMAIL_KIND.DELIVERED_NOTICE) {
      patch.delivered_notice_email_delivered_at = createdAt;
    }
    if (Object.keys(patch).length > 0) {
      await patchOrderTxnFields(supabase, tags.orderId, patch);
    }
    return;
  }

  if (
    event.type === "email.bounced" ||
    event.type === "email.failed" ||
    event.type === "email.suppressed" ||
    event.type === "email.complained"
  ) {
    const detail = bounceDetailText(event);
    await patchOrderTxnFields(supabase, tags.orderId, {
      txn_email_bounce_at: createdAt,
      txn_email_bounce_kind: `${tags.emailKind}:${event.type}`,
      txn_email_bounce_detail: detail,
    });
    await sendBounceAlert({
      orderId: tags.orderId,
      emailKind: tags.emailKind,
      eventType: event.type,
      detail,
      resendEmailId,
    });
  }
}
