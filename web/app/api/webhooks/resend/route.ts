import { NextResponse } from "next/server";
import type { WebhookEventPayload } from "resend";
import { Webhook } from "svix";
import { processResendWebhookEvent } from "@/lib/resend/process-resend-webhook";

export const runtime = "nodejs";

/**
 * Receives Resend email & account webhooks (Svix-signed).
 * Dashboard: add endpoint `https://<your-domain>/api/webhooks/resend` and paste `RESEND_WEBHOOK_SECRET`.
 * Verification uses Svix only — no RESEND_API_KEY required on this route (keys are still needed to send mail / bounce alerts elsewhere).
 * @see https://resend.com/docs/webhooks/introduction
 */
export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("[Resend webhook] RESEND_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const rawBody = await request.text();

  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");

  if (!id || !timestamp || !signature) {
    return NextResponse.json(
      { error: "Missing svix-id, svix-timestamp, or svix-signature" },
      { status: 400 },
    );
  }

  let event: WebhookEventPayload;
  try {
    event = new Webhook(secret).verify(rawBody, {
      "svix-id": id,
      "svix-timestamp": timestamp,
      "svix-signature": signature,
    }) as WebhookEventPayload;
  } catch (e) {
    console.warn("[Resend webhook] verify failed:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    await processResendWebhookEvent(event);
  } catch (e) {
    console.error("[Resend webhook] Supabase/handler error:", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  if ("data" in event && event.data && "email_id" in event.data) {
    console.info(`[Resend webhook] ${event.type} email_id=${(event.data as { email_id: string }).email_id}`);
  } else {
    console.info(`[Resend webhook] ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
