import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { jazzcashConfig } from "@/lib/jazzcash/config";
import {
  buildMwalletRequestPayload,
  normalizePkMobileWalletMsisdn,
} from "@/lib/jazzcash/mwallet";
import {
  jazzcashFlatten,
  verifyJazzcashSecureHash,
} from "@/lib/jazzcash/secure-hash";
import { markJazzcashOrderPaid } from "@/lib/jazzcash/mark-paid";
import { getServerSiteOrigin } from "@/lib/site";

export const runtime = "nodejs";

function txnRefForOrder(orderId: string): string {
  const tail = orderId.replace(/-/g, "").slice(0, 12);
  const slot = 19 - 1 - tail.length;
  const stamp = String(Date.now()).slice(-Math.max(4, slot));
  const raw = `T${tail}${stamp}`;
  return raw.slice(0, 20);
}

/**
 * POST /api/payment/jazzcash/initiate
 * Server-side JazzCash MWALLET JSON call (sandbox/live URL from env).
 */
export async function POST(request: Request) {
  const cfg = jazzcashConfig();
  if (!cfg) {
    return NextResponse.json(
      { error: "JazzCash is not configured (merchant id / password / salt)." },
      { status: 500 },
    );
  }

  try {
    const body = (await request.json()) as {
      orderId?: string;
      customerEmail?: string;
      mobileNumber?: string;
      cnicLast6?: string;
    };
    const orderId = body.orderId?.trim();
    const customerEmail = body.customerEmail?.trim().toLowerCase();
    const mobileRaw = body.mobileNumber?.trim() ?? "";
    const cnicDigits = String(body.cnicLast6 ?? "").replace(/\D/g, "");

    if (!orderId || !customerEmail || !mobileRaw) {
      return NextResponse.json(
        { error: "orderId, customerEmail, and mobileNumber are required" },
        { status: 400 },
      );
    }

    if (cnicDigits.length !== 6) {
      return NextResponse.json(
        { error: "cnicLast6 must be exactly 6 digits (CNIC last digits)." },
        { status: 400 },
      );
    }

    const mobile = normalizePkMobileWalletMsisdn(mobileRaw);
    if (!/^03\d{9}$/.test(mobile)) {
      return NextResponse.json(
        { error: "Enter a valid Pakistani JazzCash mobile (03XXXXXXXXX)." },
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

    if (order.payment_method !== "jazzcash") {
      return NextResponse.json(
        { error: "This order is not set up for JazzCash." },
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

    const total = Number(order.total_pkr);
    if (!(total > 0) || Number.isNaN(total)) {
      return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
    }

    const txnRefNo = txnRefForOrder(order.id);
    const admin = createServiceRoleClient();
    const { error: persistErr } = await admin
      .from("orders")
      .update({
        jazzcash_txn_ref_no: txnRefNo,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("payment_status", "pending");

    if (persistErr) {
      console.error("[JazzCash initiate] persist txn ref:", persistErr);
      return NextResponse.json(
        { error: "Could not save JazzCash reference." },
        { status: 500 },
      );
    }

    const origin = getServerSiteOrigin();
    const returnUrl = `${origin}/api/webhooks/jazzcash`;

    const payload = buildMwalletRequestPayload({
      cfg,
      txnRefNo,
      amountPkr: total,
      mobileNumber: mobile,
      cnicLast6: cnicDigits,
      billReference: order.order_number ?? order.id.slice(0, 8),
      description: `Razzaq Luxe order ${order.order_number ?? order.id.slice(0, 8)}`,
      returnUrl,
    });

    const jcRes = await fetch(cfg.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45_000),
    });

    const rawText = await jcRes.text();
    let gatewayJson: Record<string, unknown>;
    try {
      gatewayJson = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      console.error("[JazzCash initiate] Non-JSON:", rawText.slice(0, 800));
      return NextResponse.json(
        {
          error: "JazzCash returned an unexpected response.",
          detail: rawText.slice(0, 400),
        },
        { status: 502 },
      );
    }

    const flat = jazzcashFlatten(gatewayJson);
    const code = flat.pp_ResponseCode ?? "";

    if (flat.pp_SecureHash && !verifyJazzcashSecureHash(flat, cfg.integritySalt)) {
      console.warn("[JazzCash initiate] Response hash verification failed");
      return NextResponse.json(
        {
          error: "JazzCash response could not be verified.",
          gateway: flat,
        },
        { status: 502 },
      );
    }

    if (code === "000") {
      const marked = await markJazzcashOrderPaid(
        order.id,
        `JazzCash MWALLET paid (txnRef=${txnRefNo})`,
      );
      return NextResponse.json({
        paid: true,
        orderId: order.id,
        txnRefNo,
        gateway: flat,
        confirmation: marked,
      });
    }

    return NextResponse.json(
      {
        paid: false,
        txnRefNo,
        responseCode: code,
        message: flat.pp_ResponseMessage ?? "",
        gateway: flat,
      },
      { status: jcRes.ok ? 200 : 502 },
    );
  } catch (e) {
    console.error("[JazzCash initiate]", e);
    const message = e instanceof Error ? e.message : "JazzCash request failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
