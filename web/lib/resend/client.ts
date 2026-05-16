import { Resend } from "resend";
import type { Order } from "@/lib/types";
import {
  orderEmailTags,
  RESEND_ORDER_EMAIL_KIND,
} from "@/lib/resend/order-email-tags";
import { getSupportEmail } from "@/lib/support";
import { publicBankTransferDisplay } from "@/lib/checkout/bank-transfer-public";
import { buildCourierTrackingUrl } from "@/lib/courier-tracking";

let resendClient: Resend | null = null;
let warnedMissingResendKey = false;

export type SendOrderConfirmationCodeEmailResult =
  | { sent: true }
  | { sent: false; reason: "missing_api_key" | "resend_rejected" };

/** Non-PII summary for server logs when Resend rejects a send. */
function logResendSendRejected(
  context: string,
  err: { name: string; message: string; statusCode: number | null },
) {
  const safeMsg =
    err.message.length > 140 ? `${err.message.slice(0, 140)}…` : err.message;
  console.warn(`[Resend] ${context} rejected:`, {
    errorName: err.name,
    statusCode: err.statusCode,
    message: safeMsg,
  });
}

/** Returns null when `RESEND_API_KEY` is unset — callers skip send (no throw). */
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    if (!warnedMissingResendKey) {
      warnedMissingResendKey = true;
      console.warn(
        "[Resend] RESEND_API_KEY is not set — transactional emails are skipped until the key is configured in the environment.",
      );
    }
    return null;
  }
  resendClient ??= new Resend(key);
  return resendClient;
}

const BRAND = "Razzaq Luxe";

/** Resend requires `email@domain` or `Name <email@domain>`; env often has stray quotes/newlines. */
let warnedInvalidResendFrom = false;
function getResendFrom(): string {
  const fallback = "orders@mail.razzaqluxe.com";
  const raw = process.env.RESEND_FROM_EMAIL;
  if (!raw?.trim()) return fallback;

  const s = raw
    .trim()
    .replace(/\r?\n/g, "")
    .replace(/^\uFEFF/, "")
    .replace(/^["']+|["']+$/g, "")
    .trim();

  const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (emailRe.test(s)) return s;

  const named = s.match(/^(.+?)\s*<([^<>]+@[^<>]+)>$/);
  if (named) {
    const addr = named[2].trim();
    if (emailRe.test(addr)) {
      return `${named[1].trim()} <${addr}>`;
    }
  }

  if (!warnedInvalidResendFrom) {
    warnedInvalidResendFrom = true;
    console.warn(
      "[Resend] RESEND_FROM_EMAIL must look like email@domain.com or Name <email@domain.com> — using default.",
    );
  }
  return fallback;
}

function siteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://razzaqluxe.com"
  );
}

