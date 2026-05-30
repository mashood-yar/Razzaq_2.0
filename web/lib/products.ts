import type { MainNoteCategory } from "./types";

// Legacy fragrance catalog shape — `price` / `compareAtPrice` / variant prices are PKR (whole rupees).
// Live listings map from Supabase via `lib/catalog/map-db-product`.
export type LegacyProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  gender: "men" | "women" | "unisex";
  images: string[];
  badge?: "bestseller" | "new" | "limited";
  notes: { top: string[]; heart: string[]; base: string[] };
  description: string;
  story: string;
  ingredients: string;
  longevity: number;
  sillage: number;
  mainNotes: MainNoteCategory[];
  sizes: { label: string; ml: number; price: number }[];
  concentration: string;
  collection: "signature" | "limited" | "atelier";
  /** Present when mapped from Supabase — used for shop “newest” sort */
  created_at?: string;
  /** Category slug from Supabase join — used for shop category banners/filters */
  categorySlug?: string;
  categoryName?: string;
  /** Admin highlight flags from Supabase */
  isTrending?: boolean;
  isPremium?: boolean;
  onSale?: boolean;
  salePrice?: number | null;
  discountPercent?: number | null;
  saleStartAt?: string | null;
  saleEndAt?: string | null;
};

export function getProductBySlugFromList(
  slug: string,
  products: LegacyProduct[],
): LegacyProduct | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProductsFromList(
  slug: string,
  catalog: LegacyProduct[],
  limit = 4,
): LegacyProduct[] {
  const p = getProductBySlugFromList(slug, catalog);
  if (!p) return catalog.slice(0, limit);
  return catalog.filter((x) => x.slug !== slug && x.gender === p.gender).slice(0, limit);
}

/** Quiz recommendation: score products by user's preferred note families */
export function scoreProductsForQuiz(
  catalog: LegacyProduct[],
  preferences: {
    mood: string;
    intensity: string;
    season: string;
    signature: string;
  },
): LegacyProduct[] {
  const weights: Record<string, MainNoteCategory[]> = {
    bold: ["Woody", "Oriental", "Spicy"],
    soft: ["Floral", "Fresh", "Gourmand"],
    bright: ["Citrus", "Fresh"],
    deep: ["Oriental", "Woody", "Amber"],
    clean: ["Fresh", "Floral"],
    sensual: ["Oriental", "Floral", "Gourmand"],
    spring: ["Floral", "Fresh", "Citrus"],
    summer: ["Citrus", "Fresh"],
    fall: ["Woody", "Spicy", "Oriental"],
    winter: ["Oriental", "Amber", "Woody"],
  };
  const preferred = new Set<MainNoteCategory>();
  [preferences.mood, preferences.intensity, preferences.season, preferences.signature].forEach(
    (key) => {
      const arr = weights[key];
      if (arr) arr.forEach((n) => preferred.add(n));
    },
  );
  const scored = catalog.map((product) => {
    let score = 0;
    for (const mn of product.mainNotes) {
      if (preferred.has(mn)) score += 2;
    }
    if (product.badge === "bestseller") score += 1;
    return { product, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((s) => s.product);
}
