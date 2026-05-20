import type { MainNoteCategory, Product as DbProduct, ProductImage } from "@/lib/types";
import type { LegacyProduct } from "@/lib/products";
import {
  PRODUCT_PLACEHOLDER_SRC,
  getProductImageUrl,
} from "@/lib/product-image";

/** @deprecated Use `PRODUCT_PLACEHOLDER_SRC` from `@/lib/product-image`. */
export { PRODUCT_PLACEHOLDER_SRC as PLACEHOLDER_PRODUCT_IMAGE, getProductImageUrl } from "@/lib/product-image";

const MAIN_NOTE_SET = new Set<MainNoteCategory>([
  "Woody",
  "Citrus",
  "Floral",
  "Oriental",
  "Fresh",
  "Spicy",
  "Gourmand",
  "Amber",
]);

function sortedImageUrls(images: ProductImage[] | undefined): string[] {
  if (!images?.length) return [PRODUCT_PLACEHOLDER_SRC];
  const sorted = [...images].sort((a, b) => {
    const o = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (o !== 0) return o;
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    return 0;
  });
  const urls = sorted
    .map((i) => getProductImageUrl(i.url))
    .filter((u) => u !== PRODUCT_PLACEHOLDER_SRC);
  return urls.length ? urls : [PRODUCT_PLACEHOLDER_SRC];
}

function parseMlFromLabel(label: string | null | undefined, fallback: number): number {
  if (!label) return fallback;
  const m = label.match(/(\d+)\s*ml/i);
  return m ? parseInt(m[1], 10) : fallback;
}

function buildSizes(row: DbProduct): LegacyProduct["sizes"] {
  const variants = row.product_variants ?? [];
  const fb = typeof row.liter_ml === "number" && row.liter_ml > 0 ? row.liter_ml : 50;

  if (variants.length === 0) {
    return [{ label: "Standard", ml: fb, price: row.price_pkr }];
  }

  return variants.map((v) => {
    const label = v.size?.trim() || "Standard";
    const ml = parseMlFromLabel(v.size, fb);
    const price = v.price_override ?? row.price_pkr;
    return { label, ml, price };
  });
}

function inferGender(tags: string[] | null | undefined): LegacyProduct["gender"] {
  for (const tag of tags ?? []) {
    const lower = tag.toLowerCase().trim();
    if (lower === "women" || lower === "womens" || lower === "female") return "women";
    if (lower === "men" || lower === "mens" || lower === "male") return "men";
    if (lower === "unisex") return "unisex";
  }
  return "unisex";
}

function tagsToMainNotes(tags: string[] | null | undefined): MainNoteCategory[] {
  const out: MainNoteCategory[] = [];
  for (const tag of tags ?? []) {
    const t = tag.trim();
    const cap =
      t.length > 0 ? (t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()) : "";
    if (MAIN_NOTE_SET.has(cap as MainNoteCategory)) {
      out.push(cap as MainNoteCategory);
    }
  }
  return out.length ? out : ["Fresh"];
}

function badgeFromTags(tags: string[] | null | undefined): LegacyProduct["badge"] | undefined {
  const lower = new Set((tags ?? []).map((x) => x.toLowerCase().trim()));
  if (lower.has("bestseller") || lower.has("best seller")) return "bestseller";
  if (lower.has("new") || lower.has("new arrival")) return "new";
  if (lower.has("limited") || lower.has("limited edition")) return "limited";
  return undefined;
}

function taglineFrom(row: DbProduct): string {
  if (row.seo_desc?.trim()) return row.seo_desc.trim();
  const d = row.description?.trim();
  if (!d) return row.name;
  const line = d.split(/\r?\n/).find((l) => l.trim()) ?? d;
  return line.length > 140 ? `${line.slice(0, 137)}…` : line;
}

/** Map Supabase product (+ joins) to `LegacyProduct` used by shop cards / legacy PDP helpers. */
export function mapDbProductToLegacy(row: DbProduct): LegacyProduct {
  const images = sortedImageUrls(row.product_images);
  const tags = row.tags ?? [];

  return {
    id: row.id,
    slug: row.slug,
    created_at: row.created_at,
    name: row.name,
    tagline: taglineFrom(row),
    price: row.price_pkr,
    compareAtPrice: row.compare_at_price ?? undefined,
    rating: 0,
    reviewCount: 0,
    gender: inferGender(tags),
    images,
    badge: badgeFromTags(tags),
    notes: { top: [], heart: [], base: [] },
    description: row.description ?? "",
    story: row.description ?? "",
    ingredients: "",
    longevity: 3,
    sillage: 3,
    mainNotes: tagsToMainNotes(tags),
    sizes: buildSizes(row),
    concentration: "Eau de Parfum",
    collection: "signature",
    categorySlug: row.categories?.slug,
    categoryName: row.categories?.name,
  };
}

/** Narrow rows returned by lightweight selects into `DbProduct` for mapping. */
export function mapPartialDbProductToLegacy(
  row: Pick<
    DbProduct,
    | "id"
    | "slug"
    | "name"
    | "price_pkr"
    | "compare_at_price"
    | "description"
    | "seo_desc"
    | "tags"
    | "liter_ml"
    | "product_images"
    | "product_variants"
  >,
): LegacyProduct {
  return mapDbProductToLegacy(row as DbProduct);
}