/** Dark luxury storefront email shell */
function baseHtml(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body { margin:0; padding:0; background:#050505;
    font-family: 'Gill Sans', 'Gill Sans MT', Optima, 'Segoe UI', sans-serif;
    color:#ddd8cc; }
  .wrap { max-width:600px; margin:0 auto; padding:44px 24px 56px; }
  .panel { background:linear-gradient(160deg,#111110 0%,#0d0d0d 48%,#0a0908 100%);
    border:1px solid rgba(212,175,55,0.18); border-radius:14px; padding:28px 24px;
    box-shadow:0 18px 50px rgba(0,0,0,0.55); }
  .logo { font-family: Georgia, 'Times New Roman', serif; font-size:29px;
    font-style:italic; letter-spacing:0.12em; text-align:center; margin:0 0 8px;
    color:#D4AF37; }
  .tagline { text-align:center; font-size:11px; letter-spacing:0.35em;
    text-transform:uppercase; color:#66635c; margin-bottom:28px; }
  hr.div { border:none; border-top:1px solid rgba(212,175,55,0.12); margin:26px 0; }
  h1 { font-family: Georgia, serif; font-size:23px; font-weight:400; color:#ece6dc;
    margin:0 0 14px; line-height:1.35; }
  p { font-size:14px; line-height:1.75; color:#cbc5b9; margin:0 0 14px; }
  .muted { color:#8a867c; font-size:13px; }
  .badge { display:inline-block; border:1px solid rgba(212,175,55,0.45);
    color:#e8dda8; font-size:10px; letter-spacing:0.28em; text-transform:uppercase;
    padding:7px 18px 6px; border-radius:999px; margin-bottom:22px;
    background: rgba(212,175,55,0.06); }
  .codepill { font-family:'SF Mono','Consolas',monospace; font-size:30px;
    letter-spacing:0.42em; text-align:center; color:#fdf6dc; padding:20px;
    margin:22px 0; border-radius:10px;
    border:1px solid rgba(212,175,55,0.25); background:rgba(212,175,55,0.07); }
  table.items { width:100%; border-collapse:collapse; margin:14px 0 0; }
  table.items td { padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.06);
    font-size:13px; color:#c9c4b8; }
  .total-row td { padding:14px 0 0; font-weight:600; font-size:15px;
    color:#e8ddb8; border:none; }
  .btn { display:inline-block; background:linear-gradient(180deg,#D4AF37,#a7872c);
    color:#17140d; font-size:12px; font-weight:600; letter-spacing:0.2em;
    text-transform:uppercase; padding:14px 32px 13px; border-radius:999px;
    text-decoration:none; margin:14px 0 0; }
  .alert { border:1px solid rgba(212,175,55,0.25); border-radius:10px;
    padding:14px 16px; background:rgba(212,175,55,0.05); margin:14px 0 0;
    font-size:13px; color:#dbd4c6; }
  .footer { text-align:center; font-size:11px; color:#59554e; margin-top:36px; }
  .footer a { color:#918b7f; text-decoration:none; }
</style>
</head>
<body>
<div class="wrap">
  <div class="logo">${BRAND}</div>
  <p class="tagline">Quetta&nbsp; · &nbsp;Pakistan</p>
  <div class="panel">
    ${content}
  </div>
  <div class="footer">
    <p>© ${new Date().getFullYear()} ${BRAND}</p>
    <p><a href="mailto:${getSupportEmail()}">${getSupportEmail()}</a></p>
  </div>
</div>
</body>
</html>`;
}

function orderItemsTable(order: Order): string {
  const rows = (order.order_items ?? [])
    .map(
      (i) => `<tr>
    <td>${i.product_name}${i.variant_label ? ` <span class="muted">(${i.variant_label})</span>` : ""} × ${i.quantity}</td>
    <td style="text-align:right">PKR ${Number(i.total_price).toLocaleString()}</td>
  </tr>`,
    )
    .join("");

  return `<table class="items">
  ${rows}
  <tr><td colspan="2"><hr class="div" style="margin:8px 0"></td></tr>
  ${order.discount_pkr > 0 ? `<tr><td>Discount</td><td style="text-align:right;color:#6b9b7a">− PKR ${Number(order.discount_pkr).toLocaleString()}</td></tr>` : ""}
  <tr><td>Shipping</td><td style="text-align:right">${order.shipping_pkr === 0 ? "Free" : `PKR ${Number(order.shipping_pkr).toLocaleString()}`}</td></tr>
  <tr class="total-row"><td>Total</td><td style="text-align:right">PKR ${Number(order.total_pkr).toLocaleString()}</td></tr>
</table>`;
}

/** Email 1 — sent immediately after checkout (COD / bank transfer). */
export async function sendOrderConfirmationCodeEmail(
  order: Order,
  plainCode: string,
  expiresAtIso: string,
): Promise<SendOrderConfirmationCodeEmailResult> {
  const to = order.customer_email;
  const origin = siteOrigin();
  const confirmUrl = `${origin}/order/confirm/${order.id}`;
  const bank = publicBankTransferDisplay();
  const isBank = order.payment_method === "bank_transfer";

  const resend = getResend();
  if (!resend) {
    return { sent: false, reason: "missing_api_key" };
  }

  const { error } = await resend.emails.send({
    from: getResendFrom(),
    to,
    tags: orderEmailTags(order.id, RESEND_ORDER_EMAIL_KIND.ORDER_CODE),
    subject: `Your Razzaq Luxe Order #${order.order_number} — Confirm Your Order`,
    html: baseHtml(`
      <div class="badge">Action required</div>
      <h1>Thank you, ${order.ship_first_name}.</h1>
      <p>We received your order <strong>#${order.order_number}</strong>. Enter the code below on our site to confirm — it expires <strong>24 hours</strong> from checkout.</p>
      <p class="muted">Expires: ${new Date(expiresAtIso).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}</p>
      <div class="codepill">${plainCode}</div>
      <p class="muted" style="text-align:center">We never put this code in the URL — only in this email.</p>
      <p style="text-align:center"><a href="${confirmUrl}" class="btn">Open confirmation page</a></p>
      <hr class="div">
      ${orderItemsTable(order)}
      <div class="alert">
        <strong>Payment:</strong> ${isBank ? "Bank / Upaisa transfer" : "Cash on Delivery (COD)"}.
        ${isBank ? "" : " Keep the exact order total ready when the courier arrives."}
      </div>
      ${
        isBank
          ? `<div class="alert" style="margin-top:14px">
        <strong>Bank details</strong><br>
        Bank: ${bank.bankName}<br>
        Account title: ${bank.accountTitle}<br>
        Account number: ${bank.accountNumber}<br>
        Upaisa: ${bank.upaisaNumber}
      </div>`
          : ""
      }
    `),
  });

  if (error) {
    logResendSendRejected("order confirmation code email", error);
    return { sent: false, reason: "resend_rejected" };
  }

  return { sent: true };
}

/** Email 2 — after successful code verification. */
export async function sendOrderVerifiedConfirmationEmail(order: Order) {
  const to = order.customer_email;
  const origin = siteOrigin();
  const isCod = order.payment_method === "cod";

  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: getResendFrom(),
    to,
    tags: orderEmailTags(order.id, RESEND_ORDER_EMAIL_KIND.CONFIRMED_FOLLOWUP),
    subject: `Order Confirmed — Razzaq Luxe #${order.order_number}`,
    html: baseHtml(`
      <div class="badge">Confirmed</div>
      <h1>Your order is locked in.</h1>
      <p>Order <strong>${order.order_number}</strong> is now <strong>confirmed</strong> and will move into fulfilment.</p>
      ${orderItemsTable(order)}
      <hr class="div">
      <p><strong>Shipping to:</strong><br>
        ${order.ship_first_name} ${order.ship_last_name}<br>
        ${order.ship_address1}${order.ship_address2 ? ", " + order.ship_address2 : ""}<br>
        ${order.ship_city}, ${order.ship_province}${order.ship_postal_code ? " " + order.ship_postal_code : ""}<br>
        ${order.ship_phone}
      </p>
      ${isCod ? '<div class="alert">Cash on delivery — please keep <strong>PKR ' + Number(order.total_pkr).toLocaleString() + '</strong> ready for the courier.</div>' : '<div class="alert">Bank transfer — our team will match your receipt reference <strong>' + (order.transaction_id ?? "—") + "</strong> and update payment status shortly.</div>"}
      <p style="text-align:center"><a href="${origin}/order/${order.id}" class="btn">View order</a></p>
    `),
  });
}

/** Legacy / gateway: immediate “order received” template (Stripe, Safepay, etc.). */
export async function sendOrderConfirmationEmail(order: Order) {
  const to = order.customer_email;
  const origin = siteOrigin();

  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: getResendFrom(),
    to,
    tags: orderEmailTags(order.id, RESEND_ORDER_EMAIL_KIND.CONFIRMATION),
    subject: `Payment received — ${order.order_number} | ${BRAND}`,
    html: baseHtml(`
      <div class="badge">Order confirmed</div>
      <h1>Thank you, ${order.ship_first_name}.</h1>
      <p>Your order <strong>${order.order_number}</strong> has been received and paid.</p>
      ${orderItemsTable(order)}
      <hr class="div">
      <p><strong>Shipping to:</strong><br>
        ${order.ship_first_name} ${order.ship_last_name}<br>
        ${order.ship_address1}${order.ship_address2 ? ", " + order.ship_address2 : ""}<br>
        ${order.ship_city}, ${order.ship_province}${order.ship_postal_code ? " " + order.ship_postal_code : ""}<br>
        ${order.ship_phone}
      </p>
      <p style="text-align:center"><a href="${origin}/order/${order.id}" class="btn">Track Your Order</a></p>
    `),
  });
}

export async function sendOrderShippedEmail(order: Order) {
  const origin = siteOrigin();
  const trackUrl = buildCourierTrackingUrl(
    order.courier_name,
    order.tracking_number,
    order.tracking_url,
  );

  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: getResendFrom(),
    to: order.customer_email,
    tags: orderEmailTags(order.id, RESEND_ORDER_EMAIL_KIND.SHIPPED),
    subject: `Your Order Has Been Shipped — Razzaq Luxe #${order.order_number}`,
    html: baseHtml(`
      <div class="badge">Shipped</div>
      <h1>Your parcel is with the courier.</h1>
      <p>Order <strong>#${order.order_number}</strong> has been handed over for delivery.</p>
      ${order.courier_name ? `<p><strong>Courier:</strong> ${order.courier_name}</p>` : ""}
      ${order.tracking_number ? `<p><strong>Tracking number:</strong> ${order.tracking_number}</p>` : ""}
      ${trackUrl ? `<p><a href="${trackUrl}" style="color:#D4AF37">Track on courier website →</a></p>` : ""}
      <p class="muted">Estimated delivery: <strong>2–3 business days</strong> within Pakistan (carrier-dependent).</p>
      <p style="text-align:center"><a href="${origin}/order/${order.id}" class="btn">View order</a></p>
    `),
  });
}

export async function sendOrderDeliveredEmail(order: Order) {
  const origin = siteOrigin();
  const support = getSupportEmail();

  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: getResendFrom(),
    to: order.customer_email,
    tags: orderEmailTags(order.id, RESEND_ORDER_EMAIL_KIND.DELIVERED_NOTICE),
    subject: `Your Order Has Been Delivered — Razzaq Luxe #${order.order_number}`,
    html: baseHtml(`
      <div class="badge">Delivered</div>
      <h1>Enjoy your purchase.</h1>
      <p>Order <strong>#${order.order_number}</strong> is marked <strong>delivered</strong>. If you love it, tell a friend — and consider leaving us a review.</p>
      <p class="muted">Returns: if something is wrong, email <a href="mailto:${support}" style="color:#D4AF37">${support}</a> within 7 days with your order ID. See our <a href="${origin}/policies/return-policy" style="color:#D4AF37">Return Policy</a>.</p>
      <p style="text-align:center"><a href="${origin}/shop" class="btn">Continue shopping</a></p>
    `),
  });
}

export async function sendOrderProcessingEmail(order: Order) {
  const origin = siteOrigin();

  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: getResendFrom(),
    to: order.customer_email,
    tags: orderEmailTags(order.id, RESEND_ORDER_EMAIL_KIND.PROCESSING),
    subject: `Your Order is Being Prepared — Razzaq Luxe #${order.order_number}`,
    html: baseHtml(`
      <div class="badge">Processing</div>
      <h1>We&apos;re packing your order.</h1>
      <p>Order <strong>#${order.order_number}</strong> is being prepared for shipment. You&apos;ll get another email as soon as it leaves our studio.</p>
      <p style="text-align:center"><a href="${origin}/order/${order.id}" class="btn">View order</a></p>
    `),
  });
}

