/** Tag values must stay in sync with `processResendWebhookEvent` and `client.ts`. */
export const RESEND_ORDER_EMAIL_KIND = {
  CONFIRMATION: "order_confirmation",
  /** 6-digit code — Email 1 */
  ORDER_CODE: "order_code",
  /** After code verified — Email 2 */
  CONFIRMED_FOLLOWUP: "order_confirmed_customer",
  PROCESSING: "order_processing",
  SHIPPED: "order_shipped",
  DELIVERED_NOTICE: "order_delivered",
  PAYMENT_VERIFIED: "payment_verified",
  CANCELLED: "order_cancelled",
  /** Internal merchant alert when a customer places an order */
  MERCHANT_NEW_ORDER: "merchant_new_order",
} as const;

export type ResendOrderEmailKind =
  (typeof RESEND_ORDER_EMAIL_KIND)[keyof typeof RESEND_ORDER_EMAIL_KIND];

export function orderEmailTags(orderId: string, kind: ResendOrderEmailKind) {
  return [
    { name: "order_id", value: orderId },
    { name: "email_kind", value: kind },
  ];
}
