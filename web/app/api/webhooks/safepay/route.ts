import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { verifySafepayWebhookSignature } from "@/lib/safepay/verify-webhook";
import { sendOrderConfirmationEmail } from "@/lib/resend/client";
import type { Order } from "@/lib/types";

export const runtime = "nodejs";

/** Safepay sends `x-sfpy-signature`; compare case-insensitively per HTTP spec. */
function getSafepaySignatureHeader(request: Request): string | null {
  const h = request.headers;
  const direct =
    h.get("x-sfpy-signature") ??
    h.get("X-SFPY-SIGNATURE") ??
    undefined;
  if (direct) return direct;
  const fromEntries = Array.from(h.entries()).find(
    ([k]) => k.toLowerCase() === "x-sfpy-signature",
  );
  return fromEntries?.[1] ?? null;
}

/** Safepay 2.x webhooks — confirm captures and update Supabase orders. */
export async function POST(request: Request) {
  const secret = process.env.SAFEPAY_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("[Safepay webhook] SAFEPAY_WEBHOOK_SECRET is missing");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = getSafepaySignatureHeader(request);

  /*
   * Official docs use HMAC-SHA512(secret, raw_payload). Older examples may mention SHA‑256 —
   * the dashboard-generated shared secret expects SHA‑512 here.
   */
  if (!verifySafepayWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const type = typeof parsed.type === "string" ? parsed.type : "";
  const data = parsed.data as
    | {
        state?: string;
        tracker?: string;
        token?: string;
        metadata?: Record<string, unknown>;
      }
    | undefined;

  const supabase = createServiceRoleClient();

  if (type === "payment.succeeded") {
    const state = data?.state;
    const meta = data?.metadata ?? {};
    const orderIdFromMetaRaw = meta.order_id;
    let orderId: string | undefined =
      typeof orderIdFromMetaRaw === "string" ? orderIdFromMetaRaw : undefined;

    const tracker =
      typeof data?.tracker === "string"
        ? data.tracker
        : typeof data?.token === "string"
          ? data.token
          : undefined;

    if (!orderId && tracker) {
      const { data: row } = await supabase
        .from("orders")
        .select("id")
        .eq("safepay_tracker_token", tracker)
        .eq("payment_method", "safepay")
        .maybeSingle();
      orderId = row?.id;
    }

    if (!orderId || state !== "TRACKER_ENDED") {
      return NextResponse.json({ ok: true, skipped: true });
    }

    const { data: existing } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ ok: true, unknown_order: orderId });
    }

    if (existing.payment_status === "paid") {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const { data: updated, error } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status:
          existing.status === "pending" ||
          existing.status === "pending_confirmation"
            ? "confirmed"
            : existing.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .eq("payment_method", "safepay")
      .eq("payment_status", "pending")
      .select("*, order_items(*)")
      .single();

    if (error || !updated) {
      console.error("[Safepay webhook] order update:", error);
      return NextResponse.json({ ok: true, not_updated: true });
    }

    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: updated.status,
      note: `Safepay payment captured (TRACKER_ENDED, tracker=${data?.tracker ?? "?"})`,
    });

    try {
      await sendOrderConfirmationEmail(updated as unknown as Order);
    } catch (e) {
      console.error("[Safepay webhook] confirmation email failed:", e);
    }

    return NextResponse.json({ ok: true });
  }

  if (type === "payment.failed") {
    const meta =
      typeof data?.metadata === "object" && data.metadata
        ? (data.metadata as Record<string, unknown>)
        : {};
    let orderId: string | null =
      typeof meta.order_id === "string" ? meta.order_id : null;

    const tracker =
      typeof data?.tracker === "string"
        ? data.tracker
        : typeof data?.token === "string"
          ? data.token
          : undefined;

    if (!orderId && tracker) {
      const { data: row } = await supabase
        .from("orders")
        .select("id")
        .eq("safepay_tracker_token", tracker)
        .eq("payment_method", "safepay")
        .maybeSingle();
      orderId = row?.id ?? null;
    }

    if (orderId) {
      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .eq("payment_method", "safepay")
        .eq("payment_status", "pending");
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
