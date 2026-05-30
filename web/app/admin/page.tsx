import { Suspense } from "react";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { tryCreateServerClient } from "@/lib/supabase/server";
import { formatPKR, formatDate, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import {
  AdminPageHeader,
  AdminStatCard,
  AdminStatSkeleton,
  AdminCard,
  AdminCardHeader,
  AdminStatusBadge,
  AdminEmptyState,
} from "@/components/admin/admin-ui";

async function getDashboardStats(supabase: SupabaseClient) {
  const [
    productsCount,
    ordersCount,
    customersCount,
    revenueResult,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("total_pkr")
      .in("payment_status", ["paid", "verified"]),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total_pkr, status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("products")
      .select("id, name, stock_quantity")
      .lt("stock_quantity", 5)
      .eq("status", "active"),
  ]);

  const totalRevenue =
    revenueResult.data?.reduce(
      (sum: number, order: { total_pkr: string }) =>
        sum + Number(order.total_pkr),
      0,
    ) || 0;

  return {
    totalProducts: productsCount.count || 0,
    totalOrders: ordersCount.count || 0,
    totalCustomers: customersCount.count || 0,
    totalRevenue,
    recentOrders: recentOrders.data || [],
    lowStockProducts: lowStockProducts.data || [],
  };
}

function StatsSkeletonGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <AdminStatSkeleton key={i} />
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        subtitle="Overview of your store performance"
        breadcrumb="RazzaqLuxe Admin"
      />

      <Suspense fallback={<StatsSkeletonGrid />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

async function DashboardContent() {
  const supabase = await tryCreateServerClient();
  if (!supabase) {
    return (
      <AdminCard padding="lg">
        <p className="text-center font-body text-sm leading-relaxed text-muted-foreground">
          Supabase is not reachable from this build: set NEXT_PUBLIC_SUPABASE_URL
          and NEXT_PUBLIC_SUPABASE_ANON_KEY in{" "}
          <span className="font-mono text-foreground">web/.env.local</span>.
        </p>
      </AdminCard>
    );
  }

  const stats = await getDashboardStats(supabase);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={Package}
        />
        <AdminStatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCart}
        />
        <AdminStatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
        />
        <AdminStatCard
          title="Total Revenue"
          value={formatPKR(stats.totalRevenue)}
          icon={LayoutDashboard}
          accent="gold"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard padding="lg">
          <AdminCardHeader title="Recent Orders" />
          {stats.recentOrders.length === 0 ? (
            <AdminEmptyState
              title="No orders yet"
              description="Orders will appear here once customers start purchasing."
              icon={ShoppingCart}
            />
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-border-subtle/50 bg-ocean-deep/30 px-4 py-3 transition-colors hover:border-ocean-mid/40 hover:bg-ocean-primary/10"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate font-body font-semibold text-foreground">
                      {order.order_number}
                    </p>
                    <p className="truncate font-body text-xs text-muted-foreground">
                      {order.customer_name || "Guest"} ·{" "}
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="shrink-0 space-y-1 text-right">
                    <p className="font-display font-semibold text-gold-light">
                      {formatPKR(Number(order.total_pkr))}
                    </p>
                    <AdminStatusBadge
                      className={
                        STATUS_COLORS[
                          order.status as keyof typeof STATUS_COLORS
                        ] || ""
                      }
                    >
                      {STATUS_LABELS[
                        order.status as keyof typeof STATUS_LABELS
                      ] || order.status}
                    </AdminStatusBadge>
                  </div>
                </Link>
              ))}
              <Link
                href="/admin/orders"
                className="mt-2 inline-flex items-center gap-1 font-body text-sm font-semibold text-ocean-light hover:text-foreground"
              >
                View all orders
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </AdminCard>

        <AdminCard padding="lg">
          <AdminCardHeader title="Low Stock Alerts" icon={AlertTriangle} />
          {stats.lowStockProducts.length === 0 ? (
            <AdminEmptyState
              title="All stocked up"
              description="Every active product has healthy inventory levels."
              icon={Package}
            />
          ) : (
            <div className="space-y-2">
              {stats.lowStockProducts.map(
                (product: {
                  id: string;
                  name: string;
                  stock_quantity: number;
                }) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3"
                  >
                    <p className="font-body font-medium text-foreground">
                      {product.name}
                    </p>
                    <AdminStatusBadge className="border-destructive/40 bg-destructive/20 text-destructive-foreground">
                      {product.stock_quantity} left
                    </AdminStatusBadge>
                  </div>
                ),
              )}
              <Link
                href="/admin/products"
                className="mt-2 inline-flex items-center gap-1 font-body text-sm font-semibold text-ocean-light hover:text-foreground"
              >
                Manage products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </AdminCard>
      </div>
    </>
  );
}
