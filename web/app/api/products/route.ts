import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const category   = searchParams.get("category");
  const collection = searchParams.get("collection");
  const search     = searchParams.get("search");
  const sort       = searchParams.get("sort") || "created_at";
  const page       = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit      = Math.min(48, parseInt(searchParams.get("limit") || "24"));
  const from       = (page - 1) * limit;
  const to         = from + limit - 1;

  let query = supabase
    .from("products")
    .select(
      `*, product_images(*), product_variants(*), categories(name, slug)`,
      { count: "exact" }
    )
    .eq("status", "active");

  if (search) {
    query = query.textSearch("search_vector", search, { type: "websearch" });
  }

  if (category) {
    query = query.eq("categories.slug", category);
  }

  if (collection) {
    query = query
      .select(
        `*, product_images(*), product_variants(*), categories(name, slug),
         product_collections!inner(collection_id, collections!inner(slug))`
      )
      .eq("product_collections.collections.slug", collection);
  }

  const ascending = sort === "price_pkr";
  const orderCol  = sort === "price-asc" || sort === "price-desc" ? "price_pkr" : sort;

  if (sort === "price-asc") {
    query = query.order("price_pkr", { ascending: true });
  } else if (sort === "price-desc") {
    query = query.order("price_pkr", { ascending: false });
  } else {
    query = query.order(orderCol, { ascending: ascending });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [], count: count ?? 0, page, limit });
}
