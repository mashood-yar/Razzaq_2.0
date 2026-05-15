import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendOrderVerifiedConfirmationEmail } from "@/lib/resend/client";
import { sendWhatsAppText } from "@/lib/whatsapp";
import type { Order } from "@/lib/types";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type RpcResult = {
  ok?: boolean;
  error?: string;
  attempts_left?: number;
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "invalid_order_id" }, { status: 400 });
  }

  let body: { code?: string };
  try {
    body = (await request.json()) as { code?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch (e) {
    console.error("[confirm] service role:", e);
    return NextResponse.json(
      { error: "server_misconfigured" },
      { status: 500 },
    );
  }

  const { data: rpcResult, error: rpcErr } = await supabase.rpc(
    "verify_order_confirmation",
    {
      p_order_id: id,
      p_code: typeof body.code === "string" ? body.code : "",
      p_max_attempts: 5,
    },
  );

  if (rpcErr) {
    console.error("[confirm] rpc:", rpcErr);
    return NextResponse.json({ error: rpcErr.message }, { status: 500 });
  }

  const row = rpcResult as RpcResult;

  if (!row?.ok) {
    if (row?.error === "already_confirmed") {
      return NextResponse.json({
        ok: true,
        alreadyConfirmed: true,
        redirectUrl: `/order/${id}`,
      });
    }

    const status =
      row.error === "locked"
        ? 429
        : row.error === "expired"
          ? 410
          : row.error === "not_found"
            ? 404
            : 400;

    return NextResponse.json(
      {
        error: row.error ?? "unknown",
        attempts_left: row.attempts_left,
      },
      { status },
    );
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (order) {
    const ord = order as unknown as Order;
    try {
      await sendOrderVerifiedConfirmationEmail(ord);
    } catch (e) {
      console.error("[confirm] confirmation email:", e);
    }
    const phone = ord.ship_phone || ord.customer_phone;
    if (phone) {
      await sendWhatsAppText(
        phone,
        `Razzaq Luxe: Order ${ord.order_number} is confirmed. We will prepare your parcel next.`,
      );
    }
  }

  return NextResponse.json({
    ok: true,
    redirectUrl: `/order/${id}`,
  });
}
