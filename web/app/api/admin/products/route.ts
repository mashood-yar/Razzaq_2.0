import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "name";

    let query = supabase
      .from("products")
      .select(`
        *,
        categories(name),
        product_images(url, is_primary)
      `);

    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    const sortColumn = sortBy === "price" ? "price_pkr" : sortBy === "stock" ? "stock_quantity" : "name";
    query = query.order(sortColumn, { ascending: true });

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const { name, description, sku, price_pkr, stock_quantity, category_id, weight_kg, status, images, slug: bodySlug } = body as {
      name: string;
      description: string;
      sku: string;
      price_pkr: string;
      stock_quantity: string;
      category_id: string;
      weight_kg?: string;
      status: string;
      images?: Array<{ url: string }>;
      slug?: string;
    };

    const slug =
      typeof bodySlug === "string" && bodySlug.trim().length > 0
        ? bodySlug.trim()
        : `${slugify(name)}-${randomUUID().slice(0, 8)}`;

    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name,
        slug,
        description,
        sku,
        price_pkr,
        stock_quantity,
        category_id,
        weight_kg,
        status,
      })
      .select()
      .single();

    if (productError) throw productError;

    if (images && images.length > 0 && product) {
      const imageInserts = images.map((img, idx: number) => ({
        product_id: product.id,
        url: img.url,
        is_primary: idx === 0,
        sort_order: idx,
      }));
      await supabase.from("product_images").insert(imageInserts);
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to create product" }, { status: 500 });
  }
}
