import type { Product } from "@/lib/types";
import { computeSalePricePkr, isSaleWindowActive } from "@/lib/product-highlights";

export type HighlightTab = "sale" | "premium" | "trending";

export type HighlightCounts = {
  onSale: number;
  premium: number;
  trending: number;
};

export type CtaPreview = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
};

function activeProducts(products: Product[]): Product[] {
  return products.filter((p) => p.status === "active");
}

export function getHighlightCounts(products: Product[]): HighlightCounts {
  const active = activeProducts(products);
  return {
    onSale: active.filter((p) => isSaleWindowActive(p)).length,
    premium: active.filter((p) => p.is_premium).length,
    trending: active.filter((p) => p.is_trending).length,
  };
}

function saleDiscountPercent(product: Product): number {
  if (product.discount_percent != null && product.discount_percent > 0) {
    return product.discount_percent;
  }
  const salePrice = computeSalePricePkr(product);
  if (salePrice != null && product.price_pkr > salePrice) {
    return Math.round(((product.price_pkr - salePrice) / product.price_pkr) * 100);
  }
  return 0;
}

export function getOnSaleProducts(products: Product[]): Product[] {
  return activeProducts(products)
    .filter((p) => isSaleWindowActive(p))
    .sort((a, b) => saleDiscountPercent(b) - saleDiscountPercent(a));
}

export function getPremiumProducts(products: Product[]): Product[] {
  const flagged = activeProducts(products).filter((p) => p.is_premium);
  return [...flagged].sort((a, b) => b.price_pkr - a.price_pkr);
}

export function getTrendingProducts(products: Product[]): Product[] {
  return activeProducts(products).filter((p) => p.is_trending);
}

export function buildCtaPreviews(products: Product[]): {
  sale: CtaPreview;
  premium: CtaPreview;
} {
  const onSale = getOnSaleProducts(products);
  const premium = getPremiumProducts(products);
  const topSale = onSale[0];
  const topPremium = premium[0];

  return {
    sale: {
      eyebrow: "Limited time",
      title: "Products on Sale",
      description: topSale
        ? `Save on ${topSale.name}${saleDiscountPercent(topSale) > 0 ? ` — ${saleDiscountPercent(topSale)}% off` : ""} and more — tap to explore our best offers.`
        : "Explore seasonal offers across the collection — tap to shop discounted pieces.",
      href: topSale ? `/products/${topSale.slug}` : "/shop?sale=true",
      ctaLabel: "Shop the sale",
    },
    premium: {
      eyebrow: "The finest",
      title: "Premium Picks",
      description: topPremium
        ? `Experience ${topPremium.name} — our most elevated compositions await.`
        : "Our highest-tier fragrances — depth, longevity, and unmistakable presence.",
      href: topPremium ? `/products/${topPremium.slug}` : "/shop?sort=price-desc",
      ctaLabel: "Explore premium",
    },
  };
}

export function productMatchesTab(product: Product, tab: HighlightTab): boolean {
  switch (tab) {
    case "sale":
      return isSaleWindowActive(product);
    case "premium":
      return !!product.is_premium;
    case "trending":
      return !!product.is_trending;
  }
}

export function tabFlagField(tab: HighlightTab): "on_sale" | "is_premium" | "is_trending" {
  switch (tab) {
    case "sale":
      return "on_sale";
    case "premium":
      return "is_premium";
    case "trending":
      return "is_trending";
  }
}
