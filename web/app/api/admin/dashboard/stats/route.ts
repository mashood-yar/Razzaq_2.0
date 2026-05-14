import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const [productsCount, ordersCount, customersCount, revenueResult, recentOrders, lowStockProducts] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total_pkr").in("payment_status", ["paid", "verified"]),
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

    const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + Number(order.total_pkr), 0) || 0;

    return NextResponse.json({
      totalProducts: productsCount.count || 0,
      totalOrders: ordersCount.count || 0,
      totalCustomers: customersCount.count || 0,
      totalRevenue,
      recentOrders: recentOrders.data || [],
      lowStockProducts: lowStockProducts.data || [],
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "An error occurred" }, { status: 500 });
  }
}
