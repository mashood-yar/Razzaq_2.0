"use client";

import { useRef } from "react";
import { SafeProductImage } from "@/components/product/safe-product-image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StarRating } from "@/components/product/star-rating";
import { NotePyramid } from "@/components/product/note-pyramid";
import type { LegacyProduct as Product } from "@/lib/products";
import { useCartStore } from "@/stores/cart-store";
import { useFlyToCart } from "@/components/motion/fly-to-cart";
import { formatPKR } from "@/lib/utils";

export function QuickViewModal({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const fly = useFlyToCart();
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const defaultSize = product.sizes[1] ?? product.sizes[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto gap-6 border border-[var(--border-fine)] bg-[var(--bg-obsidian)] p-6 sm:p-8 rounded-[4px] shadow-2xl">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] bg-[var(--bg-dusk)]">
            <SafeProductImage
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          <div>
            <DialogHeader className="text-left">
              <DialogTitle className="font-display italic font-light text-[2.5rem] leading-none text-[var(--cream-bone)]">
                {product.name}
              </DialogTitle>
            </DialogHeader>
            <p className="mt-3 font-body font-light text-[15px] text-[var(--cream-muted)]">
              {product.tagline}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <StarRating rating={product.rating} />
              <span className="font-body text-[12px] text-[var(--cream-ghost)]">
                {product.reviewCount} reviews
              </span>
            </div>
            <p className="mt-8 font-body font-bold text-[1.75rem] text-[var(--gold-warm)] flex items-center gap-2">
              {formatPKR(defaultSize?.price ?? product.price)}
              <span className="font-body font-normal text-[14px] text-[var(--cream-ghost)] ml-2">
                · {defaultSize?.label ?? "100 ml"}
              </span>
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-3">
              <button
                ref={addBtnRef}
                className="flex-1 h-[52px] bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-semibold text-[11px] tracking-[0.2em] uppercase rounded-[2px] transition-colors hover:bg-[var(--gold-bright)]"
                onClick={() => {
                  if (!defaultSize) return;
                  if (addBtnRef.current) fly(product.images[0], addBtnRef.current);
                  addItem({
                    id: `${product.id}::${defaultSize.label}`,
                    productId: product.id,
                    name: product.name,
                    imageUrl: product.images[0],
                    price: defaultSize.price,
                    quantity: 1,
                    variantLabel: defaultSize.label,
                  });
                  onOpenChange(false);
                }}
              >
                Add to bag
              </button>
              <Link
                href={`/products/${product.slug}`}
                onClick={() => onOpenChange(false)}
                className="flex-1 h-[52px] flex items-center justify-center border border-[var(--border-mid)] text-[var(--cream-bone)] font-body font-semibold text-[11px] tracking-[0.2em] uppercase rounded-[2px] transition-colors hover:border-[var(--gold-warm)] hover:text-[var(--gold-warm)]"
              >
                Full details
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--border-fine)] pt-8">
          <NotePyramid product={product} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
