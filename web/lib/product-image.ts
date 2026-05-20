/** Public path — keep in sync with `public/product-placeholder.svg`. */
export const PRODUCT_PLACEHOLDER_SRC = "/product-placeholder.svg";

/**
 * Resolves a storefront product image URL: trims whitespace and falls back to the local
 * placeholder when missing so `next/image` always receives a valid local path.
 */
export function getProductImageUrl(url: string | null | undefined): string {
  const t = typeof url === "string" ? url.trim() : "";
  return t.length > 0 ? t : PRODUCT_PLACEHOLDER_SRC;
}
