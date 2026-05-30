import type { LegacyProduct } from "@/lib/products";

/** Homepage signature line — slug prefix before Supabase UUID suffix. */
export const HOME_FEATURED_SLUG_BASES = [
  "khans-aura",
  "flora",
  "sporty",
  "legend",
] as const;

export type HomeFeaturedSlugBase = (typeof HOME_FEATURED_SLUG_BASES)[number];

export type HomeFeaturedMarqueeProduct = {
  slug: string;
  name: string;
  tagline: string;
};

const TAGLINES: Record<HomeFeaturedSlugBase, string> = {
  "khans-aura": "Bold prestige — commanding presence.",
  flora: "Luminous florals — soft bloom, lasting impression.",
  sporty: "Bright, athletic energy — your everyday standout.",
  legend: "Iconic depth — a story in every note.",
};

export function homeFeaturedSlugBase(slug: string): HomeFeaturedSlugBase | null {
  return (
    HOME_FEATURED_SLUG_BASES.find((base) => slug === base || slug.startsWith(`${base}-`)) ?? null
  );
}

export function isHomeFeaturedProduct(slug: string): boolean {
  return homeFeaturedSlugBase(slug) !== null;
}

export function homeFeaturedSortIndex(slug: string): number {
  const base = homeFeaturedSlugBase(slug);
  if (!base) return HOME_FEATURED_SLUG_BASES.length;
  return HOME_FEATURED_SLUG_BASES.indexOf(base);
}

export function filterHomeFeaturedProducts<T extends { slug: string }>(products: T[]): T[] {
  return products
    .filter((p) => isHomeFeaturedProduct(p.slug))
    .sort((a, b) => homeFeaturedSortIndex(a.slug) - homeFeaturedSortIndex(b.slug));
}

export function toHomeFeaturedMarqueeProducts(
  products: LegacyProduct[],
): HomeFeaturedMarqueeProduct[] {
  return filterHomeFeaturedProducts(products).map((p) => {
    const base = homeFeaturedSlugBase(p.slug)!;
    return {
      slug: p.slug,
      name: p.name,
      tagline: p.tagline || TAGLINES[base],
    };
  });
}
