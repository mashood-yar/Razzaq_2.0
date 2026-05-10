"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { useWishlistStore } from "@/stores/wishlist-store";
import { Button } from "@/components/ui/button";

export function WishlistView() {
  const ids = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);
  const saved = PRODUCTS.filter((p) => ids.includes(p.id));

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
              <Link href={`/shop/${p.slug}`} className="relative block aspect-[3/4] bg-muted">
                <Image
                  src={p.images[0]}
                  alt={p.name}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
              </Link>
              <div className="p-4">
                <Link href={`/shop/${p.slug}`} className="font-serif text-lg hover:text-gold">
                  {p.name}
                </Link>
                <p className="mt-2 text-sm text-gold">${p.price}</p>
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
