import { Resend } from "resend";

export type SendEmailInput = {
  to: string;
  toName?: string;
  subject: string;
  html: string;
};

export async function sendEmail(input: SendEmailInput) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  const resend = new Resend(key);
  const from =
    process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  const { error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function sendShippingNotification(
  order: {
    customer_email: string;
    customer_name: string | null;
    order_number: string;
  },
  detail: {
    carrier: string;
    trackingNumber: string;
    trackingUrl: string;
  },
) {
  const name = order.customer_name ?? "Customer";
  await sendEmail({
    to: order.customer_email,
    toName: name,
    subject: `Your order ${order.order_number} has shipped`,
    html: `<p>Hi ${name},</p>
<p>Your order <strong>${order.order_number}</strong> has been dispatched via <strong>${detail.carrier.toUpperCase()}</strong>.</p>
<p>Tracking: <a href="${detail.trackingUrl}">${detail.trackingNumber}</a></p>`,
  });
}
