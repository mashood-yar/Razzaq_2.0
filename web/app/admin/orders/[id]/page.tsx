"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
  AdminStatusBadge,
  AdminEmptyState,
  AdminLoading,
  AdminFormSection,
} from "@/components/admin/admin-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatPKR,
  formatDate,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "@/lib/utils";
import { ArrowLeft, MapPin, Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";
import type { Order, OrderItem, PaymentStatus } from "@/lib/types";

const ADMIN_PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "verified",
  "failed",
  "paid",
  "refunded",
];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = typeof params?.id === "string" ? params.id : "";

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [courierName, setCourierName] = useState("");
  const [trackingInput, setTrackingInput] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    const loadOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}`, {
          credentials: "include",
        });
        const data = (await res.json()) as Order & {
          error?: string;
          order_items?: OrderItem[];
        };
        if (!res.ok) throw new Error(data.error ?? "Failed to load");
        setOrder(data);
        setOrderItems(data.order_items ?? []);
        setCourierName(data.courier_name ?? "");
        setTrackingInput(data.tracking_number ?? "");
        setCancellationReason(data.cancellation_reason ?? "");
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [orderId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;
    if (newStatus === "shipped") {
      if (!courierName.trim() || !trackingInput.trim()) {
        toast.error(
          "Enter courier name and tracking number before marking shipped.",
        );
        return;
      }
    }
    setUpdating(true);
    try {
      const body: Record<string, unknown> = { status: newStatus };
      if (newStatus === "shipped") {
        body.courier_name = courierName.trim();
        body.tracking_number = trackingInput.trim();
      }
      if (newStatus === "cancelled" && cancellationReason.trim()) {
        body.cancellation_reason = cancellationReason.trim();
      }
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as Order & {
        error?: string;
        order_items?: OrderItem[];
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to update status");
      setOrder(data);
      setOrderItems(data.order_items ?? []);
      setCourierName(data.courier_name ?? "");
      setTrackingInput(data.tracking_number ?? "");
      setCancellationReason(data.cancellation_reason ?? "");
      toast.success("Order updated");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async (nextPay: PaymentStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_status: nextPay }),
      });
      const data = (await res.json()) as Order & {
        error?: string;
        order_items?: OrderItem[];
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to update payment status");
      setOrder(data);
      setOrderItems(data.order_items ?? []);
      toast.success("Payment status updated");
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update payment status",
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <AdminLoading label="Loading order…" />;
  }

  if (!order) {
    return (
      <AdminEmptyState
        title="Order not found"
        description="This order may have been removed or the link is invalid."
      />
    );
  }

  const payBadgeClass =
    PAYMENT_STATUS_COLORS[order.payment_status as PaymentStatus] ??
    PAYMENT_STATUS_COLORS.pending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full shrink-0 hover:bg-ocean-primary/15"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 space-y-4">
          <AdminPageHeader
            title={`Order ${order.order_number}`}
            subtitle={formatDate(order.created_at)}
            breadcrumb="Orders"
          />
          <AdminFormSection title="Fulfillment status">
            <div className="space-y-4">
              <Select value={order.status} onValueChange={handleStatusUpdate} disabled={updating}>
                <SelectTrigger className="w-full max-w-xs rounded-full border-border-subtle bg-ocean-deep/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending_confirmation">Pending confirmation</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid max-w-lg gap-3">
                <div>
                  <Label className="font-body">Courier name (required to ship)</Label>
                  <Input
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="e.g. TCS"
                    className="admin-input mt-1 rounded-full"
                  />
                </div>
                <div>
                  <Label className="font-body">Tracking number (required to ship)</Label>
                  <Input
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    className="admin-input mt-1 rounded-full"
                  />
                </div>
                <div>
                  <Label className="font-body">Cancellation reason (when cancelling)</Label>
                  <Input
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    className="admin-input mt-1 rounded-full"
                  />
                </div>
              </div>
            </div>
          </AdminFormSection>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard padding="lg">
          <AdminCardHeader title="Order Items" />
          {orderItems.length === 0 ? (
            <p className="font-body text-sm text-muted-foreground">No items</p>
          ) : (
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-xl border border-border-subtle/50 bg-ocean-deep/30 p-3"
                >
                  {item.image_url ? (
                    <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-border-subtle/60">
                      <Image
                        src={item.image_url}
                        alt={item.product_name}
                        fill
                        sizes="64px"
                        unoptimized
                        className="object-cover"
                      />
                    </span>
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="font-body font-semibold">{item.product_name}</p>
                    {item.variant_label && (
                      <p className="font-body text-xs text-muted-foreground">{item.variant_label}</p>
                    )}
                    <p className="font-body text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-body font-medium">{formatPKR(Number(item.unit_price))}</p>
                    <p className="font-display text-sm font-semibold text-gold-light">
                      {formatPKR(Number(item.total_price))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminCard>

        <div className="space-y-6">
          <AdminCard padding="lg">
            <AdminCardHeader title="Order Summary" />
            <div className="space-y-2 font-body text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPKR(Number(order.subtotal_pkr))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>-{formatPKR(Number(order.discount_pkr))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPKR(Number(order.shipping_pkr))}</span>
              </div>
              <div className="flex justify-between border-t border-border-subtle pt-3 font-display text-lg font-bold">
                <span>Total</span>
                <span className="text-gold-light">{formatPKR(Number(order.total_pkr))}</span>
              </div>
            </div>
          </AdminCard>

          <AdminCard padding="lg">
            <AdminCardHeader title="Payment" />
            <div className="space-y-4 font-body text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Method</span>
                <span className="text-right font-semibold">
                  {PAYMENT_METHOD_LABELS[order.payment_method] ?? order.payment_method}
                </span>
              </div>
              {order.transaction_id ? (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="break-all text-right font-mono text-xs">
                    {order.transaction_id}
                  </span>
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <AdminStatusBadge className={payBadgeClass} variant="outline">
                  {PAYMENT_STATUS_LABELS[order.payment_status as PaymentStatus] ??
                    order.payment_status}
                </AdminStatusBadge>
              </div>
              <div>
                <p className="text-muted-foreground">Update payment status</p>
                <Select
                  value={order.payment_status}
                  onValueChange={(v) => handlePaymentStatusUpdate(v as PaymentStatus)}
                  disabled={updating}
                >
                  <SelectTrigger className="mt-1.5 w-full max-w-xs rounded-full border-border-subtle bg-ocean-deep/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ADMIN_PAYMENT_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {PAYMENT_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>

      <AdminCard padding="lg">
        <AdminCardHeader title="Confirmation code (support)" />
        <div className="space-y-2 font-body text-sm">
          <p>
            Active code:{" "}
            <span className="font-mono font-semibold text-ocean-light">
              {order.confirmation_code ?? "— (verified or expired)"}
            </span>
          </p>
          <p className="text-muted-foreground">
            Wrong-code attempts: {order.confirmation_attempts ?? 0}
            {order.confirmation_locked ? " · locked" : ""}
          </p>
        </div>
      </AdminCard>

      <AdminCard padding="lg">
        <AdminCardHeader title="Shipping Address" icon={MapPin} />
        <div className="space-y-3 font-body text-sm">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-ocean-light" />
            <span>{order.ship_phone}</span>
          </div>
          <address className="not-italic leading-relaxed text-muted-foreground">
            {order.ship_first_name} {order.ship_last_name}<br />
            {order.ship_address1}<br />
            {order.ship_address2 && <>{order.ship_address2}<br /></>}
            {order.ship_city}, {order.ship_province}<br />
            {order.ship_country} {order.ship_postal_code}
          </address>
        </div>
      </AdminCard>

      <AdminCard padding="lg">
        <AdminCardHeader title="Customer Info" icon={Mail} />
        <div className="space-y-2 font-body text-sm">
          <p className="font-semibold">{order.customer_name || "Guest"}</p>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{order.customer_email}</span>
          </div>
          {order.customer_phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{order.customer_phone}</span>
            </div>
          )}
        </div>
      </AdminCard>

      {order.notes && (
        <AdminCard padding="lg">
          <AdminCardHeader title="Notes" />
          <p className="font-body text-sm text-muted-foreground">{order.notes}</p>
        </AdminCard>
      )}
    </div>
  );
}
