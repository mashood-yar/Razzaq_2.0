import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPKR } from "@/lib/utils";
import { SearchBar } from "@/components/search/search-bar";

type Props = { searchParams: { q?: string } };

export function generateMetadata({ searchParams }: Props): Metadata {
  return {
    title: searchParams.q ? `Search: "${searchParams.q}"` : "Search",
    description: "Search Razzaq Luxe products",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = (searchParams.q ?? "").trim();
  const supabase = await createClient();

  let products: {
    id: string;
    name: string;
    slug: string;
    price_pkr: number;
    compare_at_price?: number | null;
    product_images: { url: string; is_primary?: boolean; sort_order?: number }[];
  }[] = [];

  if (q) {
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
          <p className="mb-8 text-sm text-smoke">
            {products.length} result{products.length !== 1 ? "s" : ""} for{" "}
            <span className="text-ivory">"{q}"</span>
          </p>
          {products.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-3xl italic text-smoke">No results found.</p>
              <p className="mt-2 text-sm text-smoke">Try a different search term or browse our collections.</p>
              <Link
                href="/collections"
                className="mt-6 inline-block rounded-full border border-gold px-6 py-2.5 text-sm text-gold hover:bg-gold/10 transition-colors"
              >
                Browse Collections
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => {
                const imgs = [...p.product_images].sort(
                  (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
                );
                const img = imgs.find((i) => i.is_primary)?.url ?? imgs[0]?.url;
                return (
                  <Link key={p.id} href={`/products/${p.slug}`} className="group flex flex-col">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-charcoal">
                      {img ? (
                        <Image
                          src={img}
                          alt={p.name}
                          fill
                          sizes="(max-width:640px) 50vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-ash text-xs">No image</div>
                      )}
                    </div>
                    <h3 className="mt-3 font-body text-sm text-ivory group-hover:text-gold transition-colors">
                      {p.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-gold text-sm">{formatPKR(p.price_pkr)}</span>
                      {p.compare_at_price && p.compare_at_price > p.price_pkr && (
                        <span className="text-xs text-smoke line-through">{formatPKR(p.compare_at_price)}</span>
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
          <p className="font-display text-3xl italic text-smoke">What are you looking for?</p>
        </div>
      )}
    </div>
  );
}
