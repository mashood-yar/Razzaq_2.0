import { NextResponse } from "next/server";
import { Resend } from "resend";
import { processResendWebhookEvent } from "@/lib/resend/process-resend-webhook";

export const runtime = "nodejs";

/**
 * Receives Resend email & account webhooks (svix-signed).
 * Dashboard: add endpoint `https://<your-domain>/api/webhooks/resend` and paste `RESEND_WEBHOOK_SECRET`.
 * @see https://resend.com/docs/webhooks/introduction
 */
export async function POST(request: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
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

  const resend = new Resend(process.env.RESEND_API_KEY);

  let event;
  try {
    event = resend.webhooks.verify({
      payload: rawBody,
      headers: { id, timestamp, signature },
      webhookSecret: secret,
    });
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
