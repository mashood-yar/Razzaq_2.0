/** Tag values must stay in sync with `processResendWebhookEvent`. */
export const RESEND_ORDER_EMAIL_KIND = {
  CONFIRMATION: "order_confirmation",
  SHIPPED: "order_shipped",
  DELIVERED_NOTICE: "order_delivered",
} as const;

export type ResendOrderEmailKind =
  (typeof RESEND_ORDER_EMAIL_KIND)[keyof typeof RESEND_ORDER_EMAIL_KIND];

/** Resend webhooks echo these as `tags.order_id` / `tags.email_kind` on email.* events. */
export function orderEmailTags(orderId: string, kind: ResendOrderEmailKind) {
  return [
    { name: "order_id", value: orderId },
    { name: "email_kind", value: kind },
  ];
}
