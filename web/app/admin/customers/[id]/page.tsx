"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { tryCreateBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPKR, formatDate, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import type { Order, Profile } from "@/lib/types";

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
    return <div className="text-center py-12 text-muted-foreground">Loading…</div>;
  }

  if (!profile) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground">Customer not found.</p>
        <Button variant="outline" onClick={() => router.push("/admin/customers")}>
          Back to customers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/customers")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">
            {profile.full_name || "Customer"}
          </h1>
          <p className="text-muted-foreground">Order history & profile</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-medium">{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-medium">{formatPKR(Number(order.total_pkr))}</span>
                    <Badge
                      className={
                        STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || ""
                      }
                    >
                      {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS] ||
                        order.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
