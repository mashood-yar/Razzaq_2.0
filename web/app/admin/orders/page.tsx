"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPKR, formatDate, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import { Search } from "lucide-react";
import type { Order } from "@/lib/types";

const ORDER_STATUSES = ["all", "pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"] as const;

export default function OrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (search) {
        query = query.or(`order_number.ilike.%${search}%,customer_name.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setOrders(data || []);
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Orders</h1>
        <p className="text-muted-foreground">Manage customer orders</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ORDER_STATUSES.slice(1).map((status) => (
                <SelectItem key={status} value={status}>{STATUS_LABELS[status as keyof typeof STATUS_LABELS]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium">Order #</th>
                  <th className="text-left p-3 font-medium">Customer</th>
                  <th className="text-left p-3 font-medium">Total</th>
                  <th className="text-left p-3 font-medium">Payment</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Date</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3 font-medium">{order.order_number}</td>
                    <td className="p-3">
                      <div>
                        <p className="font-medium">{order.customer_name || "Guest"}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="p-3">{formatPKR(Number(order.total_pkr))}</td>
                    <td className="p-3">
                      <div>
                        <p className="text-sm capitalize">{order.payment_method}</p>
                        <Badge variant="outline" className="text-xs">
                          {order.payment_status}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || ""}>
                        {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS] || order.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm">{formatDate(order.created_at)}</td>
                    <td className="p-3">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm">View</Button>
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
