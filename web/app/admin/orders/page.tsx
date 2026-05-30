"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Search, ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import type { Order, PaymentStatus, PaymentMethod } from "@/lib/types";
import {
  AdminPageHeader,
  AdminCard,
  AdminSearchField,
  AdminFilterRow,
  AdminTable,
  AdminTableHead,
  AdminTableBody,
  AdminTh,
  AdminTr,
  AdminTd,
  AdminStatusBadge,
  AdminEmptyState,
  AdminLoading,
} from "@/components/admin/admin-ui";

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
      <AdminPageHeader
        title="Orders"
        subtitle="Manage customer orders"
        breadcrumb="Sales"
      />

      <AdminCard>
        <AdminFilterRow>
          <AdminSearchField>
            <Search />
            <Input
              placeholder="Order #, name, phone, email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
            />
          </AdminSearchField>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="admin-select-trigger md:w-[200px]">
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
            <SelectTrigger className="admin-select-trigger md:w-[210px]">
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
            <SelectTrigger className="admin-select-trigger">
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
        </AdminFilterRow>

        {loading ? (
          <AdminLoading label="Loading orders…" />
        ) : orders.length === 0 ? (
          <AdminEmptyState
            title="No orders found"
            description="Orders will appear here when customers checkout."
            icon={ShoppingCart}
          />
        ) : (
          <AdminTable>
            <AdminTableHead>
              <AdminTr>
                <AdminTh>Order #</AdminTh>
                <AdminTh>Customer</AdminTh>
                <AdminTh>Phone</AdminTh>
                <AdminTh className="admin-th-right">Total</AdminTh>
                <AdminTh>Payment</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh>Date</AdminTh>
                <AdminTh className="admin-th-center">Actions</AdminTh>
              </AdminTr>
            </AdminTableHead>
            <AdminTableBody>
              {orders.map((order) => (
                <AdminTr key={order.id}>
                  <AdminTd className="font-body font-semibold">{order.order_number}</AdminTd>
                  <AdminTd>
                    <div>
                      <p className="font-body font-medium">{order.customer_name || "—"}</p>
                      <p className="font-body text-xs text-muted-foreground">
                        {order.customer_email}
                      </p>
                    </div>
                  </AdminTd>
                  <AdminTd className="font-body text-sm">{order.customer_phone ?? "—"}</AdminTd>
                  <AdminTd className="admin-td-right font-display font-semibold text-gold-light">
                    {formatPKR(Number(order.total_pkr))}
                  </AdminTd>
                  <AdminTd>
                    <div>
                      <p className="font-body text-sm">
                        {PAYMENT_METHOD_LABELS[order.payment_method] ??
                          order.payment_method}
                      </p>
                      <AdminStatusBadge
                        variant="outline"
                        className={`mt-1 ${PAYMENT_STATUS_COLORS[order.payment_status as PaymentStatus] ?? ""}`}
                      >
                        {PAYMENT_STATUS_LABELS[order.payment_status as PaymentStatus] ??
                          order.payment_status}
                      </AdminStatusBadge>
                    </div>
                  </AdminTd>
                  <AdminTd>
                    <AdminStatusBadge
                      className={
                        STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || ""
                      }
                    >
                      {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS] ||
                        order.status}
                    </AdminStatusBadge>
                  </AdminTd>
                  <AdminTd className="font-body text-sm">{formatDate(order.created_at)}</AdminTd>
                  <AdminTd className="admin-td-center">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="rounded-full border-border-subtle">
                        View
                      </Button>
                    </Link>
                  </AdminTd>
                </AdminTr>
              ))}
            </AdminTableBody>
          </AdminTable>
        )}
      </AdminCard>
    </div>
  );
}
