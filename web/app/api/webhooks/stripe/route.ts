import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/server";
import { sendOrderConfirmationEmail } from "@/lib/resend/client";
import type { Order } from "@/lib/types";

export const runtime = "nodejs";

async function markCardOrderPaid(
  orderId: string,
  stripePaymentIntentId: string | null,
) {
  const supabase = createServiceRoleClient();

  const { data: existing } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (!existing) return { ok: true as const, unknown_order: orderId };

  if (existing.payment_status === "paid") {
    return { ok: true as const, duplicate: true };
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
    .eq("payment_method", "card")
    .eq("payment_status", "pending")
    .select("*, order_items(*)")
    .single();

  if (error || !updated) {
    console.error("[Stripe webhook] order update:", error);
    return { ok: true as const, not_updated: true };
  }

  if (stripePaymentIntentId) {
    const { error: piErr } = await supabase
      .from("orders")
      .update({ stripe_payment_intent_id: stripePaymentIntentId })
      .eq("id", orderId);
    if (piErr) {
      console.warn(
        "[Stripe webhook] stripe_payment_intent_id not saved (column missing or RLS):",
        piErr.message,
      );
    }
  }

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: updated.status,
    note:
      stripePaymentIntentId ?
        `Stripe Checkout paid (payment_intent=${stripePaymentIntentId})`
      : "Stripe Checkout paid",
  });

  try {
    await sendOrderConfirmationEmail(updated as unknown as Order);
  } catch (e) {
    console.error("[Stripe webhook] confirmation email failed:", e);
  }

  return { ok: true as const };
}

/**
 * POST /api/webhooks/stripe
 * Configure in Stripe Dashboard → Developers → Webhooks (same URL as production, or ngrok for local).
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.error("[Stripe webhook] STRIPE_WEBHOOK_SECRET is missing");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (e) {
    console.error("[Stripe webhook] signature:", e);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") {
      return NextResponse.json({ ok: true, skipped: "not_paid" });
    }

    const orderId = session.metadata?.order_id;
    if (!orderId) {
      return NextResponse.json({ ok: true, skipped: "no_order_id" });
    }

    const piRef = session.payment_intent;
    const piId =
      typeof piRef === "string" ? piRef
      : piRef && typeof piRef === "object" && "id" in piRef ?
        String((piRef as { id: string }).id)
      : null;

    const result = await markCardOrderPaid(orderId, piId);
    return NextResponse.json(result);
  }

  return NextResponse.json({ ok: true, ignored: event.type });
}
