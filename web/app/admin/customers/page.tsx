"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { tryCreateBrowserClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatPKR, formatDate } from "@/lib/utils";
import { Search } from "lucide-react";
import toast from "react-hot-toast";
import type { Profile } from "@/lib/types";

interface CustomerWithStats extends Profile {
  total_orders?: number;
  total_spent?: number;
  city?: string;
}

export default function CustomersPage() {
  const supabase = useMemo(() => tryCreateBrowserClient(), []);
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    if (!supabase) {
      setCustomers([]);
      setLoading(false);
      return;
    }
    try {
      let query = supabase
        .from("profiles")
        .select("*")
        .neq("role", "admin")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const list = data || [];
      const ids = list.map((c) => c.id);
      const cityByUser = new Map<string, string>();
      if (ids.length > 0) {
        const { data: addrRows } = await supabase
          .from("addresses")
          .select("user_id, city, is_default")
          .in("user_id", ids);

        const sorted = [...(addrRows || [])].sort(
          (a, b) => Number(b.is_default) - Number(a.is_default),
        );
        for (const row of sorted) {
          if (!cityByUser.has(row.user_id)) {
            cityByUser.set(row.user_id, row.city);
          }
        }
      }

      const customersWithStats = await Promise.all(
        list.map(async (customer) => {
          const { data: orders } = await supabase
            .from("orders")
            .select("total_pkr")
            .eq("user_id", customer.id);

          const totalOrders = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, order) => sum + Number(order.total_pkr), 0) || 0;

          return {
            ...customer,
            total_orders: totalOrders,
            total_spent: totalSpent,
            city: cityByUser.get(customer.id) ?? "—",
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to load customers";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [supabase, search]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Customers</h1>
        <p className="text-muted-foreground">Manage your customer base</p>
      </div>

      <Card className="p-4">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : customers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No customers found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium">Customer</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Phone</th>
                  <th className="text-left p-3 font-medium">City</th>
                  <th className="text-left p-3 font-medium">Orders</th>
                  <th className="text-left p-3 font-medium">Total Spent</th>
                  <th className="text-left p-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="flex items-center gap-3 text-left hover:underline"
                      >
                        {customer.avatar_url && (
                          // eslint-disable-next-line @next/next/no-img-element -- arbitrary OAuth CDN hosts
                          <img
                            src={customer.avatar_url}
                            alt={customer.full_name || "Customer"}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <span className="font-medium">{customer.full_name || "No name"}</span>
                      </Link>
                    </td>
                    <td className="p-3 text-sm">{customer.email || "-"}</td>
                    <td className="p-3 text-sm">{customer.phone || "-"}</td>
                    <td className="p-3 text-sm">{customer.city ?? "—"}</td>
                    <td className="p-3">{customer.total_orders || 0}</td>
                    <td className="p-3">{formatPKR(customer.total_spent || 0)}</td>
                    <td className="p-3 text-sm">{formatDate(customer.created_at)}</td>
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
