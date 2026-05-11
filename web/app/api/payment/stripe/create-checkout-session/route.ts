import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { getServerSiteOrigin } from "@/lib/site";

export const runtime = "nodejs";

/** PKR line item amount — Stripe expects smallest currency unit (1 PKR = 100 paisa). */
export function stripeAmountFromPkr(totalPkr: number): number {
  return Math.max(1, Math.round(Number(totalPkr) * 100));
}

/**
 * POST /api/payment/stripe/create-checkout-session
 * Validates the order then returns a Stripe Checkout URL (hosted redirect).
 */
export async function POST(request: Request) {
  if (!process.env.STRIPE_SECRET_KEY?.trim()) {
    return NextResponse.json(
      { error: "Stripe is not configured (STRIPE_SECRET_KEY)." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as {
      orderId?: string;
      customerEmail?: string;
    };
    const orderId = body.orderId?.trim();
    const customerEmail = body.customerEmail?.trim().toLowerCase();

    if (!orderId || !customerEmail) {
      return NextResponse.json(
        { error: "orderId and customerEmail are required" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: order, error: qErr } = await supabase
      .from("orders")
      .select(
        "id,order_number,user_id,customer_email,total_pkr,payment_method,payment_status",
      )
      .eq("id", orderId)
      .maybeSingle();

    if (qErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.payment_method !== "card") {
      return NextResponse.json(
        { error: "This order is not billed with Stripe Checkout" },
        { status: 400 },
      );
    }

    if (order.payment_status !== "pending") {
      return NextResponse.json(
        { error: "Payment for this order is already finalized" },
        { status: 400 },
      );
    }

    if (user?.id && order.user_id && order.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const orderMail =
      typeof order.customer_email === "string"
        ? order.customer_email.trim().toLowerCase()
        : "";

    if (orderMail !== customerEmail) {
      return NextResponse.json(
        { error: "Customer email does not match this order" },
        { status: 403 },
      );
    }

    const unitAmount = stripeAmountFromPkr(Number(order.total_pkr));
    if (!Number.isFinite(unitAmount)) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    }

    const stripe = getStripe();
    const origin = getServerSiteOrigin();
    const label =
      typeof order.order_number === "string" && order.order_number
        ? `Order ${order.order_number}`
        : `Order ${order.id.slice(0, 8)}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail,
      metadata: { order_id: order.id },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(order.id)}`,
      cancel_url: `${origin}/checkout/cancel?order_id=${encodeURIComponent(order.id)}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "pkr",
            unit_amount: unitAmount,
            product_data: {
              name: label,
              description: "Razzaq Luxe — online store",
            },
          },
        },
      ],
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 502 },
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (e) {
    console.error("[Stripe create-checkout-session]", e);
    const message =
      e instanceof Error ? e.message : "Stripe checkout creation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
