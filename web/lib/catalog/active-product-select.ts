/** Shared `.select()` shape for storefront product rows (matches `/api/products`). */
export const ACTIVE_PRODUCT_SELECT =
  "*, product_images(*), product_variants(*), categories(name, slug)" as const;
