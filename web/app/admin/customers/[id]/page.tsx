"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { tryCreateBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { formatPKR, formatDate, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import type { Order, Profile } from "@/lib/types";
import {
  AdminPageHeader,
  AdminCard,
  AdminCardHeader,
  AdminStatusBadge,
  AdminEmptyState,
  AdminLoading,
} from "@/components/admin/admin-ui";

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = useMemo(() => tryCreateBrowserClient(), []);
  const id = typeof params.id === "string" ? params.id : "";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cityLabel, setCityLabel] = useState<string>("—");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !supabase) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      const [profileRes, ordersRes, addrRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
        supabase
          .from("orders")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false }),
        supabase
          .from("addresses")
          .select("city, is_default")
          .eq("user_id", id)
          .order("is_default", { ascending: false }),
      ]);

      if (profileRes.data) setProfile(profileRes.data as Profile);
      if (ordersRes.data) setOrders(ordersRes.data as Order[]);

      const rows = addrRes.data || [];
      const def = rows.find((a: { is_default: boolean }) => a.is_default);
      const pick = def || rows[0];
      if (pick?.city) setCityLabel(pick.city);

      setLoading(false);
    };

    load();
  }, [id, supabase]);

  if (loading) {
    return <AdminLoading label="Loading customer…" />;
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <AdminEmptyState
          title="Customer not found"
          description="This profile may have been removed."
        />
        <Button variant="outline" className="admin-btn-outline" onClick={() => router.push("/admin/customers")}>
          Back to customers
        </Button>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total_pkr), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-ocean-primary/15"
          onClick={() => router.push("/admin/customers")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <AdminPageHeader
          title={profile.full_name || "Customer"}
          subtitle="Order history & profile"
          breadcrumb="Customers"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminCard padding="default" className="text-center">
          <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Orders</p>
          <p className="mt-1 font-display text-2xl font-bold">{orders.length}</p>
        </AdminCard>
        <AdminCard padding="default" className="text-center">
          <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Total spent</p>
          <p className="mt-1 font-display text-2xl font-bold text-gold-light">{formatPKR(totalSpent)}</p>
        </AdminCard>
        <AdminCard padding="default" className="text-center">
          <p className="font-body text-xs uppercase tracking-wider text-muted-foreground">Member since</p>
          <p className="mt-1 font-body text-sm font-semibold">{formatDate(profile.created_at)}</p>
        </AdminCard>
      </div>

      <AdminCard padding="lg">
        <AdminCardHeader title="Profile" />
        <div className="grid gap-3 font-body text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Email:</span>{" "}
            {profile.email || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Phone:</span>{" "}
            {profile.phone || "—"}
          </p>
          <p>
            <span className="text-muted-foreground">City:</span> {cityLabel}
          </p>
          <p>
            <span className="text-muted-foreground">Joined:</span>{" "}
            {formatDate(profile.created_at)}
          </p>
        </div>
      </AdminCard>

      <AdminCard padding="lg">
        <AdminCardHeader title="Orders" icon={ShoppingBag} />
        {orders.length === 0 ? (
          <AdminEmptyState
            title="No orders yet"
            description="This customer hasn't placed any orders."
            icon={ShoppingBag}
          />
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border-subtle/50 bg-ocean-deep/30 p-4 transition-colors hover:border-ocean-mid/40 hover:bg-ocean-primary/10"
              >
                <div>
                  <p className="font-body font-semibold">{order.order_number}</p>
                  <p className="font-body text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display font-semibold text-gold-light">
                    {formatPKR(Number(order.total_pkr))}
                  </span>
                  <AdminStatusBadge
                    className={
                      STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || ""
                    }
                  >
                    {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS] ||
                      order.status}
                  </AdminStatusBadge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