/** Email 5 — admin marked bank transfer as verified. */
export async function sendBankPaymentVerifiedEmail(order: Order) {
  const origin = siteOrigin();

  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: getResendFrom(),
    to: order.customer_email,
    tags: orderEmailTags(order.id, RESEND_ORDER_EMAIL_KIND.PAYMENT_VERIFIED),
    subject: `Payment verified · ${order.order_number} | ${BRAND}`,
    html: baseHtml(`
      <div class="badge">Payment verified</div>
      <h1>We&apos;ve confirmed your transfer.</h1>
      <p>Your bank / Upaisa payment for order <strong>${order.order_number}</strong> is verified on our side. Your order will now move through fulfilment as normal.</p>
      <p class="muted">Reference on file: <strong style="color:#ece6dc">${order.transaction_id ?? "—"}</strong></p>
      <p style="text-align:center"><a href="${origin}/order/${order.id}" class="btn">View order</a></p>
    `),
  });
}

/** Email 6 — order cancelled. */
export async function sendOrderCancelledEmail(
  order: Order,
  reason?: string | null,
) {
  const origin = siteOrigin();

  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: getResendFrom(),
    to: order.customer_email,
    tags: orderEmailTags(order.id, RESEND_ORDER_EMAIL_KIND.CANCELLED),
    subject: `Your Order Has Been Cancelled — Razzaq Luxe #${order.order_number}`,
    html: baseHtml(`
      <div class="badge">Cancelled</div>
      <h1>Your order was cancelled.</h1>
      <p>Order <strong>${order.order_number}</strong> is marked <strong>cancelled</strong> in our system.</p>
      ${reason ? `<div class="alert">${reason}</div>` : '<p class="muted">If you did not request this, please contact us immediately.</p>'}
      <p style="text-align:center"><a href="${origin}/shop" class="btn">Browse again</a></p>
    `),
  });
}

