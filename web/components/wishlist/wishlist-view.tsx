"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPKR } from "@/lib/utils";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlist-store";
import { Button } from "@/components/ui/button";
import { tryCreateBrowserClient } from "@/utils/supabase/client";
import type { LegacyProduct } from "@/lib/products";
import type { Product as DbProduct } from "@/lib/types";
import { ACTIVE_PRODUCT_SELECT } from "@/lib/catalog/active-product-select";
import { mapDbProductToLegacy } from "@/lib/catalog/map-db-product";

export function WishlistView() {
  const ids = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);
  const [saved, setSaved] = useState<LegacyProduct[]>([]);

  useEffect(() => {
    const client = tryCreateBrowserClient();
    if (!client || ids.length === 0) {
      setSaved([]);
      return;
    }
    let cancelled = false;
    void client
      .from("products")
      .select(ACTIVE_PRODUCT_SELECT)
      .eq("status", "active")
      .in("id", ids)
      .then(({ data, error }) => {
        if (cancelled || error || !Array.isArray(data)) return;
        const mapped = (data as DbProduct[]).map(mapDbProductToLegacy);
        const rank = new Map(ids.map((id, i) => [id, i]));
        mapped.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
        setSaved(mapped);
      });
    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h1 className="font-serif text-4xl">Wishlist</h1>
      <p className="mt-4 text-muted-foreground">
        Curated desires — move them to your bag when the moment is right.
      </p>

      {saved.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-white/20 p-16 text-center">
          <Heart className="mx-auto h-12 w-12 text-white/20" aria-hidden />
          <p className="mt-6 text-muted-foreground">Nothing saved yet.</p>
          <Button asChild className="mt-8">
            <Link href="/shop">Browse fragrances</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {saved.map((p) => (
            <li
              key={p.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-card/40 backdrop-blur-md"
            >
              <Link href={`/products/${p.slug}`} className="relative block aspect-[3/4] bg-muted">
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
              </Link>
              <div className="p-4">
                <Link href={`/products/${p.slug}`} className="font-serif text-lg hover:text-gold">
                  {p.name}
                </Link>
                <p className="mt-2 text-sm text-gold">{formatPKR(p.price)}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  type="button"
                  onClick={() => toggle(p.id)}
                >
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
