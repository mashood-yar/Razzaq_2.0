import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPKR, formatDate, STATUS_COLORS, STATUS_LABELS } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingCart, Users, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

async function getDashboardStats() {
  const supabase = await createClient();

  const [productsCount, ordersCount, customersCount, revenueResult, recentOrders, lowStockProducts] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("total_pkr").eq("payment_status", "paid"),
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

  const totalRevenue = revenueResult.data?.reduce((sum: number, order: { total_pkr: string }) => sum + Number(order.total_pkr), 0) || 0;

  return {
    totalProducts: productsCount.count || 0,
    totalOrders: ordersCount.count || 0,
    totalCustomers: customersCount.count || 0,
    totalRevenue,
    recentOrders: recentOrders.data || [],
    lowStockProducts: lowStockProducts.data || [],
  };
}

function StatsCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecentOrdersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store performance</p>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

async function DashboardContent() {
  const stats = await getDashboardStats();

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Products" value={stats.totalProducts} icon={Package} />
        <StatsCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} />
        <StatsCard title="Total Customers" value={stats.totalCustomers} icon={Users} />
        <StatsCard title="Total Revenue" value={formatPKR(stats.totalRevenue)} icon={LayoutDashboard} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<RecentOrdersSkeleton />}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recentOrders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders yet</p>
              ) : (
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <p className="font-medium">{order.order_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_name || "Guest"} • {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-medium">{formatPKR(Number(order.total_pkr))}</p>
                        <Badge className={STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] || ""}>
                          {STATUS_LABELS[order.status as keyof typeof STATUS_LABELS] || order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">All products are well stocked</p>
            ) : (
              <div className="space-y-3">
                {stats.lowStockProducts.map((product: { id: string; name: string; stock_quantity: number }) => (
                  <div key={product.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0">
                    <p className="font-medium">{product.name}</p>
                    <Badge className="bg-destructive text-destructive-foreground">{product.stock_quantity} left</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
