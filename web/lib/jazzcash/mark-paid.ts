import { createServiceRoleClient } from "@/lib/supabase/service";
import { sendOrderConfirmationEmail } from "@/lib/resend/client";
import type { Order } from "@/lib/types";

export async function markJazzcashOrderPaid(orderId: string, note: string) {
  const supabase = createServiceRoleClient();

  const { data: existing } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .maybeSingle();

  if (!existing) return { ok: false as const, reason: "not_found" as const };
  if (existing.payment_method !== "jazzcash") {
    return { ok: false as const, reason: "wrong_method" as const };
  }
  if (existing.payment_status === "paid") {
    return { ok: true as const, duplicate: true as const };
  }

  const { data: updated, error } = await supabase
    .from("orders")
    .update({
      payment_status: "paid",
      status:
        existing.status === "pending" ||
        existing.status === "pending_confirmation"
          ? "confirmed"
          : existing.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("payment_method", "jazzcash")
    .eq("payment_status", "pending")
    .select("*, order_items(*)")
    .single();

  if (error || !updated) {
    console.error("[JazzCash] mark paid:", error);
    return { ok: false as const, reason: "update_failed" as const };
  }

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    status: updated.status,
    note,
  });

  try {
    await sendOrderConfirmationEmail(updated as unknown as Order);
  } catch (e) {
    console.error("[JazzCash] confirmation email:", e);
  }

  return { ok: true as const };
}
