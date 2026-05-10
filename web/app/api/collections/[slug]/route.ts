import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  const sort  = searchParams.get("sort") || "newest";
  const page  = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(48, parseInt(searchParams.get("limit") || "24"));
  const from  = (page - 1) * limit;
  const to    = from + limit - 1;

  const { data: collection, error: colErr } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .single();

  if (colErr) return NextResponse.json({ error: "Collection not found" }, { status: 404 });

  let query = supabase
    .from("products")
    .select(
      `*, product_images(*), product_variants(*), categories(name, slug),
       product_collections!inner(collection_id)`,
      { count: "exact" }
    )
    .eq("product_collections.collection_id", collection.id)
    .eq("status", "active");

  if (sort === "price-asc") {
    query = query.order("price_pkr", { ascending: true });
  } else if (sort === "price-desc") {
    query = query.order("price_pkr", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data: products, error: prodErr, count } = await query;
  if (prodErr) return NextResponse.json({ error: prodErr.message }, { status: 500 });

  return NextResponse.json({ collection, products: products ?? [], count: count ?? 0, page, limit });
}
