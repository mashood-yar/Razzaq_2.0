import type { Order } from "@/lib/types";
import { sendMerchantNewOrderAlertEmail } from "@/lib/resend/client";
import {
  sendWhatsAppText,
  getWhatsAppConfigStatus,
} from "@/lib/whatsapp";
import {
  getMerchantOrderEmail,
  getMerchantWhatsAppE164,
} from "@/lib/notifications/merchant-config";

function formatPaymentMethod(method: Order["payment_method"]): string {
  switch (method) {
    case "cod":
      return "Cash on Delivery (COD)";
    case "bank_transfer":
      return "Bank / Upaisa transfer";
    case "safepay":
      return "Safepay (card / wallet)";
    case "jazzcash":
      return "JazzCash";
    case "payfast":
      return "PayFast";
    case "card":
      return "Card (Stripe)";
    default:
      return method;
  }
}

function formatShippingBlock(order: Order): string {
  const lines = [
    `${order.ship_first_name} ${order.ship_last_name}`.trim(),
    order.ship_address1,
    order.ship_address2,
    [order.ship_city, order.ship_province, order.ship_postal_code]
      .filter(Boolean)
      .join(", "),
    order.ship_country,
    order.ship_phone,
  ].filter(Boolean);
  return lines.join("\n");
}

function buildWhatsAppBody(order: Order): string {
  const items = (order.order_items ?? [])
    .map(
      (i) =>
        `• ${i.product_name}${i.variant_label ? ` (${i.variant_label})` : ""} × ${i.quantity} — PKR ${Number(i.total_price).toLocaleString()}`,
    )
    .join("\n");

  const txn =
    order.payment_method === "bank_transfer" && order.transaction_id
      ? `\nTxn ref: ${order.transaction_id}`
      : "";

  return [
    `New Razzaq Luxe order #${order.order_number}`,
    "",
    `Customer: ${order.customer_name ?? "—"}`,
    `Email: ${order.customer_email}`,
    `Phone: ${order.customer_phone ?? order.ship_phone ?? "—"}`,
    "",
    "Items:",
    items || "—",
    "",
    `Total: PKR ${Number(order.total_pkr).toLocaleString()}`,
    `Payment: ${formatPaymentMethod(order.payment_method)}${txn}`,
    "",
    "Ship to:",
    formatShippingBlock(order),
  ].join("\n");
}

/**
 * Fire-and-forget merchant alerts for a newly placed order.
 * Never throws — logs and returns per-channel results.
 */
export async function notifyMerchantNewOrder(order: Order): Promise<void> {
  const merchantEmail = getMerchantOrderEmail();
  const merchantWhatsApp = getMerchantWhatsAppE164();

  try {
    const emailResult = await sendMerchantNewOrderAlertEmail(
      order,
      merchantEmail,
    );
    if (!emailResult.sent) {
      console.warn("[Merchant notify] email not sent:", {
        reason: emailResult.reason,
        orderId: order.id,
        to: merchantEmail,
      });
    }
  } catch (e) {
    console.error("[Merchant notify] email failed:", e);
  }

  try {
    const whatsappConfig = getWhatsAppConfigStatus();
    if (!whatsappConfig.enabled) {
      console.info(
        "[Merchant notify] WhatsApp skipped — set WHATSAPP_ENABLED=true with Meta credentials to enable.",
      );
      return;
    }

    if (!whatsappConfig.ready) {
      console.warn(
        `[Merchant notify] WhatsApp enabled but ${whatsappConfig.missing.join(" and ")} missing — alert not sent. Add these in .env.local and Vercel.`,
        { to: merchantWhatsApp, orderId: order.id },
      );
      return;
    }

    const result = await sendWhatsAppText(
      merchantWhatsApp,
      buildWhatsAppBody(order),
    );
    if (!result.sent) {
      console.warn("[Merchant notify] WhatsApp not sent:", {
        reason: result.reason,
        to: merchantWhatsApp,
        orderId: order.id,
      });
    }
  } catch (e) {
    console.error("[Merchant notify] WhatsApp failed:", e);
  }
}
