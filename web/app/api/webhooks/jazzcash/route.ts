import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { jazzcashConfig } from "@/lib/jazzcash/config";
import {
  jazzcashFlatten,
  verifyJazzcashSecureHash,
} from "@/lib/jazzcash/secure-hash";
import { markJazzcashOrderPaid } from "@/lib/jazzcash/mark-paid";
import { getServerSiteOrigin } from "@/lib/site";

export const runtime = "nodejs";

function htmlRedirect(message: string, href: string, ok: boolean) {
  const safeMsg = message.replace(/</g, "&lt;");
  const safeHref = href.replace(/"/g, "&quot;");
  const body = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta http-equiv="refresh" content="3;url=${safeHref}"/><title>JazzCash</title></head><body style="font-family:system-ui;padding:2rem;max-width:480px;margin:auto;">
<p>${safeMsg}</p>
<p><a href="${safeHref}">Continue</a></p>
</body></html>`;
  return new NextResponse(body, {
    status: ok ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

async function parseFlat(request: Request): Promise<Record<string, string>> {
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("application/json")) {
    const j = (await request.json()) as Record<string, unknown>;
    return jazzcashFlatten(j);
  }
  const fd = await request.formData();
  const out: Record<string, string> = {};
  fd.forEach((val, key) => {
    out[key] = typeof val === "string" ? val.trim() : "";
  });
  return out;
}

/**
 * JazzCash `pp_ReturnURL` target — customer browser may POST form fields here.
 * Verifies `pp_SecureHash`, marks order paid on `pp_ResponseCode === 000`.
 */
export async function POST(request: Request) {
  const cfg = jazzcashConfig();
  const origin = getServerSiteOrigin();

  if (!cfg) {
    return htmlRedirect(
      "Payment callback misconfigured.",
      `${origin}/checkout/cancel`,
      false,
    );
  }

  try {
    const flat = await parseFlat(request);
    const txnRef = flat.pp_TxnRefNo?.trim();

    if (!txnRef || !verifyJazzcashSecureHash(flat, cfg.integritySalt)) {
      console.warn("[JazzCash return] Bad hash or missing txn ref");
      return htmlRedirect(
        "Could not verify payment callback.",
        `${origin}/checkout/cancel`,
        false,
      );
    }

    const supabase = createServiceRoleClient();
    const { data: ord } = await supabase
      .from("orders")
      .select("id,payment_status")
      .eq("jazzcash_txn_ref_no", txnRef)
      .maybeSingle();

    const orderId = ord?.id;
    const fallbackUrl = `${origin}/checkout/cancel`;

    if (!orderId) {
      return htmlRedirect("Order not found for this payment.", fallbackUrl, false);
    }

    const successUrl = `${origin}/checkout/success?order_id=${encodeURIComponent(orderId)}`;

    if (flat.pp_ResponseCode === "000") {
      await markJazzcashOrderPaid(
        orderId,
        `JazzCash return URL OK (txnRef=${txnRef})`,
      );
      return htmlRedirect(
        "Payment successful. Redirecting…",
        successUrl,
        true,
      );
    }

    return htmlRedirect(
      flat.pp_ResponseMessage ||
        `Payment was not completed (code ${flat.pp_ResponseCode || "unknown"}).`,
      fallbackUrl,
      false,
    );
  } catch (e) {
    console.error("[JazzCash webhook]", e);
    return htmlRedirect(
      "Something went wrong processing the payment return.",
      `${origin}/checkout/cancel`,
      false,
    );
  }
}
