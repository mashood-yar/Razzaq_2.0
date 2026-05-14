"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { tryCreateBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const supabase = useMemo(() => tryCreateBrowserClient(), []);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const loadOrder = async () => {
      const [orderRes, itemsRes] = await Promise.all([
        supabase.from("orders").select("*").eq("id", params.id).single(),
        supabase.from("order_items").select("*").eq("order_id", params.id),
      ]);

      if (orderRes.data) setOrder(orderRes.data);
      if (itemsRes.data) setOrderItems(itemsRes.data);
      setLoading(false);
    };

    loadOrder();
  }, [params.id, supabase]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order || !supabase) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", order.id);

      if (error) throw error;

      await supabase.from("order_status_history").insert({
        order_id: order.id,
        status: newStatus,
      });

      setOrder({ ...order, status: newStatus as Order["status"] });
      toast.success("Order status updated");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async (nextPay: PaymentStatus) => {
    if (!order || !supabase) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: nextPay })
        .eq("id", order.id);

      if (error) throw error;

      setOrder({ ...order, payment_status: nextPay });
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
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>;
  }

  const payBadgeClass =
    PAYMENT_STATUS_COLORS[order.payment_status as PaymentStatus] ??
    PAYMENT_STATUS_COLORS.pending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 space-y-1">
          <h1 className="text-3xl font-display font-bold">Order {order.order_number}</h1>
          <p className="text-muted-foreground">{formatDate(order.created_at)}</p>
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-sm text-muted-foreground">Fulfillment</span>
            <Select value={order.status} onValueChange={handleStatusUpdate} disabled={updating}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            {orderItems.length === 0 ? (
              <p className="text-muted-foreground">No items</p>
            ) : (
              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    {item.image_url ? (
                      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
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
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.product_name}</p>
                      {item.variant_label && (
                        <p className="text-sm text-muted-foreground">{item.variant_label}</p>
                      )}
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPKR(Number(item.unit_price))}</p>
                      <p className="text-sm text-muted-foreground">{formatPKR(Number(item.total_price))}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
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
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatPKR(Number(order.total_pkr))}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium text-right">
                  {PAYMENT_METHOD_LABELS[order.payment_method] ??
                    order.payment_method}
                </span>
              </div>
              {order.transaction_id ? (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Customer transaction ID</span>
                  <span className="font-mono text-sm break-all text-right">
                    {order.transaction_id}
                  </span>
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Payment status</span>
                <Badge className={payBadgeClass} variant="outline">
                  {PAYMENT_STATUS_LABELS[order.payment_status as PaymentStatus] ??
                    order.payment_status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Update payment status</p>
                <Select
                  value={order.payment_status}
                  onValueChange={(v) => handlePaymentStatusUpdate(v as PaymentStatus)}
                  disabled={updating}
                >
                  <SelectTrigger className="mt-1.5 w-full max-w-xs">
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
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{order.ship_phone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <address className="not-italic">
                  {order.ship_first_name} {order.ship_last_name}<br />
                  {order.ship_address1}<br />
                  {order.ship_address2 && <>{order.ship_address2}<br /></>}
                  {order.ship_city}, {order.ship_province}<br />
                  {order.ship_country} {order.ship_postal_code}
                </address>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Customer Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">{order.customer_name || "Guest"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{order.customer_email}</span>
          </div>
          {order.customer_phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{order.customer_phone}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
