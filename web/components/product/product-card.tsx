"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Heart, Eye, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { LegacyProduct as Product } from "@/lib/products";
import { ListingCardImages } from "@/components/product/listing-card-images";
import { cn, formatPKR } from "@/lib/utils";
import { StarRating } from "@/components/product/star-rating";
import { useCartStore } from "@/stores/cart-store";
import { QuickViewModal } from "@/components/product/quick-view-modal";
import { useFlyToCart } from "@/components/motion/fly-to-cart";

// ─── UX Law: Aesthetic-Usability — badge color semantics ─────────────────────
function badgeLabel(b: NonNullable<Product["badge"]>) {
  switch (b) {
    case "bestseller": return "Bestseller";
    case "new":        return "New";
    case "limited":    return "Limited";
  }
}
function badgeStyle(b: NonNullable<Product["badge"]>) {
  switch (b) {
    case "bestseller": return "bg-[var(--gold-warm)] text-[var(--bg-void)]";
    case "new":        return "bg-[var(--sage)] text-white";
    case "limited":    return "bg-[var(--ember)]/90 text-white";
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
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const defaultSize = product.sizes[1] ?? product.sizes[0];

  // ─── Doherty Threshold: optimistic add state, instant feedback ───────────
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
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const card = (
    // ─── Aesthetic-Usability: subtle card lift on hover ─────────────────────
    <motion.article
      className={cn("group flex flex-col cursor-pointer", className)}
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Image container — Law of Proximity: image + actions grouped */}
      <div className="relative aspect-[2/3] w-full bg-[var(--bg-dusk)] rounded-[4px] overflow-hidden mb-3 border border-[var(--border-fine)] group-hover:border-[var(--border-mid)] transition-all duration-300 group-hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0">
          <ListingCardImages
            primarySrc={product.images[0]}
            secondarySrc={product.images[1]}
            alt={product.name}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* Badge — Law of Similarity: color = semantic meaning */}
        {product.badge && (
          <span className={cn(
            "absolute left-2.5 top-2.5 z-10 font-body font-semibold text-[9px] uppercase tracking-[0.2em] px-2.5 py-1 rounded-full",
            badgeStyle(product.badge)
          )}>
            {badgeLabel(product.badge)}
          </span>
        )}

        {/* Action buttons — Fitts's Law: 40px targets, always accessible on mobile */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          {/* Wishlist — always visible */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            className={cn(
              "w-[38px] h-[38px] flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200",
              wishlisted
                ? "bg-[var(--rose-dust)]/20 text-[var(--rose-dust)] border border-[var(--rose-dust)]/40"
                : "bg-[var(--bg-obsidian)]/75 text-[var(--cream-ghost)] border border-white/5 hover:text-[var(--rose-dust)] hover:border-[var(--rose-dust)]/30"
            )}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted(!wishlisted); }}
            aria-label="Add to wishlist"
          >
            <Heart className={cn("w-3.5 h-3.5 transition-all", wishlisted && "fill-current")} />
          </motion.button>

          {/* Quick View — appears on hover */}
          <motion.button
            whileTap={{ scale: 0.85 }}
            initial={false}
            animate={{ opacity: 0, scale: 0.8 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="w-[38px] h-[38px] bg-[var(--bg-obsidian)]/75 border border-white/5 flex items-center justify-center rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 text-[var(--cream-ghost)] hover:text-[var(--cream-bone)]"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickOpen(true); }}
            aria-label="Quick view"
          >
            <Eye className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Product Info — Law of Proximity: tight, purposeful grouping */}
      <div className="px-1 flex flex-col flex-1">
        <Link href={`/products/${product.slug}`} className="mb-0.5">
          <h3 className="font-display font-semibold text-[1.125rem] text-[var(--cream-bone)] transition-colors hover:text-[var(--gold-warm)] leading-tight">
            {product.name}
          </h3>
        </Link>
        <p className="font-body font-light text-[12px] text-[var(--cream-muted)] truncate mb-2">
          {product.tagline}
        </p>

        {/* Rating — Law of Similarity: stars consistently gold throughout */}
        <div className="flex items-center gap-1.5 mb-3">
          <StarRating rating={product.rating} />
          <span className="text-[10px] text-[var(--cream-ghost)] font-body">({product.reviewCount})</span>
        </div>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mb-3 mt-auto">
          <span className="font-body font-bold text-[1.0625rem] text-[var(--gold-warm)]">
            {formatPKR(defaultSize?.price ?? product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > (defaultSize?.price ?? product.price) && (
            <span className="font-body font-light text-[0.8125rem] text-[var(--cream-ghost)] line-through">
              {formatPKR(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Add to Cart — Doherty: animated feedback state, Fitts: full-width target */}
        <motion.button
          ref={bagRef}
          onClick={handleAdd}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "w-full h-[44px] font-body font-semibold text-[10px] tracking-[0.22em] rounded-full transition-all duration-200 flex items-center justify-center gap-1.5 overflow-hidden",
            added
              ? "bg-[var(--sage)] text-white"
              : "bg-[var(--gold-warm)] text-[var(--bg-void)] hover:bg-[var(--gold-bright)] hover:shadow-[0_0_20px_rgba(201,160,80,0.25)] focus:ring-2 focus:ring-[var(--gold-warm)] focus:outline-none"
          )}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={3} /> ADDED
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                ADD TO CART
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
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
