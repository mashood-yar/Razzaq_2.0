import Link from "next/link";

type Props = { searchParams: Promise<{ order_id?: string }> };

export default async function CheckoutCancelPage(props: Props) {
  const { order_id: orderId } = await props.searchParams;

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="font-display text-3xl text-ivory">Payment cancelled</h1>
      <p className="mt-4 text-sm text-smoke">
        No charge was completed. Your cart is unchanged — you can return to checkout
        and choose another payment method.
      </p>
      {orderId && (
        <p className="mt-4 text-xs text-ash">
          Unpaid order id (you can ignore or contact support): {orderId}
        </p>
      )}
      <div className="mt-10 flex justify-center gap-6">
        <Link
          href="/checkout"
          className="text-sm uppercase tracking-widest text-gold hover:underline"
        >
          Back to checkout
        </Link>
        <Link
          href="/shop"
          className="text-sm uppercase tracking-widest text-smoke hover:text-ivory"
        >
              Shop
        </Link>
      </div>
    </div>
  );
}
