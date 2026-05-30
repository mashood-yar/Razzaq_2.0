import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopLoadingSkeleton } from "@/components/loading/shop-loading";
import { ShopContent } from "@/components/shop/shop-content";
import { fetchActiveLegacyProducts } from "@/lib/catalog/fetch-catalog";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Shop Luxury Fragrances",
  description:
    "Shop handcrafted oud, attar, and luxury fragrances — delivered across Pakistan. Filter by notes, longevity, gender, and bottle size.",
  path: "/shop",
});

export default async function ShopPage() {
  const catalog = await fetchActiveLegacyProducts();
  return (
    <Suspense fallback={<ShopLoadingSkeleton />}>
      <ShopContent initialProducts={catalog} />
    </Suspense>
  );
}
