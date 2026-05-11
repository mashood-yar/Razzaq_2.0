import axios from "axios";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getServerSiteOrigin } from "@/lib/site";
import {
  safepayApiBase,
  safepayHostedCheckoutUrl,
  safepayInitEnvironment,
} from "@/lib/safepay/config";
import type {
  SafepayOrderInitRequestBody,
  SafepayOrderInitResponse,
} from "@/lib/safepay/types";

export const runtime = "nodejs";

/**
 * POST /api/payment/create-session
 * Creates a Safepay payment via POST /order/v1/init (official @sfpy/node-sdk body:
 * `client`, `amount`, `currency`, `environment`). Webhooks can still match the order
 * using `safepay_tracker_token` (and optional `order_id` query on hosted checkout).
 *
 * Payments:
 * - Visa / Mastercard: customer completes bank / card flow on Safepay’s hosted page (3‑DS handled by Safepay).
 * - Easypaisa / NayaPay / SadaPay & other wallets: customer chooses the wallet on Safepay’s hosted checkout.
 */
export async function POST(request: Request) {
  const apiKey = process.env.SAFEPAY_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Safepay is not configured (SAFEPAY_API_KEY)." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as {
      amount?: number;
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

    // `amount` is accepted for API compatibility only — always billed from DB `total_pkr`.
    void body.amount;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: order, error: qErr } = await supabase
      .from("orders")
      .select(
        "id,user_id,customer_email,total_pkr,payment_method,payment_status",
      )
      .eq("id", orderId)
      .maybeSingle();

    if (qErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.payment_method !== "safepay") {
      return NextResponse.json(
        { error: "This order does not use Safepay checkout" },
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

    const amountNum = Number(order.total_pkr);
    if (!(amountNum > 0) || Number.isNaN(amountNum)) {
      return NextResponse.json({ error: "Invalid order total" }, { status: 400 });
    }

    const apiBase = safepayApiBase();

    const initBody: SafepayOrderInitRequestBody = {
      client: apiKey,
      amount: amountNum,
      currency: "PKR",
      environment: safepayInitEnvironment(),
    };

    const { data: initPayload } = await axios.post<SafepayOrderInitResponse>(
      `${apiBase}/order/v1/init`,
      initBody,
      { headers: { "Content-Type": "application/json" }, timeout: 25_000 },
    );

    const token = initPayload?.data?.token;
    const errs = initPayload?.status?.errors;

    if (!token || (Array.isArray(errs) && errs.length > 0)) {
      console.error("[Safepay init] Bad response:", initPayload);
      return NextResponse.json(
        { error: "Safepay did not return a valid tracker token" },
        { status: 502 },
      );
    }

    const admin = createServiceRoleClient();
    const { error: persistErr } = await admin
      .from("orders")
      .update({
        safepay_tracker_token: token,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("payment_status", "pending");

    if (persistErr) {
      console.error("[Safepay init] Persist tracker:", persistErr);
      return NextResponse.json(
        { error: "Failed to save Safepay session" },
        { status: 500 },
      );
    }

    const origin = getServerSiteOrigin();
    const redirectUrl = safepayHostedCheckoutUrl({
      beaconToken: token,
      orderId: order.id,
      redirectUrl: `${origin}/checkout/success?order_id=${encodeURIComponent(order.id)}`,
      cancelUrl: `${origin}/checkout/cancel?order_id=${encodeURIComponent(order.id)}`,
      source: "custom",
      webhooks: true,
    });

    return NextResponse.json({ redirectUrl, trackerToken: token });
  } catch (e) {
    console.error("[Safepay create-session]", e);
    let message =
      e instanceof Error ? e.message : "Safepay request failed";
    if (axios.isAxiosError(e) && e.response?.data) {
      message = JSON.stringify(e.response.data).slice(0, 500);
    }
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
