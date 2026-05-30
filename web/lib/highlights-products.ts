import type { LegacyProduct } from "@/lib/products";
import { isLegacyProductOnSale } from "@/lib/product-highlights";
import { isHomeFeaturedProduct } from "@/lib/home-featured-products";

const SECTION_LIMIT = 4;

function effectivePrice(p: LegacyProduct): number {
  const sizes = p.sizes;
  if (sizes.length === 0) return p.price;
  return Math.min(...sizes.map((s) => s.price));
}

function saleDiscountPercent(p: LegacyProduct): number {
  if (!isLegacyProductOnSale(p) || !p.compareAtPrice) return 0;
  const price = effectivePrice(p);
  return ((p.compareAtPrice - price) / p.compareAtPrice) * 100;
}

function trendingScore(p: LegacyProduct): number {
  let score = 0;
  if (p.badge === "bestseller") score += 100;
  else if (p.badge === "new") score += 50;
  else if (p.badge === "limited") score += 30;
  if (isHomeFeaturedProduct(p.slug)) score += 40;
  return score;
}

export function getTrendingProducts(
  products: LegacyProduct[],
  limit = SECTION_LIMIT,
): LegacyProduct[] {
  const flagged = products.filter((p) => p.isTrending);
  if (flagged.length > 0) {
    return flagged.slice(0, limit);
  }

  return [...products]
    .sort((a, b) => {
      const scoreDiff = trendingScore(b) - trendingScore(a);
      if (scoreDiff !== 0) return scoreDiff;
      const ad = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bd = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bd - ad;
    })
    .slice(0, limit);
}

export function getOnSaleProducts(
  products: LegacyProduct[],
  limit = SECTION_LIMIT,
): LegacyProduct[] {
  const flagged = products.filter(isLegacyProductOnSale);
  if (flagged.length > 0) {
    return [...flagged]
      .sort((a, b) => saleDiscountPercent(b) - saleDiscountPercent(a))
      .slice(0, limit);
  }

  return [];
}

export function getPremiumProducts(
  products: LegacyProduct[],
  limit = SECTION_LIMIT,
): LegacyProduct[] {
  const flagged = products.filter((p) => p.isPremium);
  if (flagged.length > 0) {
    return [...flagged]
      .sort((a, b) => effectivePrice(b) - effectivePrice(a))
      .slice(0, limit);
  }

  return [...products]
    .sort((a, b) => effectivePrice(b) - effectivePrice(a))
    .slice(0, limit);
}

export type HighlightsSections = {
  trending: LegacyProduct[];
  onSale: LegacyProduct[];
  premium: LegacyProduct[];
  saleCtaHref: string;
  saleCtaProductName?: string;
  premiumCtaHref: string;
  premiumCtaProductName?: string;
};

export function buildHighlightsSections(products: LegacyProduct[]): HighlightsSections {
  const trending = getTrendingProducts(products);
  const onSale = getOnSaleProducts(products);
  const premium = getPremiumProducts(products);

  const topSale = onSale[0];
  const topPremium = premium[0];

  return {
    trending,
    onSale,
    premium,
    saleCtaHref: topSale ? `/products/${topSale.slug}` : "/shop?sale=true",
    saleCtaProductName: topSale?.name,
    premiumCtaHref: topPremium ? `/products/${topPremium.slug}` : "/shop?sort=price-desc",
    premiumCtaProductName: topPremium?.name,
  };
}
