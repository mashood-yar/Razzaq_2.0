import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params;

  try {
    const body = (await request.json()) as { delta?: unknown };
    const delta = Number(body.delta);
    if (!Number.isFinite(delta) || delta === 0) {
      return NextResponse.json(
        { error: "delta must be a non-zero number (e.g. +1 to add stock, -1 to remove)" },
        { status: 400 },
      );
    }

    /* RPC: stock_quantity = stock_quantity - p_qty → pass p_qty = -delta so delta > 0 adds stock */
    const { error } = await supabase.rpc("decrement_product_stock", {
      p_product_id: id,
      p_qty: -delta,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "An error occurred" }, { status: 500 });
  }
}
