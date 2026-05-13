import { createHmac } from "crypto";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendOrderConfirmationEmail } from "@/lib/resend/client";
import type { Order } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  if (secret && signature) {
    const hmac = createHmac("sha256", secret);
    const digest = hmac.update(rawBody).digest("hex");
    if (signature !== digest) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  const event = JSON.parse(rawBody);
  const eventName: string = event.meta?.event_name ?? "";

  if (eventName === "order_created") {
    const customData = event.meta?.custom_data ?? {};
    const orderId: string | undefined = customData.order_id;
    const lsOrderId: string | undefined = String(event.data?.id ?? "");

    if (!orderId) {
      return new Response("No order_id in custom_data", { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data: order } = await supabase
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        lemonsqueezy_order_id: lsOrderId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select("*, order_items(*)")
      .single();

    if (order) {
      const { error: histErr } = await supabase
        .from("order_status_history")
        .insert({
          order_id: orderId,
          status: "confirmed",
          note: `Payment confirmed via LemonSqueezy${lsOrderId ? ` (${lsOrderId})` : ""}`,
        });
      if (histErr) {
        console.error("[LS webhook] order_status_history:", histErr.message);
      }

      /*
       * Discount usage_count is incremented atomically in POST /api/orders
       * via validate_and_lock_discount — do not increment again here.
       */

      try {
        await sendOrderConfirmationEmail(order as Order);
      } catch (e) {
        console.error("[LS webhook] confirmation email failed:", e);
      }
    }
  }

  return new Response("OK", { status: 200 });
}
