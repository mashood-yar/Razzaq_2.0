import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductDetail } from "@/components/product/product-detail";
import { isSupabaseConfigured } from "@/utils/supabase/public-env";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function pickPrimaryImage(
  images?: { url: string; is_primary?: boolean | null }[] | null,
): string | undefined {
  if (!images?.length) return undefined;
  return images.find((img) => img.is_primary)?.url ?? images[0]?.url;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isSupabaseConfigured()) {
    return buildPageMetadata({
      title: slug,
      path: `/products/${slug}`,
    });
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name, seo_title, seo_desc, product_images(url, is_primary)")
    .eq("slug", slug)
    .single();

  const title = data?.seo_title ?? data?.name ?? slug;
  const description =
    data?.seo_desc ??
    (data?.name
      ? `Discover ${data.name} — a signature RazzaqLuxe fragrance handcrafted in Pakistan with premium oud, attar, and niche perfumery.`
      : undefined);

  return buildPageMetadata({
    title,
    description,
    path: `/products/${slug}`,
    image: pickPrimaryImage(data?.product_images),
  });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  if (!isSupabaseConfigured()) notFound();
  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select(`*, product_images(*), product_variants(*), categories(name, slug)`)
    .eq("slug", slug)
    .eq("status", "active")
    .single();

  if (error || !product) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ProductDetail product={product as any} />;
}
