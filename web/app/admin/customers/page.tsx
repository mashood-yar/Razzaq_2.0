"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { tryCreateBrowserClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { formatPKR, formatDate } from "@/lib/utils";
import { Search, Users } from "lucide-react";
import toast from "react-hot-toast";
import type { Profile } from "@/lib/types";
import {
  AdminPageHeader,
  AdminCard,
  AdminSearchField,
  AdminTable,
  AdminTableHead,
  AdminTableBody,
  AdminTh,
  AdminTr,
  AdminTd,
  AdminEmptyState,
  AdminLoading,
} from "@/components/admin/admin-ui";

interface CustomerWithStats extends Profile {
  total_orders?: number;
  total_spent?: number;
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
      <AdminPageHeader
        title="Customers"
        subtitle="Manage your customer base"
        breadcrumb="People"
      />

      <AdminCard>
        <div className="mb-4">
          <AdminSearchField>
            <Search />
            <Input
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input"
            />
          </AdminSearchField>
        </div>

        {loading ? (
          <AdminLoading label="Loading customers…" />
        ) : customers.length === 0 ? (
          <AdminEmptyState
            title="No customers found"
            description="Registered customers will appear here."
            icon={Users}
          />
        ) : (
          <AdminTable>
            <AdminTableHead>
              <AdminTr>
                <AdminTh>Customer</AdminTh>
                <AdminTh>Email</AdminTh>
                <AdminTh>Phone</AdminTh>
                <AdminTh>City</AdminTh>
                <AdminTh>Orders</AdminTh>
                <AdminTh className="admin-th-right">Total Spent</AdminTh>
                <AdminTh>Joined</AdminTh>
              </AdminTr>
            </AdminTableHead>
            <AdminTableBody>
              {customers.map((customer) => (
                <AdminTr key={customer.id}>
                  <AdminTd>
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="flex items-center gap-3 text-left transition-opacity hover:opacity-80"
                    >
                      {customer.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element -- arbitrary OAuth CDN hosts
                        <img
                          src={customer.avatar_url}
                          alt={customer.full_name || "Customer"}
                          className="h-10 w-10 rounded-full border border-border-subtle/60 object-cover"
                        />
                      ) : (
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ocean-primary/30 font-body text-sm font-bold text-ocean-light">
                          {(customer.full_name || customer.email || "?")[0]?.toUpperCase()}
                        </span>
                      )}
                      <span className="font-body font-semibold hover:text-ocean-light">
                        {customer.full_name || "No name"}
                      </span>
                    </Link>
                  </AdminTd>
                  <AdminTd className="font-body text-sm">{customer.email || "—"}</AdminTd>
                  <AdminTd className="font-body text-sm">{customer.phone || "—"}</AdminTd>
                  <AdminTd className="font-body text-sm">{customer.city ?? "—"}</AdminTd>
                  <AdminTd className="font-body font-semibold">{customer.total_orders || 0}</AdminTd>
                  <AdminTd className="admin-td-right font-display font-semibold text-gold-light">
                    {formatPKR(customer.total_spent || 0)}
                  </AdminTd>
                  <AdminTd className="font-body text-sm">{formatDate(customer.created_at)}</AdminTd>
                </AdminTr>
              ))}
            </AdminTableBody>
          </AdminTable>
        )}
      </AdminCard>
    </div>
  );
}
