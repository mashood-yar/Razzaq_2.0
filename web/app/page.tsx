import type { Metadata } from "next";
import { fetchLegacyProductsForHomeBestSellers } from "@/lib/catalog/fetch-catalog";
import { siteConfig } from "@/lib/site";
import { AtelierHomeClient } from "@/components/home/atelier-home-client";

export const metadata: Metadata = {
  title: "Razzaq Luxe | The Atelier",
  description: `${siteConfig.description} Crafted for the discerning.`,
};

export default async function HomePage() {
  const bestSellers = await fetchLegacyProductsForHomeBestSellers(4);

  return (
    <div className="bg-[var(--bg-obsidian)] min-h-screen text-[var(--cream-bone)]">
      <AtelierHomeClient bestSellers={bestSellers} />
    </div>
  );
}
