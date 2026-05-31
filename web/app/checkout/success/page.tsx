import { OrderSuccessBanner } from "@/components/banners/order-success-banner";

type Props = { searchParams: Promise<{ order_id?: string }> };

export default async function CheckoutSuccessPage(props: Props) {
  const { order_id: orderId } = await props.searchParams;

  return (
    <div className="min-h-screen bg-[var(--bg-void)] pt-32 pb-24 px-5">
      <div className="mx-auto max-w-[480px]">
        <OrderSuccessBanner orderId={orderId} />
      </div>
    </div>
  );
}
