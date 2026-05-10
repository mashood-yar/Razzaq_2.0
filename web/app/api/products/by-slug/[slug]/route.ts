import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(`*, product_images(*), product_variants(*), categories(name, slug)`)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  return NextResponse.json({ data });
}
