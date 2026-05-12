import { Resend } from "resend";
import type { Order } from "@/lib/types";
import {
  orderEmailTags,
  RESEND_ORDER_EMAIL_KIND,
} from "@/lib/resend/order-email-tags";

let resendClient: Resend | null = null;

/** Lazily construct so `next build` can load routes without RESEND_API_KEY set. */
function getResend(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    throw new Error("RESEND_API_KEY is not set");
  }
  resendClient ??= new Resend(key);
  return resendClient;
}

const FROM = process.env.RESEND_FROM_EMAIL ?? "orders@razzaqluxe.com";
const BRAND = "Razzaq Luxe";
const BRAND_GOLD_HTML = `<span style="color:#C9A84C">${BRAND}</span>`;

function baseHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#0B2E33; font-family:'Gill Sans','Gill Sans MT',Optima,sans-serif; color:#B8E3E9; }
  .wrap { max-width:600px; margin:0 auto; padding:40px 24px; }
  .logo { font-family:Georgia,serif; font-size:28px; font-style:italic; letter-spacing:2px; text-align:center; margin-bottom:32px; }
  .divider { border:none; border-top:1px solid #2d5560; margin:24px 0; }
  h1 { font-family:Georgia,serif; font-size:24px; font-weight:400; color:#B8E3E9; margin:0 0 16px; }
  p { font-size:15px; line-height:1.7; color:#C8ECF1; margin:0 0 16px; }
  .badge { display:inline-block; background:#08292E; border:1px solid #B8E3E9; color:#B8E3E9; font-size:12px; letter-spacing:2px; text-transform:uppercase; padding:6px 16px; border-radius:4px; margin-bottom:24px; }
  table.items { width:100%; border-collapse:collapse; margin:16px 0; }
  table.items td { padding:10px 0; border-bottom:1px solid #2d5560; font-size:14px; color:#C8ECF1; }
  .total-row td { padding:14px 0 0; font-weight:600; font-size:16px; color:#B8E3E9; border:none; }
  .btn { display:inline-block; background:#B8E3E9; color:#0B2E33; font-size:13px; font-weight:600; letter-spacing:2px; text-transform:uppercase; padding:14px 32px; border-radius:4px; text-decoration:none; margin:16px 0; }
  .footer { text-align:center; font-size:12px; color:#93B1B5; margin-top:40px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">${BRAND_GOLD_HTML}</div>
  ${content}
  <div class="footer">
    <p>© ${new Date().getFullYear()} ${BRAND_GOLD_HTML} · Lahore, Pakistan</p>
    <p>Questions? <a href="mailto:sultanbarak77@gmail.com" style="color:#B8E3E9">sultanbarak77@gmail.com</a></p>
  </div>
</div>
</body>
</html>`;
}

function orderItemsTable(order: Order): string {
  const rows = (order.order_items ?? [])
    .map(
      (i) => `<tr>
    <td>${i.product_name}${i.variant_label ? ` <span style="color:#93B1B5">(${i.variant_label})</span>` : ""} × ${i.quantity}</td>
    <td style="text-align:right">PKR ${Number(i.total_price).toLocaleString()}</td>
  </tr>`,
    )
    .join("");

  return `<table class="items">
  ${rows}
  <tr><td colspan="2"><hr class="divider" style="margin:8px 0"></td></tr>
  ${order.discount_pkr > 0 ? `<tr><td>Discount</td><td style="text-align:right;color:#3A7D5B">− PKR ${Number(order.discount_pkr).toLocaleString()}</td></tr>` : ""}
  <tr><td>Shipping</td><td style="text-align:right">${order.shipping_pkr === 0 ? "Free" : `PKR ${Number(order.shipping_pkr).toLocaleString()}`}</td></tr>
  <tr class="total-row"><td>Total</td><td style="text-align:right">PKR ${Number(order.total_pkr).toLocaleString()}</td></tr>
</table>`;
}

export async function sendOrderConfirmationEmail(order: Order) {
  const to = order.customer_email;
  const isCod = order.payment_method === "cod";

  await getResend().emails.send({
    from: FROM,
    to,
    tags: orderEmailTags(order.id, RESEND_ORDER_EMAIL_KIND.CONFIRMATION),
    subject: `Order Confirmed — ${order.order_number} | ${BRAND}`,
    html: baseHtml(`
      <div class="badge">Order Confirmed</div>
      <h1>Thank you, ${order.ship_first_name}.</h1>
      <p>Your order <strong>${order.order_number}</strong> has been received${isCod ? " and will be confirmed once our team verifies your Cash on Delivery order" : ""}.</p>
      ${orderItemsTable(order)}
      <hr class="divider">
      <p><strong>Shipping to:</strong><br>
        ${order.ship_first_name} ${order.ship_last_name}<br>
        ${order.ship_address1}${order.ship_address2 ? ", " + order.ship_address2 : ""}<br>
        ${order.ship_city}, ${order.ship_province}${order.ship_postal_code ? " " + order.ship_postal_code : ""}<br>
        ${order.ship_phone}
      </p>
      ${isCod ? '<p style="background:#08292E;border:1px solid #4F7C82;color:#D4F1F5;padding:12px 16px;border-radius:4px;font-size:14px;">Payment method: <strong>Cash on Delivery</strong>. Please keep the exact amount ready at the time of delivery.</p>' : ""}
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/order/${order.id}" class="btn">Track Your Order</a>
    `),
  });
}

export async function sendOrderShippedEmail(order: Order) {
  await getResend().emails.send({
    from: FROM,
    to: order.customer_email,
    tags: orderEmailTags(order.id, RESEND_ORDER_EMAIL_KIND.SHIPPED),
    subject: `Your Order Has Shipped — ${order.order_number} | ${BRAND}`,
    html: baseHtml(`
      <div class="badge">Shipped</div>
      <h1>Your order is on its way.</h1>
      <p>Order <strong>${order.order_number}</strong> has been dispatched and is heading to you.</p>
      ${order.tracking_number ? `<p>Tracking number: <strong>${order.tracking_number}</strong>${order.tracking_url ? ` — <a href="${order.tracking_url}" style="color:#B8E3E9">Track package</a>` : ""}</p>` : ""}
      <p>Estimated delivery: 3–5 business days for standard, 1–2 days for express.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/order/${order.id}" class="btn">View Order</a>
    `),
  });
}

export async function sendOrderDeliveredEmail(order: Order) {
  await getResend().emails.send({
    from: FROM,
    to: order.customer_email,
    tags: orderEmailTags(order.id, RESEND_ORDER_EMAIL_KIND.DELIVERED_NOTICE),
    subject: `Order Delivered — ${order.order_number} | ${BRAND}`,
    html: baseHtml(`
      <div class="badge">Delivered</div>
      <h1>Your order has arrived.</h1>
      <p>We hope you love your ${BRAND_GOLD_HTML} purchase. Your order <strong>${order.order_number}</strong> has been delivered.</p>
      <p>If there's anything wrong with your order, please contact us within 7 days for returns or exchanges.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop" class="btn">Continue Shopping</a>
    `),
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Welcome to ${BRAND}`,
    html: baseHtml(`
      <h1>Welcome, ${name || "friend"}.</h1>
      <p>You've joined the ${BRAND_GOLD_HTML} family — a world of premium fashion, exquisite fragrances, and timeless luxury.</p>
      <p>Explore our latest collections and discover pieces crafted for those who wear intention.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop" class="btn">Explore the Collection</a>
    `),
  });
}

export async function sendOrderStatusEmail(order: Order, newStatus: string) {
  if (newStatus === "shipped") return sendOrderShippedEmail(order);
  if (newStatus === "delivered") return sendOrderDeliveredEmail(order);
}

export async function sendContactAutoReply(
  name: string,
  email: string,
  subject: string,
) {
  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `We received your message — ${BRAND}`,
    html: baseHtml(`
      <h1>Hello, ${name}.</h1>
      <p>Thank you for reaching out to ${BRAND_GOLD_HTML}. We've received your message regarding "<strong>${subject}</strong>" and will get back to you within 24 hours.</p>
      <p>In the meantime, you can explore our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/policies/return-policy" style="color:#B8E3E9">Return Policy</a> or browse our <a href="${process.env.NEXT_PUBLIC_SITE_URL}/shop" style="color:#B8E3E9">latest collection</a>.</p>
    `),
  });
}

/** Minimal Resend SDK smoke test (same pattern as Resend docs). Requires `RESEND_API_KEY` in env. */
export async function sendHelloWorldTestEmail(
  to: string = "sultanshah101004@gmail.com",
) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }

  const { error } = await getResend().emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: "Hello World",
    html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
  });

  if (error) throw new Error(error.message);
}
