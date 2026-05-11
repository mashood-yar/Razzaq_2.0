import {
  ALL_LEGAL_PAGES_QUERY,
  LEGAL_PAGE_QUERY,
} from "@/lib/sanity/queries";
import { getSanityReadClient, isSanityConfigured } from "@/lib/sanity/client";
import { getPublicSupabase } from "@/lib/supabase/public-read";
import { isSupabaseConfigured as isCatalogSupabaseConfigured } from "@/utils/supabase/public-env";

type ChatMessage = { role: string; content?: string };

const PRODUCTS_FOR_CHAT = `
*[_type == "product" && status == "active" && (
  (defined(name) && name match $pattern) ||
  (defined(shortDescription) && shortDescription match $pattern) ||
  (defined(category) && category match $pattern) ||
  (defined(tags) && tags[] match $pattern)
)] {
  name,
  "slug": slug.current,
  price,
  compareAtPrice,
  category,
  tags,
  shortDescription
} [0...8]
`;

const COLLECTIONS_FOR_CHAT = `
*[_type == "collection" && isActive == true && (
  (defined(name) && name match $pattern) ||
  (defined(description) && description match $pattern)
)] {
  name,
  "slug": slug.current,
  description
} [0...5]
`;

const BLOG_FOR_CHAT = `
*[_type == "blogPost" && defined(publishedAt) && (
  (defined(title) && title match $pattern) ||
  (defined(excerpt) && excerpt match $pattern) ||
  (defined(tags) && tags[] match $pattern)
)] {
  title,
  "slug": slug.current,
  excerpt,
  tags
} [0...5]
`;

const HOMEPAGE_SNIPPET = `
*[_type == "homepage"][0] {
  brandStatement,
  heroHeadline,
  heroSubline
}
`;

type SanityProductHit = {
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  category?: string | null;
  tags?: string[] | null;
  shortDescription?: string | null;
};

