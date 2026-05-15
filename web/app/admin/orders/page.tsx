"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  STATUS_COLORS,
  STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_COLORS,
} from "@/lib/utils";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import type { Order, PaymentStatus, PaymentMethod } from "@/lib/types";

const ORDER_STATUSES = [
  "all",
  "pending_confirmation",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const PAY_STATUSES = [
  "all",
  "pending",
  "verified",
  "failed",
  "paid",
  "refunded",
] as const;

const METHODS = ["all", "cod", "bank_transfer"] as const;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [payFilter, setPayFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (statusFilter !== "all") sp.set("status", statusFilter);
      if (payFilter !== "all") sp.set("payment_status", payFilter);
      if (methodFilter !== "all") sp.set("payment_method", methodFilter);
      const q = search.trim();
      if (q) sp.set("search", q);

      const res = await fetch(`/api/admin/orders?${sp}`, { credentials: "include" });
      const data = (await res.json()) as Order[] | { error?: string };
      if (!res.ok) {
        throw new Error(
          !Array.isArray(data) && data.error
            ? data.error
            : "Failed to load orders",
        );
      }
      setOrders(Array.isArray(data) ? data : []);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to load orders";
      toast.error(msg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, payFilter, methodFilter, search]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      <Card className="p-4">
        <div className="mb-4 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Order #, name, phone, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Order status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All order statuses</SelectItem>
              {ORDER_STATUSES.slice(1).map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={payFilter} onValueChange={setPayFilter}>
            <SelectTrigger className="w-full md:w-[210px]">
              <SelectValue placeholder="Payment status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payment statuses</SelectItem>
              {PAY_STATUSES.slice(1).map((s) => (
                <SelectItem key={s} value={s}>
                  {PAYMENT_STATUS_LABELS[s as PaymentStatus]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All methods</SelectItem>
              {METHODS.slice(1).map((m) => (
                <SelectItem key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m as PaymentMethod]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-3 text-left font-medium">Order #</th>
                  <th className="p-3 text-left font-medium">Customer</th>
                  <th className="p-3 text-left font-medium">Phone</th>
                  <th className="p-3 text-left font-medium">Total</th>
                  <th className="p-3 text-left font-medium">Payment</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Date</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <td className="p-3 font-medium">{order.order_number}</td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{order.customer_name || "—"}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_email}
                        </p>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{order.customer_phone ?? "—"}</td>
                    <td className="p-3">{formatPKR(Number(order.total_pkr))}</td>
                    <td className="p-3">
                      <div>
                        <p className="text-sm">
                          {PAYMENT_METHOD_LABELS[order.payment_method] ??
                            order.payment_method}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-xs ${PAYMENT_STATUS_COLORS[order.payment_status as PaymentStatus] ?? ""}`}
                        >
                          {PAYMENT_STATUS_LABELS[order.payment_status as PaymentStatus] ??
                            order.payment_status}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge
                        className={
                          STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || ""
                        }
                      >
                        {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS] ||
                          order.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">{formatDate(order.created_at)}</td>
                    <td className="p-3">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
