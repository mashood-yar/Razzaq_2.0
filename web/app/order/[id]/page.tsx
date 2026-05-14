import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth/session";
import { formatPKR, formatDate, STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/utils";
import { isSupabaseConfigured } from "@/utils/supabase/public-env";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id.slice(0, 8)}…` };
}

const STEPS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
] as const;

export default async function OrderTrackingPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { success } = await searchParams;
  const user = await getUser();

  if (!isSupabaseConfigured()) notFound();
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*), order_status_history(*)")
    .eq("id", id)
    .maybeSingle();

  if (error || !order) notFound();

  // Allow access if: logged-in user owns it, or it's a guest order (linked via email)
  const userEmail = user?.email;
  const ownsOrder =
    (user && order.user_id === user.id) ||
    (userEmail && order.customer_email === userEmail) ||
    (!order.user_id && !user); // guest orders accessible via link

  if (!ownsOrder) notFound();

  const currentStepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      {success === "true" && (
        <div className="mb-8 rounded-xl border border-success/30 bg-success/10 p-6">
          <p className="font-display text-xl text-ivory">
            Your order has been placed!
          </p>
          <p className="mt-1 text-sm text-smoke">
            {order.payment_method === "cod"
              ? "We will confirm your order shortly. Cash on delivery is available at your door."
              : order.payment_method === "bank_transfer"
                ? "We received your order and pending bank transfer reference. Razzaq will verify your payment and email updates — keep your transaction ID handy."
                : "Payment confirmed. Your order is now being processed."}
          </p>
        </div>
      )}

      <p className="text-xs uppercase tracking-widest text-smoke">Order</p>
      <h1 className="mt-1 font-display text-4xl text-ivory">
        {order.order_number}
      </h1>
      <p className="mt-2 text-sm text-smoke">
        Placed {formatDate(order.created_at)} · Payment:{" "}
        {PAYMENT_METHOD_LABELS[order.payment_method as keyof typeof PAYMENT_METHOD_LABELS] ??
          order.payment_method}
      </p>

      {/* Status timeline */}
      <div className="my-12">
        <div className="flex items-center gap-0">
          {STEPS.map((step, i) => {
            const done = currentStepIndex >= 0 && i <= currentStepIndex;
            const active = i === currentStepIndex;
            const isCancelled = order.status === "cancelled" || order.status === "refunded";

            return (
              <div key={step} className="flex flex-1 flex-col items-center">
                <div
                  className={`h-3 w-3 rounded-full transition-colors ${
                    isCancelled
                      ? "bg-error"
                      : done
                        ? "bg-gold"
                        : "bg-graphite"
                  } ${active && !isCancelled ? "ring-2 ring-gold ring-offset-2 ring-offset-obsidian" : ""}`}
                />
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 w-full ${
                      done && !isCancelled ? "bg-gold/50" : "bg-graphite"
                    }`}
                  />
                )}
                <p
                  className={`mt-2 text-center text-xs ${
                    active ? "font-medium text-gold" : "text-ash"
                  }`}
                >
                  {STATUS_LABELS[step]}
                </p>
              </div>
            );
          })}
        </div>

        {(order.status === "cancelled" || order.status === "refunded") && (
          <div className="mt-6 rounded-lg border border-error/30 bg-error/10 px-4 py-3">
            <p className="text-sm font-medium capitalize text-error">
              Order {order.status}
            </p>
          </div>
        )}
      </div>

      {/* Tracking info */}
      {order.tracking_number && (
        <div className="mb-8 rounded-xl border border-gold/20 bg-gold/5 p-5">
          <p className="text-xs uppercase tracking-widest text-smoke">
            Tracking Number
          </p>
          <p className="mt-1 font-mono text-lg text-gold">
            {order.tracking_number}
          </p>
          {order.tracking_url && (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs uppercase tracking-widest text-gold hover:underline"
            >
              Track Package →
            </a>
          )}
        </div>
      )}

      {/* Shipping address */}
      <div className="rounded-xl border border-graphite bg-charcoal p-5">
        <p className="text-xs uppercase tracking-widest text-smoke">
          Shipping Address
        </p>
        <p className="mt-2 text-sm text-ivory">
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

      {/* Order items */}
      <div className="mt-6 rounded-xl border border-graphite bg-charcoal">
        <div className="border-b border-graphite px-5 py-4">
          <p className="text-xs uppercase tracking-widest text-smoke">Items</p>
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
                  <p className="text-sm font-medium text-ivory">
                    {item.product_name}
                  </p>
                  {item.variant_label && (
                    <p className="text-xs text-smoke">{item.variant_label}</p>
                  )}
                  <p className="text-xs text-ash">× {item.quantity}</p>
                </div>
                <p className="text-sm text-ivory">
                  {formatPKR(Number(item.total_price))}
                </p>
              </li>
            ),
          )}
        </ul>
        <div className="space-y-1 border-t border-graphite px-5 py-4 text-sm">
          <div className="flex justify-between text-smoke">
            <span>Subtotal</span>
            <span>{formatPKR(Number(order.subtotal_pkr))}</span>
          </div>
          {Number(order.discount_pkr) > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount</span>
              <span>− {formatPKR(Number(order.discount_pkr))}</span>
            </div>
          )}
          <div className="flex justify-between text-smoke">
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
        {user ? (
          <Link
            href="/account/orders"
            className="text-sm uppercase tracking-widest text-gold hover:underline"
          >
            ← All Orders
          </Link>
        ) : (
          <Link
            href="/shop"
            className="text-sm uppercase tracking-widest text-gold hover:underline"
          >
            Continue Shopping →
          </Link>
        )}
      </p>
    </div>
  );
}
