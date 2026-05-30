import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
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
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        categories(name),
        product_images(*)
      `)
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "An error occurred" }, { status: 500 });
  }
}

export async function PUT(
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
    const body = await request.json();
    const {
      name,
      description,
      sku,
      price_pkr,
      stock_quantity,
      category_id,
      status,
      is_trending,
      is_premium,
      on_sale,
      sale_price,
      discount_percent,
      sale_start_at,
      sale_end_at,
    } = body;

    const { data, error } = await supabase
      .from("products")
      .update({
        name,
        description,
        sku,
        price_pkr,
        stock_quantity,
        category_id,
        status,
        ...(is_trending !== undefined ? { is_trending } : {}),
        ...(is_premium !== undefined ? { is_premium } : {}),
        ...(on_sale !== undefined ? { on_sale } : {}),
        ...(sale_price !== undefined ? { sale_price } : {}),
        ...(discount_percent !== undefined ? { discount_percent } : {}),
        ...(sale_start_at !== undefined ? { sale_start_at } : {}),
        ...(sale_end_at !== undefined ? { sale_end_at } : {}),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "An error occurred" }, { status: 500 });
  }
}

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
    const body = await request.json();
    const {
      is_trending,
      is_premium,
      on_sale,
      sale_price,
      discount_percent,
      sale_start_at,
      sale_end_at,
    } = body;

    const updatePayload: Record<string, unknown> = {};
    if (is_trending !== undefined) updatePayload.is_trending = is_trending;
    if (is_premium !== undefined) updatePayload.is_premium = is_premium;
    if (on_sale !== undefined) updatePayload.on_sale = on_sale;
    if (sale_price !== undefined) updatePayload.sale_price = sale_price;
    if (discount_percent !== undefined) updatePayload.discount_percent = discount_percent;
    if (sale_start_at !== undefined) updatePayload.sale_start_at = sale_start_at;
    if (sale_end_at !== undefined) updatePayload.sale_end_at = sale_end_at;

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: "No highlight fields provided" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An error occurred" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
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
    const { error } = await supabase
      .from("products")
      .update({ status: "archived" })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "An error occurred" }, { status: 500 });
  }
}
