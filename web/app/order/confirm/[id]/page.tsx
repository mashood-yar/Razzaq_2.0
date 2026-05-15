import { notFound, redirect } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { OrderConfirmForm } from "@/components/order/order-confirm-form";
import { customerSupportWhatsAppUrl } from "@/lib/notifications/whatsapp";

export const dynamic = "force-dynamic";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type Props = { params: Promise<{ id: string }> };

export default async function OrderConfirmPage({ params }: Props) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  let supabase;
  try {
    supabase = createServiceRoleClient();
  } catch {
    notFound();
  }

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, confirmation_code_expires_at, confirmation_attempts",
    )
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  if (order.status !== "pending_confirmation") {
    redirect(`/order/${id}`);
  }

  const expiresAt =
    typeof order.confirmation_code_expires_at === "string"
      ? order.confirmation_code_expires_at
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const waUrl = customerSupportWhatsAppUrl(String(order.order_number));

  return (
    <OrderConfirmForm
      orderId={id}
      orderNumber={String(order.order_number)}
      expiresAtIso={expiresAt}
      attemptsSoFar={Number(order.confirmation_attempts ?? 0)}
      whatsappUrl={waUrl}
    />
  );
}
