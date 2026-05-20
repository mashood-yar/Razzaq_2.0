import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import {
  formatPKR,
  formatDate,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "@/lib/utils";
import { isSupabaseConfigured } from "@/utils/supabase/public-env";
import { buildCourierTrackingUrl } from "@/lib/courier-tracking";
import type { PaymentStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id.slice(0, 8)}…` };
}

const TRACK_STEPS = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
] as const;

function labelForStep(step: (typeof TRACK_STEPS)[number]): string {
  switch (step) {
    case "confirmed":
      return "Confirmed";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    default:
      return step;
  }
}

function stepIndexForStatus(status: string): number {
  if (status === "pending_confirmation") return -1;
  if (status === "cancelled") return -2;
  const i = TRACK_STEPS.indexOf(status as (typeof TRACK_STEPS)[number]);
  return i >= 0 ? i : 0;
}

export default async function OrderTrackingPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { success } = await searchParams;
  const user = await requireUser();

  if (!isSupabaseConfigured()) notFound();
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*), order_status_history(*)")
    .eq("id", id)
    .maybeSingle();

  if (error || !order) notFound();

  const emailMatch =
    user.email &&
    order.customer_email?.toLowerCase() === user.email.toLowerCase();
  const idMatch = order.user_id === user.id;
  if (!idMatch && !emailMatch) {
    notFound();
  }

  const currentStepIndex = stepIndexForStatus(order.status as string);
  const isCancelled = order.status === "cancelled";
  const trackUrl = buildCourierTrackingUrl(
    order.courier_name,
    order.tracking_number,
    order.tracking_url,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      {success === "true" && (
        <div className="mb-8 rounded-xl border border-success/30 bg-success/10 p-6">
          <p className="font-display text-xl text-foreground">Thank you</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {order.status === "pending_confirmation"
              ? "Your order is waiting for email confirmation."
              : "Your order was updated successfully."}
          </p>
        </div>
      )}

      <p className="text-xs uppercase tracking-widest text-muted-foreground">Order</p>
      <h1 className="mt-1 font-display text-4xl text-foreground">
        {order.order_number}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Placed {formatDate(order.created_at)} ·{" "}
        {PAYMENT_METHOD_LABELS[
          order.payment_method as keyof typeof PAYMENT_METHOD_LABELS
        ] ?? order.payment_method}{" "}
        · Payment:{" "}
        {PAYMENT_STATUS_LABELS[order.payment_status as PaymentStatus] ??
          order.payment_status}
      </p>

      {order.status === "pending_confirmation" && (
        <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">
          <p>
            Confirm your order with the 6-digit code we emailed you:{" "}
            <Link
              href={`/order/confirm/${order.id}`}
              className="font-medium text-gold underline"
            >
              Open confirmation page
            </Link>
          </p>
        </div>
      )}

      {/* Status timeline */}
      <div className="my-12">
        <div className="flex flex-wrap items-center gap-2">
          {TRACK_STEPS.map((step, i) => {
            const done =
              !isCancelled && currentStepIndex >= 0 && i <= currentStepIndex;
            const active = !isCancelled && i === currentStepIndex;

            return (
              <div key={step} className="flex flex-1 min-w-[72px] flex-col items-center">
                <div
                  className={`h-3 w-3 rounded-full transition-colors ${
                    isCancelled
                      ? "bg-error"
                      : done
                        ? "bg-gold"
                        : "bg-border"
                  } ${active && !isCancelled ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
                />
                {i < TRACK_STEPS.length - 1 && (
                  <div
                    className={`hidden h-0.5 w-full md:block ${
                      done && !isCancelled ? "bg-primary/40" : "bg-border"
                    }`}
                  />
                )}
                <p
                  className={`mt-2 text-center text-xs ${
                    active ? "font-medium text-gold" : "text-muted-foreground"
                  }`}
                >
                  {labelForStep(step)}
                </p>
              </div>
            );
          })}
        </div>

        {isCancelled && (
          <div className="mt-6 rounded-lg border border-error/30 bg-error/10 px-4 py-3">
            <p className="text-sm font-medium capitalize text-error">
              Order cancelled
            </p>
            {order.cancellation_reason && (
              <p className="mt-1 text-sm text-muted-foreground">{order.cancellation_reason}</p>
            )}
          </div>
        )}
      </div>

      {order.status === "shipped" &&
        (order.tracking_number || order.courier_name) && (
          <div className="mb-8 rounded-xl border border-gold/30 bg-gold/10 p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Shipment
            </p>
            {order.courier_name && (
              <p className="mt-1 text-sm text-foreground">
                Courier: <strong>{order.courier_name}</strong>
              </p>
            )}
            {order.tracking_number && (
              <p className="mt-2 font-mono text-lg text-gold">
                {order.tracking_number}
              </p>
            )}
            {trackUrl && (
              <a
                href={trackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-xs uppercase tracking-widest text-gold hover:underline"
              >
                Track on courier website →
              </a>
            )}
          </div>
        )}

      {order.tracking_number && order.status !== "shipped" && (
        <div className="mb-8 rounded-xl border border-gold/20 bg-gold/5 p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Tracking number
          </p>
          <p className="mt-1 font-mono text-lg text-gold">{order.tracking_number}</p>
          {trackUrl && (
            <a
              href={trackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs uppercase tracking-widest text-gold hover:underline"
            >
              Track package →
            </a>
          )}
        </div>
      )}

      <div className="rounded-[2rem] border border-border/50 bg-accent/40 p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Shipping address
        </p>
        <p className="mt-2 text-sm text-foreground">
          {order.ship_first_name} {order.ship_last_name}
          <br />
          {order.ship_address1}
          {order.ship_address2 ? `, ${order.ship_address2}` : ""}
          <br />
          {order.ship_city}, {order.ship_province}
          {order.ship_postal_code ? ` ${order.ship_postal_code}` : ""}
          <br />
          {order.ship_phone}
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-charcoal">
        <div className="border-b border-border px-5 py-4">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Items</p>
        </div>
        <ul className="divide-y divide-graphite/50 px-5">
          {(order.order_items ?? []).map(
            (item: {
              id: string;
              product_name: string;
              variant_label?: string;
              image_url?: string;
              quantity: number;
              unit_price: number;
              total_price: number;
            }) => (
              <li key={item.id} className="flex items-center gap-4 py-4">
                {item.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt=""
                    className="h-14 w-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-graphite" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {item.product_name}
                  </p>
                  {item.variant_label && (
                    <p className="text-xs text-muted-foreground">{item.variant_label}</p>
                  )}
                  <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                </div>
                <p className="text-sm text-foreground">
                  {formatPKR(Number(item.total_price))}
                </p>
              </li>
            ),
          )}
        </ul>
        <div className="space-y-1 border-t border-border px-5 py-4 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatPKR(Number(order.subtotal_pkr))}</span>
          </div>
          {Number(order.discount_pkr) > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount</span>
              <span>− {formatPKR(Number(order.discount_pkr))}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Shipping</span>
            <span>
              {Number(order.shipping_pkr) === 0
                ? "Free"
                : formatPKR(Number(order.shipping_pkr))}
            </span>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold text-gold">
            <span>Total</span>
            <span>{formatPKR(Number(order.total_pkr))}</span>
          </div>
        </div>
      </div>

      <p className="mt-8">
        <Link
          href="/account/orders"
          className="text-sm uppercase tracking-widest text-gold hover:underline"
        >
          ← All orders
        </Link>
      </p>
    </div>
  );
}
