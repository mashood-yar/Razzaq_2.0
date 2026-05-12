import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPKR } from "@/lib/utils";
import { isSupabaseConfigured } from "@/utils/supabase/public-env";

export const dynamic = "force-dynamic";

interface CollectionProduct {
  id: string;
  name: string;
  slug: string;
  price_pkr: number;
  compare_at_price?: number | null;
  status: string;
  product_images: { url: string; alt_text?: string; is_primary?: boolean; sort_order?: number }[];
}

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isSupabaseConfigured()) {
    return { title: slug };
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("name, seo_title, seo_desc")
    .eq("slug", slug)
    .single();

  return {
    title: data?.seo_title ?? data?.name ?? "Collection",
    description: data?.seo_desc ?? undefined,
  };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort: sortParam, page: pageParam } = await searchParams;
  if (!isSupabaseConfigured()) notFound();
  const supabase = await createClient();
  const sort = sortParam || "newest";
  const page = Math.max(1, parseInt(pageParam || "1"));
  const limit = 24;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data: collection, error: colErr } = await supabase
    .from("collections")
    .select("*")
    .eq("slug", slug)
    .single();

  if (colErr || !collection) notFound();

  let query = supabase
    .from("products")
    .select(
      `id, name, slug, price_pkr, compare_at_price, status,
       product_images(url, alt_text, is_primary, sort_order),
       product_collections!inner(collection_id)`,
      { count: "exact" }
    )
    .eq("product_collections.collection_id", collection.id)
    .eq("status", "active");

  if (sort === "price-asc") {
    query = query.order("price_pkr", { ascending: true });
  } else if (sort === "price-desc") {
    query = query.order("price_pkr", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data: products, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / limit);

  return (
    <div>
      {/* Collection Hero */}
      <div className="relative h-64 overflow-hidden sm:h-80">
        {collection.banner_url ? (
          <Image
            src={collection.banner_url}
            alt={collection.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="h-full bg-charcoal" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-6 pb-10">
          <h1 className="font-display text-4xl text-ivory sm:text-5xl">{collection.name}</h1>
          {collection.description && (
            <p className="mt-2 max-w-xl text-smoke">{collection.description}</p>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-smoke">
            {count ?? 0} {count === 1 ? "product" : "products"}
          </p>
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-widest text-smoke">Sort</label>
            <form className="flex gap-2">
              {[
                { value: "newest", label: "Newest" },
                { value: "price-asc", label: "Price ↑" },
                { value: "price-desc", label: "Price ↓" },
              ].map((opt) => (
                <Link
                  key={opt.value}
                  href={`?sort=${opt.value}`}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    sort === opt.value
                      ? "border-gold bg-gold/10 text-gold"
                      : "border-graphite text-smoke hover:border-gold/40"
                  }`}
                >
                  {opt.label}
                </Link>
              ))}
            </form>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        {!products || products.length === 0 ? (
          <div className="py-24 text-center text-smoke">
            <p className="font-display text-3xl italic">No products yet.</p>
            <p className="mt-2 text-sm">Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {(products as CollectionProduct[]).map((p) => {
              const images = p.product_images ?? [];
              const primaryImg =
                images.find((i) => i.is_primary)?.url ??
                images.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0]?.url;

              return (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-charcoal">
                    {primaryImg ? (
                      <Image
                        src={primaryImg}
                        alt={p.name}
                        fill
                        sizes="(max-width:640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-ash text-xs">
                        No image
                      </div>
                    )}
                    {p.compare_at_price && p.compare_at_price > p.price_pkr && (
                      <span className="absolute left-3 top-3 rounded-full bg-error/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ivory">
                        Sale
                      </span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                  <div className="mt-4">
                    <h3 className="font-body font-medium text-ivory transition-colors group-hover:text-gold">
                      {p.name}
                    </h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-gold">{formatPKR(p.price_pkr)}</span>
                      {p.compare_at_price && p.compare_at_price > p.price_pkr && (
                        <span className="text-sm text-smoke line-through">
                          {formatPKR(p.compare_at_price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {page > 1 && (
              <Link
                href={`?sort=${sort}&page=${page - 1}`}
                className="rounded-lg border border-graphite px-4 py-2 text-sm text-smoke hover:border-gold/40 hover:text-ivory"
              >
                ← Previous
              </Link>
            )}
            <span className="rounded-lg border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold">
              {page} / {totalPages}
            </span>
            {page < totalPages && (
              <Link
                href={`?sort=${sort}&page=${page + 1}`}
                className="rounded-lg border border-graphite px-4 py-2 text-sm text-smoke hover:border-gold/40 hover:text-ivory"
              >
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
