import { type NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendEmail } from "@/lib/admin/email";

const STATUS_MAP: Record<string, string> = {
  "Picked Up": "processing",
  "In Transit": "shipped",
  "Out for Delivery": "shipped",
  Delivered: "delivered",
  Returned: "cancelled",
  SHIPMENT_PICKED: "processing",
  IN_TRANSIT: "shipped",
  OUT_FOR_DELIVERY: "shipped",
  DELIVERED: "delivered",
  transit: "shipped",
  "out-for-delivery": "shipped",
  delivered: "delivered",
  returned: "cancelled",
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const supabase = createServiceRoleClient();

    const trackingNumber = String(
      body.tracking_number ??
        body.track_number ??
        body.shipmentTrackingNumber ??
        "",
    ).trim();
    const rawStatus = String(
      body.status ?? body.current_status ?? body.shipmentStatus ?? "",
    );
    const internalStatus =
      STATUS_MAP[rawStatus] ?? STATUS_MAP[String(rawStatus)] ?? "shipped";

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Missing tracking number" },
        { status: 400 },
      );
    }

    const { data: orderRows, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("tracking_number", trackingNumber)
      .order("updated_at", { ascending: false })
      .limit(1);
    const orderRow = orderRows?.[0];

    if (orderErr || !orderRow) {
      return NextResponse.json(
        { error: "Order not found for this tracking number" },
        { status: 404 },
      );
    }

    const orderId = orderRow.id as string;
    const order = orderRow as Record<string, unknown>;

    await supabase
      .from("orders")
      .update({
        status: internalStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    await supabase.from("order_status_history").insert({
      order_id: orderId,
      status: internalStatus,
      note: `Carrier update: ${rawStatus}`,
    });

    const customerEmail =
      typeof order?.customer_email === "string" ? order.customer_email : null;
    const customerName =
      typeof order?.customer_name === "string" ? order.customer_name : null;
    const orderNumber =
      typeof order?.order_number === "string" ? order.order_number : "";

    if (
      customerEmail &&
      ["shipped", "delivered"].includes(internalStatus)
    ) {
      try {
        await sendEmail({
          to: customerEmail,
          toName: customerName ?? undefined,
          subject:
            internalStatus === "delivered"
              ? `Your order ${orderNumber} has been delivered`
              : `Your order ${orderNumber} is out for delivery`,
          html: `<p>Hi ${customerName ?? "there"},</p>
<p>Order <strong>${orderNumber}</strong> — status: ${internalStatus.replace(/_/g, " ")}.</p>
<p>Tracking: ${trackingNumber}</p>`,
        });
      } catch {
        /* RESEND optional */
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
