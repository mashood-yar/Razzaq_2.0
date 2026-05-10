import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Collections",
  description: "Explore Razzaq Luxe collections — Fragrances, Lawn, Formal, Casual and more.",
};

interface CollectionItem {
  slug: string;
  name: string;
  description?: string | null;
  banner_url?: string | null;
}

const FALLBACK_COLLECTIONS: CollectionItem[] = [
  {
    slug: "fragrances",
    name: "Fragrances",
    description: "Signature scents — perfumes that define your presence.",
    banner_url: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "lawn",
    name: "Lawn",
    description: "Premium lawn fabric — breathe in luxury every season.",
    banner_url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "formal",
    name: "Formal",
    description: "Impeccably tailored — dress for the moment.",
    banner_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80",
  },
];

export default async function CollectionsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("slug, name, description, banner_url")
    .eq("is_active", true)
    .order("sort_order");

  const cols: CollectionItem[] = (data && data.length > 0) ? data : FALLBACK_COLLECTIONS;

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-serif text-4xl sm:text-5xl">Collections</h1>
        <p className="mt-4 text-muted-foreground">
          Choose a world — each path filters our universe of styles.
        </p>
      </header>

      <div className="mt-16 grid gap-10 md:grid-cols-3">
        {cols.map((c) => (
          <Link
            key={c.slug}
            href={`/collections/${c.slug}`}
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-white/10 bg-muted"
          >
            {c.banner_url && (
              <Image
                src={c.banner_url}
                alt=""
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width:768px) 100vw, 33vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8">
              <h2 className="font-serif text-3xl text-white">{c.name}</h2>
              {c.description && (
                <p className="mt-2 text-sm text-white/80">{c.description}</p>
              )}
              <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                Explore →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
