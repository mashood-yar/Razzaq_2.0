import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { payfastConfig } from "@/lib/payfast/config";
import {
  payfastFlattenParams,
  payfastVerifySortedParamHash,
} from "@/lib/payfast/secure-hash";
import { markPayfastOrderPaid } from "@/lib/payfast/mark-paid";

export const runtime = "nodejs";

function basketIdFromPayload(flat: Record<string, string>): string | null {
  const raw =
    flat.BASKET_ID ||
    flat.basket_id ||
    flat.order_id ||
    flat.ORDER_ID ||
    "";
  const id = raw.trim();
  return id || null;
}

function txAmount(flat: Record<string, string>): number | null {
  const raw = flat.TXNAMT || flat.txnamt || flat.amount || flat.AMOUNT || "";
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function indicatesPayfastSuccess(flat: Record<string, string>): boolean {
  const code = (
    flat.code ||
    flat.response_code ||
    flat.RESPONSE_CODE ||
    ""
  )
    .trim()
    .toLowerCase();
  if (["00", "000"].includes(code)) return true;

  const st = (
    flat.transaction_status ||
    flat.STATUS ||
    flat.status ||
    ""
  )
    .toLowerCase()
    .trim();
  if (["success", "completed", "paid", "approved", "captured"].includes(st)) {
    return true;
  }

  const msg = `${flat.message ?? ""} ${flat.MESSAGE ?? ""}`.toLowerCase();
  if (msg.includes("success") && !msg.includes("fail")) return true;

  return false;
}

async function parseFlat(request: Request): Promise<Record<string, string>> {
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const j = (await request.json()) as Record<string, unknown>;
    return payfastFlattenParams(j);
  }
  const fd = await request.formData();
  const out: Record<string, string> = {};
  fd.forEach((v, k) => {
    out[k] = typeof v === "string" ? v : "";
  });
  return out;
}

/**
 * Server-to-server / return POST from PayFast (CHECKOUT_URL / IPN).
 * Verifies HMAC-SHA256 over alphabetically sorted body parameters.
 */
export async function POST(request: Request) {
  const cfg = payfastConfig();
  if (!cfg) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  try {
    const flat = await parseFlat(request);

    if (!payfastVerifySortedParamHash(flat, cfg.securedKey)) {
      console.warn("[PayFast webhook] Invalid SIGNATURE / secured_hash");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const basketId = basketIdFromPayload(flat);
    if (!basketId) {
      return NextResponse.json({ error: "Missing basket reference" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const { data: order } = await supabase
      .from("orders")
      .select("id,total_pkr,payment_method,payment_status")
      .eq("id", basketId)
      .maybeSingle();

    if (!order || order.payment_method !== "payfast") {
      console.warn("[PayFast webhook] Unknown order:", basketId);
      return NextResponse.json({ received: true });
    }

    const postedAmt = txAmount(flat);
    if (
      postedAmt !== null &&
      Math.abs(postedAmt - Number(order.total_pkr)) > 0.05
    ) {
      console.warn("[PayFast webhook] Amount mismatch", postedAmt, order.total_pkr);
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    const ok = indicatesPayfastSuccess(flat);

    if (ok && order.payment_status === "pending") {
      await markPayfastOrderPaid(
        order.id,
        "PayFast IPN verified (HMAC-SHA256 sorted params)",
      );
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    console.error("[PayFast webhook]", e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
