import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopLoadingSkeleton } from "@/components/loading/shop-loading";
import { ShopContent } from "@/components/shop/shop-content";
import { fetchActiveLegacyProducts } from "@/lib/catalog/fetch-catalog";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse all LUMINA niche fragrances — filter by notes, longevity, gender, and bottle size.",
};

export default async function ShopPage() {
  const catalog = await fetchActiveLegacyProducts();
  return (
    <Suspense fallback={<ShopLoadingSkeleton />}>
      <ShopContent initialProducts={catalog} />
    </Suspense>
  );
}
