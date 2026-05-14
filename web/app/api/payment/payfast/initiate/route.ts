import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { payfastConfig, payfastJoinUrl } from "@/lib/payfast/config";
import { payfastSortedParamHash } from "@/lib/payfast/secure-hash";
import { payfastGetAccessToken } from "@/lib/payfast/token";
import { getServerSiteOrigin } from "@/lib/site";

export const runtime = "nodejs";

/** PayFast path is intentionally disabled — checkout uses COD / bank transfer instead. */

export async function POST() {
  return NextResponse.json(
    {
      disabled: true,
      error:
        "PayFast checkout is disabled for this storefront. Choose Cash on Delivery or Bank Transfer.",
    },
    { status: 503 },
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Former implementation retained for future re-enable — not invoked while disabled.
// ─────────────────────────────────────────────────────────────────────────────

function orderDatePakistan_DISABLED(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function formatTxnamt_DISABLED(totalPkr: number): string {
  return Number(totalPkr).toFixed(2);
}

function normalizeCheckoutMobile_DISABLED(input: string): string {
  const d = input.replace(/\D/g, "");
  if (d.startsWith("92")) return `0${d.slice(2)}`.slice(0, 11);
  if (!d.startsWith("0")) return `0${d}`.slice(0, 11);
  return d.slice(0, 11);
}

async function legacyPayfastInitiateDISABLED_POST(
  request: Request,
): Promise<NextResponse> {
  const cfg = payfastConfig();
  if (!cfg) {
    return NextResponse.json(
      {
        error:
          "PayFast is not configured (PAYFAST_MERCHANT_ID and PAYFAST_SECURED_KEY).",
      },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as {
      orderId?: string;
      customerEmail?: string;
      customerMobile?: string;
    };
    const orderId = body.orderId?.trim();
    const customerEmail = body.customerEmail?.trim().toLowerCase();
    const customerMobile = body.customerMobile?.trim() ?? "";

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
        "id,order_number,user_id,customer_email,total_pkr,payment_method,payment_status,ship_phone",
      )
      .eq("id", orderId)
      .maybeSingle();

    if (qErr || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.payment_method !== "payfast") {
      return NextResponse.json(
        { error: "This order does not use PayFast checkout." },
        { status: 400 },
      );
    }

    if (order.payment_status !== "pending") {
      return NextResponse.json(
        { error: "Payment for this order is already finalized." },
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
        { error: "Customer email does not match this order." },
        { status: 403 },
      );
    }

    const mobSource =
      customerMobile ||
      (typeof order.ship_phone === "string" ? order.ship_phone : "");
    const mobile = normalizeCheckoutMobile_DISABLED(mobSource);
    if (!/^03\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: "A valid Pakistani mobile (03XXXXXXXXX) is required for PayFast." },
        { status: 400 },
      );
    }

    const total = Number(order.total_pkr);
    if (!(total > 0) || Number.isNaN(total)) {
      return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
    }

    const { token: accessToken } = await payfastGetAccessToken({
      apiBaseUrl: cfg.apiBaseUrl,
      merchantId: cfg.merchantId,
      securedKey: cfg.securedKey,
      signal: AbortSignal.timeout(25_000),
    });

    if (!accessToken) {
      return NextResponse.json(
        { error: "PayFast did not return an access token." },
        { status: 502 },
      );
    }

    const origin = getServerSiteOrigin();
    const basketId = order.id;
    const successUrl = `${origin}/checkout/success?order_id=${encodeURIComponent(order.id)}&gateway=payfast`;
    const failureUrl = `${origin}/checkout/cancel?order_id=${encodeURIComponent(order.id)}`;
    const ipnUrl = `${origin}/api/webhooks/payfast`;

    const fieldsNoSig: Record<string, string> = {
      BASKET_ID: basketId,
      CHECKOUT_URL: encodeURIComponent(ipnUrl),
      CUSTOMER_EMAIL_ADDRESS: customerEmail,
      CUSTOMER_MOBILE_NO: mobile,
      FAILURE_URL: encodeURIComponent(failureUrl),
      MERCHANT_ID: cfg.merchantId,
      MERCHANT_NAME: cfg.merchantName,
      ORDER_DATE: orderDatePakistan_DISABLED(),
      PROCCODE: "00",
      SUCCESS_URL: encodeURIComponent(successUrl),
      TOKEN: accessToken,
      TXNAMT: formatTxnamt_DISABLED(total),
      TXNDESC: `Razzaq Luxe — order ${order.order_number ?? order.id.slice(0, 8)}`,
      VERSION: "NEXTJS-PAYFAST-1.0",
    };

    const SIGNATURE = payfastSortedParamHash(fieldsNoSig, cfg.securedKey);
    const fields = { ...fieldsNoSig, SIGNATURE };

    const actionUrl = payfastJoinUrl(cfg.apiBaseUrl, "/checkout");

    return NextResponse.json({
      actionUrl,
      fields,
      basketId,
    });
  } catch (e) {
    console.error("[PayFast initiate]", e);
    const message =
      e instanceof Error ? e.message : "PayFast initiate failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/** @internal Retain reference so the disabled implementation survives minification audits. */
void legacyPayfastInitiateDISABLED_POST;
