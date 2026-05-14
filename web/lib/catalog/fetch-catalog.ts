import type { Product } from "@/lib/types";
import { ACTIVE_PRODUCT_SELECT } from "@/lib/catalog/active-product-select";
import { tryCreateServerClient } from "@/utils/supabase/server";
import type { LegacyProduct } from "@/lib/products";
import { mapDbProductToLegacy } from "./map-db-product";

export { ACTIVE_PRODUCT_SELECT } from "@/lib/catalog/active-product-select";

export async function fetchActiveLegacyProducts(): Promise<LegacyProduct[]> {
  const supabase = await tryCreateServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("products")
    .select(ACTIVE_PRODUCT_SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as Product[]).map(mapDbProductToLegacy);
}

export async function fetchLegacyProductsForHomeBestSellers(
  limit = 4,
): Promise<LegacyProduct[]> {
  const all = await fetchActiveLegacyProducts();
  if (all.length === 0) return [];

  const scored = [...all].sort((a, b) => {
    const ab = a.badge === "bestseller" ? 1 : 0;
    const bb = b.badge === "bestseller" ? 1 : 0;
    if (bb !== ab) return bb - ab;
    return b.price - a.price;
  });

  return scored.slice(0, limit);
}
