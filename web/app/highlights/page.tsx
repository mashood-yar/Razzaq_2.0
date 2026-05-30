import type { Metadata } from "next";
import { fetchActiveLegacyProducts } from "@/lib/catalog/fetch-catalog";
import { buildHighlightsSections } from "@/lib/highlights-products";
import { HighlightsPageContent } from "@/components/highlights/highlights-page-content";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Fragrance Highlights",
  description:
    "Trending bestsellers, seasonal sale picks, and premium Pakistani fragrances curated by RazzaqLuxe.",
  path: "/highlights",
});

export default async function HighlightsPage() {
  const catalog = await fetchActiveLegacyProducts();
  const sections = buildHighlightsSections(catalog);

  return <HighlightsPageContent {...sections} />;
}
