"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, Star, Eye } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { LegacyProduct as Product } from "@/lib/products";
import { ListingCardImages } from "@/components/product/listing-card-images";
import { cn, formatPKR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/product/star-rating";
import { useCartStore } from "@/stores/cart-store";
import { QuickViewModal } from "@/components/product/quick-view-modal";
import { useFlyToCart } from "@/components/motion/fly-to-cart";
import Image from "next/image";

function badgeLabel(b: NonNullable<Product["badge"]>) {
  switch (b) {
    case "bestseller":
      return "Bestseller";
    case "new":
      return "New";
    case "limited":
      return "Limited";
  }
}

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const fly = useFlyToCart();
  const bagRef = useRef<HTMLButtonElement>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const defaultSize = product.sizes[1] ?? product.sizes[0];

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultSize) return;
    if (bagRef.current) fly(product.images[0], bagRef.current);
    addItem({
      id: `${product.id}::${defaultSize.label}`,
      productId: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: defaultSize.price,
      quantity: 1,
      variantLabel: defaultSize.label,
    });
  }

  const card = (
    <motion.article
      className={cn("group flex flex-col cursor-pointer", className)}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative aspect-[2/3] w-full bg-[var(--bg-dusk)] rounded-[2px] overflow-hidden mb-3">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0">
          <ListingCardImages
            primarySrc={product.images[0]}
            secondarySrc={product.images[1]}
            alt={product.name}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {product.badge && (
          <span className="absolute left-2 top-2 z-10 bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-semibold text-[9px] uppercase tracking-[0.2em] px-2 py-1 rounded-[2px]">
            {badgeLabel(product.badge)}
          </span>
        )}

        <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
          <button className="w-[36px] h-[36px] bg-[var(--bg-obsidian)]/80 flex items-center justify-center rounded-[2px] backdrop-blur-sm transition-colors hover:bg-[var(--bg-dusk)]" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <Heart className="w-4 h-4 text-[var(--cream-ghost)] hover:text-[var(--gold-warm)] transition-colors" />
          </button>
          <button className="w-[36px] h-[36px] bg-[var(--bg-obsidian)]/80 flex items-center justify-center rounded-[2px] backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[var(--bg-dusk)]" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickOpen(true); }}>
            <Eye className="w-4 h-4 text-[var(--cream-ghost)] hover:text-[var(--gold-warm)] transition-colors" />
          </button>
        </div>
      </div>

      <div className="px-1 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display font-semibold text-[1.2rem] text-[var(--cream-bone)] transition-colors hover:text-[var(--gold-warm)]">
            {product.name}
          </h3>
        </Link>
        <p className="font-body font-light text-[12px] text-[var(--cream-muted)] truncate mb-1">
          {product.tagline}
        </p>
        <div className="flex items-center gap-1.5 mb-2">
          <StarRating rating={product.rating} />
          <span className="text-[10px] text-[var(--cream-ghost)]">({product.reviewCount})</span>
        </div>
        
        <div className="flex items-center gap-2 mb-3 mt-auto">
          <span className="font-body font-bold text-[1.125rem] text-[var(--gold-warm)]">
            {formatPKR(defaultSize?.price ?? product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > (defaultSize?.price ?? product.price) && (
            <span className="font-body font-light text-[0.875rem] text-[var(--cream-ghost)] line-through">
              {formatPKR(product.compareAtPrice)}
            </span>
          )}
        </div>

        <button
          ref={bagRef}
          onClick={handleAdd}
          className="w-full h-[44px] bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-semibold text-[10px] tracking-[0.2em] rounded-[2px] transition-all hover:bg-[var(--gold-bright)] hover:shadow-lg focus:ring-1 focus:ring-[var(--gold-warm)] focus:outline-none"
        >
          ADD TO CART
        </button>
      </div>
    </motion.article>
  );

  return (
    <>
      {card}
      <QuickViewModal product={product} open={quickOpen} onOpenChange={setQuickOpen} />
    </>
  );
}
