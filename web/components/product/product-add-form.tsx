"use client";

import { useState, useRef } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LegacyProduct as Product } from "@/lib/products";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useFlyToCart } from "@/components/motion/fly-to-cart";
import { cn, formatPKR } from "@/lib/utils";

export function ProductAddForm({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggle = useWishlistStore((s) => s.toggle);
  const fly = useFlyToCart();
  const addRef = useRef<HTMLButtonElement>(null);
  const wished = useWishlistStore((s) => s.ids.includes(product.id));
  const [sizeIdx, setSizeIdx] = useState(
    Math.min(1, product.sizes.length - 1),
  );
  const [qty, setQty] = useState(1);

  const sel = product.sizes[sizeIdx];
  if (!sel) return null;

  const wishToggle = async () => {
    const next = !wished;
    toggle(product.id);
    try {
      await fetch("/api/wishlist", {
        method: next ? "POST" : "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      });
    } catch {
      toggle(product.id);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Size
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((s, i) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setSizeIdx(i)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                sizeIdx === i
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-white/15 text-muted-foreground hover:border-white/40",
              )}
            >
              {s.label} · {formatPKR(s.price)}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{product.concentration}</p>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Quantity
          </p>
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-white/15 p-2 hover:bg-white/5"
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center tabular-nums">{qty}</span>
            <button
              type="button"
              className="rounded-lg border border-white/15 p-2 hover:bg-white/5"
              aria-label="Increase quantity"
              onClick={() => setQty((q) => q + 1)}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap gap-3">
          <Button
            ref={addRef}
            size="lg"
            className="min-w-[200px] flex-1"
            onClick={() => {
              fly(product.images[0], addRef.current);
              addItem({
                id: `${product.id}::${sel.label}`,
                productId: product.id,
                name: product.name,
                imageUrl: product.images[0],
                price: sel.price,
                quantity: qty,
                variantLabel: sel.label,
              });
            }}
          >
            Add to bag · {formatPKR(sel.price * qty)}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className={cn(wished && "border-gold text-gold")}
            aria-pressed={wished}
            aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
            onClick={() => void wishToggle()}
          >
            <Heart
              className={cn("mr-2 h-5 w-5", wished && "fill-gold text-gold")}
            />
            Wishlist
          </Button>
        </div>
      </div>
    </div>
  );
}
