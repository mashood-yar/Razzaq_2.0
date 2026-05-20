import { OrderSuccessBanner } from "@/components/banners/order-success-banner";

type Props = { searchParams: Promise<{ order_id?: string }> };

/** Return URL after hosted wallets / wallets — some gateways confirm asynchronously via webhook. */
export default async function CheckoutSuccessPage(props: Props) {
  const { order_id: orderId } = await props.searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <OrderSuccessBanner orderId={orderId} />
      <p className="mt-8 text-center text-sm leading-relaxed text-muted-foreground">
        If you paid with Safepay or JazzCash, your confirmation email usually arrives within a
        minute once our server confirms payment. For bank transfers our team verifies your receipt
        manually—you&apos;ll see verified payment status in your order confirmation email.
      </p>
    </div>
  );
}
