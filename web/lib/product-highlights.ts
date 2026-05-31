import type { LegacyProduct } from "@/lib/products";
import type { Product } from "@/lib/types";

export type HighlightLabel = "most-selling" | "on-sale" | "premium" | "new-arrival";

export type ResolvedHighlightBadges = {
  /** Scalloped seal — top-right (one: on-sale > new-arrival > premium) */
  seal?: HighlightLabel;
  /** Pill — bottom-left (trending / selling fast) */
  pill?: HighlightLabel;
};

export type ProductHighlightFields = Pick<
  Product,
  | "on_sale"
  | "sale_start_at"
  | "sale_end_at"
  | "sale_price"
  | "discount_percent"
  | "price_pkr"
  | "is_trending"
  | "is_premium"
>;

export function isSaleWindowActive(
  row: Pick<Product, "on_sale" | "sale_start_at" | "sale_end_at">,
  at: Date = new Date(),
): boolean {
  if (!row.on_sale) return false;
  const now = at.getTime();
  if (row.sale_start_at && new Date(row.sale_start_at).getTime() > now) return false;
  if (row.sale_end_at && new Date(row.sale_end_at).getTime() < now) return false;
  return true;
}

export function computeSalePricePkr(
  row: Pick<Product, "price_pkr" | "sale_price" | "discount_percent">,
): number | null {
  if (row.sale_price != null && row.sale_price > 0) {
    return row.sale_price;
  }
  if (row.discount_percent != null && row.discount_percent > 0) {
    const discounted = row.price_pkr * (1 - row.discount_percent / 100);
    return Math.round(discounted);
  }
  return null;
}

/** Primary seal badge — On Sale > New Arrival > Premium */
export function resolveHighlightSealLabel(
  product: Pick<
    LegacyProduct,
    "onSale" | "isPremium" | "saleStartAt" | "saleEndAt" | "badge"
  >,
): HighlightLabel | undefined {
  if (product.onSale && isSaleWindowActiveFromLegacy(product)) return "on-sale";
  if (product.badge === "new") return "new-arrival";
  if (product.isPremium) return "premium";
  return undefined;
}

/** @deprecated Use resolveHighlightBadges — single-badge fallback */
export function resolveHighlightLabel(
  product: Pick<
    LegacyProduct,
    "onSale" | "isTrending" | "isPremium" | "saleStartAt" | "saleEndAt" | "badge"
  >,
): HighlightLabel | undefined {
  const { seal, pill } = resolveHighlightBadges(product);
  return seal ?? pill;
}

/** Badges for /highlights product cards — seal + pill can coexist */
export function resolveHighlightBadges(
  product: Pick<
    LegacyProduct,
    "onSale" | "isTrending" | "isPremium" | "saleStartAt" | "saleEndAt" | "badge"
  >,
): ResolvedHighlightBadges {
  const seal = resolveHighlightSealLabel(product);
  const pill = product.isTrending ? ("most-selling" as const) : undefined;
  return { seal, pill };
}

export function isSaleWindowActiveFromLegacy(
  product: Pick<LegacyProduct, "onSale" | "saleStartAt" | "saleEndAt">,
  at: Date = new Date(),
): boolean {
  if (!product.onSale) return false;
  const now = at.getTime();
  if (product.saleStartAt && new Date(product.saleStartAt).getTime() > now) return false;
  if (product.saleEndAt && new Date(product.saleEndAt).getTime() < now) return false;
  return true;
}

export function isLegacyProductOnSale(product: LegacyProduct): boolean {
  if (product.onSale && isSaleWindowActiveFromLegacy(product)) return true;
  const price = product.sizes[0]?.price ?? product.price;
  return !!(product.compareAtPrice && product.compareAtPrice > price);
}

export function highlightLabelText(label: HighlightLabel): string {
  switch (label) {
    case "most-selling":
      return "Selling fast";
    case "on-sale":
      return "On sale";
    case "premium":
      return "Premium luxe";
    case "new-arrival":
      return "New arrival";
  }
}

export type HighlightBadgeContent =
  | { variant: "pill"; text: string }
  | { variant: "seal"; line1: string; line2: string };

/** Visual copy for storefront highlight badges (maazsafder-inspired, Nocturne Doré palette). */
export function highlightBadgeContent(label: HighlightLabel): HighlightBadgeContent {
  switch (label) {
    case "most-selling":
      return { variant: "pill", text: "SELLING FAST!" };
    case "on-sale":
      return { variant: "seal", line1: "SALE!", line2: "ON SALE" };
    case "premium":
      return { variant: "seal", line1: "LUXE", line2: "PREMIUM" };
    case "new-arrival":
      return { variant: "seal", line1: "NEW!", line2: "ARRIVAL" };
  }
}

/** @deprecated Use HighlightBadge component — kept for any legacy className consumers */
export function highlightLabelClasses(label: HighlightLabel): string {
  switch (label) {
    case "most-selling":
      return "highlight-badge-pill";
    case "on-sale":
      return "highlight-badge-seal highlight-badge-seal--sale";
    case "premium":
      return "highlight-badge-seal highlight-badge-seal--premium";
    case "new-arrival":
      return "highlight-badge-seal highlight-badge-seal--new";
  }
}
