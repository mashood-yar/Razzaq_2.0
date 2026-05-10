import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductDetail } from "@/components/product/product-detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name, seo_title, seo_desc, product_images(url, is_primary)")
    .eq("slug", slug)
    .single();

  return {
    title: data?.seo_title ?? data?.name,
    description: data?.seo_desc ?? undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select(`*, product_images(*), product_variants(*), categories(name, slug)`)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !product) notFound();

  const { data: related } = await supabase
    .from("products")
    .select("id, name, slug, price_pkr, compare_at_price, product_images(url, is_primary, sort_order)")
    .eq("category_id", product.category_id)
    .eq("status", "active")
    .neq("id", product.id)
    .limit(4);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ProductDetail product={product as any} related={(related ?? []) as any} />;
}
