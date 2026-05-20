import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPKR } from "@/lib/utils";
import { SearchBar } from "@/components/search/search-bar";
import { ListingCardImages } from "@/components/product/listing-card-images";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/lib/catalog/map-db-product";
import { isSupabaseConfigured } from "@/utils/supabase/public-env";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: "${q}"` : "Search",
    description: "Search Razzaq Luxe products",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q: rawQ } = await searchParams;
  const q = (rawQ ?? "").trim();

  let products: {
    id: string;
    name: string;
    slug: string;
    price_pkr: number;
    compare_at_price?: number | null;
    product_images: { url: string; is_primary?: boolean; sort_order?: number }[];
  }[] = [];

  if (q && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, price_pkr, compare_at_price, product_images(url, is_primary, sort_order)")
      .textSearch("search_vector", q, { type: "websearch" })
      .eq("status", "active")
      .limit(24);

    products = data ?? [];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <SearchBar initialValue={q} />
      </div>

      {q ? (
        <div className="mt-10">
          <p className="mb-8 text-sm text-muted-foreground">
            {products.length} result{products.length !== 1 ? "s" : ""} for{" "}
            <span className="text-foreground">&quot;{q}&quot;</span>
          </p>
          {products.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-3xl italic text-muted-foreground">No results found.</p>
              <p className="mt-2 text-sm text-muted-foreground">Try a different search term or browse the shop.</p>
              <Link
                href="/shop"
                className="mt-6 inline-block rounded-full border border-gold px-6 py-2.5 text-sm text-gold transition-colors hover:bg-gold/10"
              >
                Browse the shop
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => {
                const imgs = [...p.product_images].sort(
                  (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0),
                );
                const urls = imgs.map((i) => i.url).filter(Boolean);
                const primarySrc = urls[0] ?? PLACEHOLDER_PRODUCT_IMAGE;
                const secondarySrc = urls[1];
                return (
                  <Link key={p.id} href={`/products/${p.slug}`} className="group flex flex-col">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-charcoal">
                      <ListingCardImages
                        primarySrc={primarySrc}
                        secondarySrc={secondarySrc}
                        alt={p.name}
                        sizes="(max-width:640px) 50vw, 25vw"
                        className="absolute inset-0"
                      />
                    </div>
                    <h3 className="mt-3 font-body text-sm text-foreground group-hover:text-gold transition-colors">
                      {p.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-gold text-sm">{formatPKR(p.price_pkr)}</span>
                      {p.compare_at_price && p.compare_at_price > p.price_pkr && (
                        <span className="text-xs text-muted-foreground line-through">
                          {formatPKR(p.compare_at_price)}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-16 py-16 text-center">
          <p className="font-display text-3xl italic text-muted-foreground">What are you looking for?</p>
        </div>
      )}
    </div>
  );
}