export async function sendWelcomeEmail(email: string, name: string) {
  const origin = siteOrigin();

  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: getResendFrom(),
    to: email,
    subject: `Welcome to ${BRAND}`,
    html: baseHtml(`
      <div class="badge">Welcome</div>
      <h1>Hello, ${name || "friend"}.</h1>
      <p>You&apos;re on the list for new drops, limited oils, and seasonal collections from ${BRAND}.</p>
      <p style="text-align:center"><a href="${origin}/shop" class="btn">Explore fragrances</a></p>
    `),
  });
}

export async function sendOrderStatusEmail(order: Order, newStatus: string) {
  if (newStatus === "processing") return sendOrderProcessingEmail(order);
  if (newStatus === "shipped") return sendOrderShippedEmail(order);
  if (newStatus === "delivered") return sendOrderDeliveredEmail(order);
  if (newStatus === "cancelled")
    return sendOrderCancelledEmail(order, order.cancellation_reason ?? null);
}

export async function sendContactAutoReply(
  name: string,
  email: string,
  subject: string,
) {
  const origin = siteOrigin();

  const resend = getResend();
  if (!resend) return;

  await resend.emails.send({
    from: getResendFrom(),
    to: email,
    subject: `We received your message — ${BRAND}`,
    html: baseHtml(`
      <h1>Hello, ${name}.</h1>
      <p>Thank you for reaching out. We&apos;ve received your note about &ldquo;<strong>${subject}</strong>&rdquo; and will reply within 24 hours.</p>
      <p class="muted"><a href="${origin}/policies/return-policy" style="color:#D4AF37">Return policy</a> · <a href="${origin}/shop" style="color:#D4AF37">Shop</a></p>
    `),
  });
}

/** Minimal Resend SDK smoke test (same pattern as Resend docs). Requires `RESEND_API_KEY` in env. */
export async function sendHelloWorldTestEmail(
  to: string = "sultanshah101004@gmail.com",
) {
  const resend = getResend();
  if (!resend) return;

  const { error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to,
    subject: "Hello World",
    html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
  });

  if (error) throw new Error(error.message);
}
