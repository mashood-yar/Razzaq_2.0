import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import {
  sendOrderStatusEmail,
  sendBankPaymentVerifiedEmail,
} from "@/lib/resend/client";
import type { Order } from "@/lib/types";
import { sendWhatsAppText } from "@/lib/whatsapp";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const status =
    typeof body.status === "string" ? body.status.trim() : undefined;
  const paymentStatusRaw =
    typeof body.payment_status === "string"
      ? body.payment_status.trim()
      : undefined;
  const courierName =
    typeof body.courier_name === "string" ? body.courier_name.trim() : undefined;
  const trackingNumber =
    typeof body.tracking_number === "string"
      ? body.tracking_number.trim()
      : undefined;
  const trackingUrl =
    typeof body.tracking_url === "string" ? body.tracking_url.trim() : undefined;
  const cancellationReason =
    typeof body.cancellation_reason === "string"
      ? body.cancellation_reason.trim()
      : undefined;
  const transactionId =
    typeof body.transaction_id === "string"
      ? body.transaction_id.trim()
      : undefined;

  const allowedPaymentStatuses = [
    "pending",
    "verified",
    "failed",
    "paid",
    "refunded",
  ] as const;

  const allowedStatuses = [
    "pending_confirmation",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ] as const;

  const admin = createServiceRoleClient();

  const { data: prev, error: prevErr } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  const prevPayment = (prev as Order).payment_status;

  if (prevErr || !prev) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (status !== undefined && !(allowedStatuses as readonly string[]).includes(status)) {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }

  if (
    paymentStatusRaw !== undefined &&
    !(allowedPaymentStatuses as readonly string[]).includes(paymentStatusRaw)
  ) {
    return NextResponse.json(
      { error: "Invalid payment_status value" },
      { status: 400 },
    );
  }

  if (status === "shipped") {
    const cn = courierName ?? (prev as Order).courier_name ?? "";
    const tn = trackingNumber ?? (prev as Order).tracking_number ?? "";
    if (!cn || !tn) {
      return NextResponse.json(
        {
          error:
            "Courier name and tracking number are required to mark an order as shipped.",
        },
        { status: 400 },
      );
    }
  }

  const updates: Record<string, unknown> = {};
  if (status !== undefined) updates.status = status;
  if (paymentStatusRaw !== undefined)
    updates.payment_status = paymentStatusRaw;
  if (courierName !== undefined) updates.courier_name = courierName || null;
  if (trackingNumber !== undefined)
    updates.tracking_number = trackingNumber || null;
  if (trackingUrl !== undefined) updates.tracking_url = trackingUrl || null;
  if (cancellationReason !== undefined)
    updates.cancellation_reason = cancellationReason || null;
  if (transactionId !== undefined)
    updates.transaction_id = transactionId || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: "Provide at least one field to update" },
      { status: 400 },
    );
  }

  const { data, error } = await admin
    .from("orders")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, order_items(*)")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Update failed" },
      { status: 500 },
    );
  }

  const order = data as Order;

  if (status !== undefined && status !== (prev as Order).status) {
    await admin.from("order_status_history").insert({
      order_id: id,
      status,
      note:
        status === "cancelled"
          ? (cancellationReason ?? order.cancellation_reason ?? null)
          : null,
      changed_by: user.id,
    });

    try {
      await sendOrderStatusEmail(order, status);
    } catch (e) {
      console.error("[admin order] status email", e);
    }

    const phone = order.ship_phone || order.customer_phone;
    if (phone) {
      if (status === "shipped" && order.tracking_number) {
        await sendWhatsAppText(
          phone,
          `Razzaq Luxe: Order ${order.order_number} shipped. Courier: ${order.courier_name ?? "—"}. Track: ${order.tracking_number}`,
        );
      }
      if (status === "delivered") {
        await sendWhatsAppText(
          phone,
          `Razzaq Luxe: Order ${order.order_number} marked delivered. Thank you for shopping with us.`,
        );
      }
    }
  }

  if (
    paymentStatusRaw !== undefined &&
    paymentStatusRaw !== prevPayment &&
    paymentStatusRaw === "verified" &&
    prevPayment === "pending" &&
    order.payment_method === "bank_transfer"
  ) {
    try {
      await sendBankPaymentVerifiedEmail(order);
    } catch (e) {
      console.error("[admin order] bank verified email", e);
    }
  }

  return NextResponse.json(order);
}