type ShopCatalogRow = {
  name: string;
  slug: string;
  price_pkr: number;
  compare_at_price?: number | null;
  description?: string | null;
  tags?: string[] | null;
  stock_quantity?: number | null;
  /** Supabase may return either a FK object or array depending on codegen. */
  categories?: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

type LegalSummary = { title: string; slug: string };

/** Sanity `homepage` singleton fields used in chat grounding. */
type SiteHomepagePeek = {
  brandStatement?: unknown;
  heroHeadline?: string;
  heroSubline?: string;
} | null;

type LegalDetail = {
  title?: string | null;
  lastUpdated?: string | null;
  sections?: Array<{
    heading?: string | null;
    content?: unknown;
  }> | null;
};

/** Strip characters that break GROQ match params; keep letters/numbers across scripts. */
export function sanitizeSearchNeedle(raw: string): string {
  const trimmed = raw.trim().slice(0, 160);
  return trimmed
    .replace(/[\n\r*"'\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function lastUserMessageText(messages: ChatMessage[]): string {
  const last = [...messages].reverse().find(
    (m) => m.role === "user" && typeof m.content === "string",
  );
  return last?.content?.trim() ?? "";
}

function matchPattern(needle: string): string | null {
  const n = sanitizeSearchNeedle(needle);
  if (n.length < 2) return null;
  return `*${n}*`;
}

// ─── Portable text → plain (legal sections) ───────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function portableBlocksToPlain(blocks: any[] | null | undefined): string {
  if (!Array.isArray(blocks)) return "";
  const out: string[] = [];
  for (const block of blocks) {
    if (block?._type === "block" && Array.isArray(block.children)) {
      const line = block.children
        .map((c: { text?: string }) => c?.text ?? "")
        .join("");
      if (line) out.push(line);
    }
  }
  return out.join("\n").trim();
}

/** Pick up to two policy documents to load in full based on wording + slug overlap. */
function legalSlugsToDeepFetch(pages: LegalSummary[], message: string): string[] {
  const norm = message.toLowerCase().replace(/\s+/g, " ");
  const words = sanitizeSearchNeedle(message)
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const slugHints: Array<{ test: RegExp; slugSubstring: string }> = [
    { test: /\b(return|refund|exchange|warranty)/i, slugSubstring: "return" },
    { test: /\b(shipp?ing|deliver(y|ies)?|carrier|parcel|courier)/i, slugSubstring: "ship" },
    { test: /\b(privacy|personal data|gdpr|cookies?)/i, slugSubstring: "privacy" },
    { test: /\b(term|conditions?|tos|legal disclaimer)/i, slugSubstring: "term" },
  ];

  const out = new Set<string>();

  for (const { test, slugSubstring } of slugHints) {
    if (!test.test(message)) continue;
    const hit = pages.find(
      (p) =>
        p.slug.toLowerCase().includes(slugSubstring) ||
        p.title.toLowerCase().includes(slugSubstring),
    );
    if (hit) out.add(hit.slug);
  }

  const scored = pages
    .map((p) => {
      let score = 0;
      const hyphenWords = p.slug.replace(/-/g, " ").toLowerCase();
      const blob = `${p.title} ${hyphenWords}`.toLowerCase();
      for (const w of words) {
        if (blob.includes(w.toLowerCase())) score += 2;
      }
      if (hyphenWords.length > 2 && norm.includes(hyphenWords)) score += 6;
      if (norm.includes(p.slug.replace(/-/g, " "))) score += 5;
      return { slug: p.slug, score };
    })
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score);

  for (const row of scored) {
    out.add(row.slug);
    if (out.size >= 2) break;
  }

  return [...out].slice(0, 2);
}

function formatLegalDetailForPrompt(
  doc: LegalDetail,
  slug: string,
  siteUrl: string,
): string {
  const lines: string[] = [];
  lines.push(`### ${doc.title ?? slug}`);
  lines.push(`Page: ${siteUrl}/policies/${slug}`);
  if (doc.lastUpdated) lines.push(`Last updated: ${doc.lastUpdated}`);
  if (doc.sections?.length) {
    for (const sec of doc.sections) {
      const body = portableBlocksToPlain(
        Array.isArray(sec.content) ? sec.content : [],
      );
      if (sec.heading || body) {
        lines.push(`\n**${sec.heading ?? "Section"}**\n${body}`);
      }
    }
  }
  const text = lines.join("\n");
  return text.length > 12_000 ? `${text.slice(0, 12_000)}\n…(truncated)` : text;
}

async function fetchSupabaseProductsForNeedle(
  needleText: string,
): Promise<ShopCatalogRow[]> {
  if (!isCatalogSupabaseConfigured()) return [];
  const sb = getPublicSupabase();
  if (!sb) return [];

  const clean = sanitizeSearchNeedle(needleText);
  if (clean.length < 2) return [];

  const select =
    "name, slug, price_pkr, compare_at_price, description, tags, stock_quantity, categories(name, slug)";

  const { data: vec, error } = await sb
    .from("products")
    .select(select)
    .eq("status", "active")
    .textSearch("search_vector", clean.replace(/:/g, " "), {
      type: "websearch",
    })
    .limit(8);

  if (!error && vec?.length) return vec as unknown as ShopCatalogRow[];

  const fuzzy = `%${clean.replace(/[%_]/g, "").slice(0, 96)}%`;
  const nameQ = sb
    .from("products")
    .select(select)
    .eq("status", "active")
    .ilike("name", fuzzy)
    .limit(8);
  const descQ = sb
    .from("products")
    .select(select)
    .eq("status", "active")
    .ilike("description", fuzzy)
    .limit(8);

  const [{ data: byName }, { data: byDesc }] = await Promise.all([nameQ, descQ]);
  const bySlug = new Map<string, ShopCatalogRow>();
  for (const row of [...(byName ?? []), ...(byDesc ?? [])]) {
    const r = row as unknown as ShopCatalogRow;
    bySlug.set(r.slug, r);
    if (bySlug.size >= 8) break;
  }
  return [...bySlug.values()];
}

function formatSanityProduct(p: SanityProductHit, siteUrl: string): string {
  const tags = p.tags?.length ? ` · tags: ${p.tags.join(", ")}` : "";
  const compare =
    p.compareAtPrice != null ? ` · compare-at PKR ${p.compareAtPrice}` : "";
  return `- **${p.name}** — PKR ${p.price}${compare}${p.category ? ` · ${p.category}` : ""}${tags}\n  Sanity · ${siteUrl}/products/${p.slug}\n  ${p.shortDescription ?? ""}`;
}

function formatShopRow(p: ShopCatalogRow, siteUrl: string): string {
  const catRec = Array.isArray(p.categories) ? p.categories[0] : p.categories;
  const cat = catRec?.name ? ` · ${catRec.name}` : "";
  const tags = p.tags?.length ? ` · tags: ${p.tags.join(", ")}` : "";
  const stock =
    typeof p.stock_quantity === "number"
      ? ` · stock: ${p.stock_quantity}`
      : "";
  const compare =
    p.compare_at_price != null ? ` · compare-at PKR ${p.compare_at_price}` : "";
  const desc =
    typeof p.description === "string"
      ? p.description.replace(/\s+/g, " ").slice(0, 220)
      : "";
  return `- **${p.name}** — PKR ${Number(p.price_pkr)}${compare}${cat}${tags}${stock}\n  Shop · ${siteUrl}/products/${p.slug}\n  ${desc}`;
}

/**
 * Loads relevant Sanity docs + matching Supabase catalog rows + deep-linked legal pages.
 */
export async function fetchSiteContextForChat(
  messages: ChatMessage[],
): Promise<string> {
  const sanityOn = isSanityConfigured();
  const client = sanityOn ? getSanityReadClient() : null;
  const sanityReady = !!(sanityOn && client);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "https://your-site.example";

  const needleText = lastUserMessageText(messages);
  const pattern = matchPattern(needleText);

  if (!sanityReady && !isCatalogSupabaseConfigured()) {
    return "";
  }

  try {
    const shopRowsPromise = fetchSupabaseProductsForNeedle(needleText);

    let legalPages: LegalSummary[] = [];
    let homepageDoc: SiteHomepagePeek = null;
    let sanityProducts: SanityProductHit[] = [];
    let collections: Array<{
      name: string;
      slug: string;
      description?: string | null;
    }> = [];
    let posts: Array<{
      title: string;
      slug: string;
      excerpt?: string | null;
      tags?: string[] | null;
    }> = [];

    if (sanityReady && client) {
      const [lp, hp, sp, col, bl] = await Promise.all([
        client.fetch<LegalSummary[]>(ALL_LEGAL_PAGES_QUERY),
        client.fetch<SiteHomepagePeek>(HOMEPAGE_SNIPPET),
        pattern
          ? client.fetch<SanityProductHit[]>(PRODUCTS_FOR_CHAT, { pattern })
          : Promise.resolve<SanityProductHit[]>([]),
        pattern
          ? client.fetch<
              Array<{
                name: string;
                slug: string;
                description?: string | null;
              }>
            >(COLLECTIONS_FOR_CHAT, { pattern })
          : Promise.resolve([]),
        pattern
          ? client.fetch<
              Array<{
                title: string;
                slug: string;
                excerpt?: string | null;
                tags?: string[] | null;
              }>
            >(BLOG_FOR_CHAT, { pattern })
          : Promise.resolve([]),
      ]);
      legalPages = lp ?? [];
      homepageDoc = hp;
      sanityProducts = sp ?? [];
      collections = col ?? [];
      posts = bl ?? [];
    }

    const shopRows = await shopRowsPromise;

    const deepLegalSlugs = sanityReady
      ? legalSlugsToDeepFetch(legalPages, needleText)
      : [];
    const legalDetails: Array<{ slug: string; doc: LegalDetail }> = [];
    if (client && deepLegalSlugs.length) {
      await Promise.all(
        deepLegalSlugs.map(async (slug) => {
          const doc = await client.fetch<LegalDetail>(LEGAL_PAGE_QUERY, {
            slug,
          });
          if (doc) legalDetails.push({ slug, doc });
        }),
      );
    }

    const chunks: string[] = [];

    chunks.push(
      "Use the following CMS + shop catalog + policy excerpts as ground truth. Prefer live shop rows for stock and PKR pricing when listed. Sanity products may overlap marketing copy; cite both URLs if unsure. Do not invent items or prices.",
    );
    chunks.push(`Site base URL: ${siteUrl}`);

    if (
      homepageDoc?.brandStatement ||
      homepageDoc?.heroHeadline
    ) {
      const brand =
        typeof homepageDoc.brandStatement === "string"
          ? homepageDoc.brandStatement
          : "";
      const hero = [homepageDoc.heroHeadline, homepageDoc.heroSubline]
        .filter(Boolean)
        .join(" — ");
      if (brand || hero) {
        chunks.push(
          `\n## Brand / homepage\n${[hero && `Hero: ${hero}`, brand && `Statement: ${brand}`].filter(Boolean).join("\n")}`,
        );
      }
    }

    if (legalPages.length) {
      chunks.push(
        `\n## All policy pages (index)\n${legalPages.map((p) => `- ${p.title} → ${siteUrl}/policies/${p.slug}`).join("\n")}`,
      );
    }

    if (legalDetails.length) {
      chunks.push("\n## Matched policies (full text excerpt — authoritative for these topics)");
      for (const { slug, doc } of legalDetails) {
        chunks.push(
          `\n---\n${formatLegalDetailForPrompt(doc, slug, siteUrl)}\n`,
        );
      }
    }

    if (shopRows.length) {
      chunks.push(`\n## Shop catalog (${shopRows.length} matches · live DB)`);
      chunks.push(shopRows.map((p) => formatShopRow(p, siteUrl)).join("\n\n"));
    }

    if (sanityProducts.length) {
      chunks.push(
        `\n## Sanity / marketing products (${sanityProducts.length} matches · CMS may mirror shop)`,
      );
      chunks.push(
        sanityProducts.map((p) => formatSanityProduct(p, siteUrl)).join("\n\n"),
      );
    }

    if (collections.length) {
      chunks.push(
        `\n## Matching collections (${siteUrl}/collections/<slug>)\n${collections
          .map(
            (c) =>
              `- **${c.name}** → /collections/${c.slug}\n  ${c.description ?? ""}`,
          )
          .join("\n\n")}`,
      );
    }

    if (posts.length) {
      chunks.push(
        `\n## Matching blog (${siteUrl}/blog/<slug>)\n${posts
          .map(
            (b) =>
              `- **${b.title}** → /blog/${b.slug}\n  ${b.excerpt ?? ""}${b.tags?.length ? ` · tags: ${b.tags.join(", ")}` : ""}`,
          )
          .join("\n\n")}`,
      );
    }

    if (
      pattern &&
      !sanityProducts.length &&
      !collections.length &&
      !posts.length &&
      !shopRows.length &&
      sanityReady
    ) {
      chunks.push(
        "\n(No CMS products, collections, or blog matched; shop search also empty. Policies index + deep-linked pages above still apply if any.)",
      );
    }

    return chunks.join("\n");
  } catch (e) {
    console.error("[chat] site context fetch failed:", e);
    return "";
  }
}
