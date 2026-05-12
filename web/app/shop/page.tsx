import type { Metadata } from "next";
import { Suspense } from "react";
import { ShopLoadingSkeleton } from "@/components/loading/shop-loading";
import { ShopContent } from "@/components/shop/shop-content";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse all LUMINA niche fragrances — filter by notes, longevity, gender, and bottle size.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<ShopLoadingSkeleton />}>
      <ShopContent />
    </Suspense>
  );
}
