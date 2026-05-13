"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatPKR, formatDate } from "@/lib/utils";
import { Search } from "lucide-react";
import type { Profile } from "@/lib/types";

interface CustomerWithStats extends Profile {
  total_orders?: number;
  total_spent?: number;
}

export default function CustomersPage() {
  const supabase = createClient();
  const [customers, setCustomers] = useState<CustomerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchCustomers = async () => {
    setLoading(true);
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

      // Fetch order stats for each customer
      const customersWithStats = await Promise.all(
        (data || []).map(async (customer) => {
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
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

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
                      <div className="flex items-center gap-3">
                        {customer.avatar_url && (
                          <img
                            src={customer.avatar_url}
                            alt={customer.full_name || "Customer"}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <p className="font-medium">{customer.full_name || "No name"}</p>
                      </div>
                    </td>
                    <td className="p-3 text-sm">{customer.email || "-"}</td>
                    <td className="p-3 text-sm">{customer.phone || "-"}</td>
                    <td className="p-3 text-sm">-</td>
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
