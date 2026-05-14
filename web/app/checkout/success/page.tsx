import Link from "next/link";

type Props = { searchParams: Promise<{ order_id?: string }> };

/** Return URL after hosted wallets / wallets — some gateways confirm asynchronously via webhook. */
export default async function CheckoutSuccessPage(props: Props) {
  const { order_id: orderId } = await props.searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-3xl text-ivory">Thank you</h1>
      <p className="mt-4 text-sm leading-relaxed text-smoke">
        If you paid with Safepay or JazzCash, your confirmation email usually arrives within a
        minute once our server confirms payment (webhook or return URL). For bank transfers our team verifies
        your receipt manually—you’ll see verified payment status in your order confirmation email sequence.
        You can track this order anytime from your account or the link in your email.
      </p>
      {orderId && (
        <p className="mt-6 text-xs text-ash">
          Reference:{" "}
          <Link
            href={`/order/${orderId}`}
            className="text-gold underline-offset-4 hover:underline"
          >
            View order details
          </Link>
        </p>
      )}
      <Link
        href="/shop"
        className="mt-10 inline-block text-sm uppercase tracking-widest text-gold"
      >
        Continue shopping
      </Link>
    </div>
  );
}
