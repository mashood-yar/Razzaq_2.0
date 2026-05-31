"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Heart, Eye, Check } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { LegacyProduct as Product } from "@/lib/products";
import { ListingCardImages } from "@/components/product/listing-card-images";
import { cn, formatPKR } from "@/lib/utils";
import { StarRating } from "@/components/product/star-rating";
import { useCartStore } from "@/stores/cart-store";
import { QuickViewModal } from "@/components/product/quick-view-modal";
import { useFlyToCart } from "@/components/motion/fly-to-cart";
import {
  type HighlightLabel,
  highlightLabelClasses,
  highlightLabelText,
  isLegacyProductOnSale,
  resolveHighlightLabel,
} from "@/lib/product-highlights";

export type { HighlightLabel };

// ─── Nocturne Doré image hover variants ──────────────────────────────────────
const imageVariants = {
  rest:  { scale: 1 },
  hover: { scale: 1.035 },
};

const overlayVariants = {
  rest:  { opacity: 0 },
  hover: { opacity: 1 },
};

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
    case "new":        return "bg-[#4caf82] text-white";
    case "limited":    return "bg-[#e05a5a]/90 text-white";
  }
}

export function ProductCard({
  product,
  className,
  radiusClass = "rounded-sm",
  highlightLabel,
}: {
  product: Product;
  className?: string;
  radiusClass?: string;
  highlightLabel?: HighlightLabel;
}) {
  const reduceMotion = useReducedMotion();
  const addItem = useCartStore((s) => s.addItem);
  const fly = useFlyToCart();
  const bagRef = useRef<HTMLButtonElement>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  // UX Law: Aesthetic-Usability — wishlist toggle state
  const [wishlisted, setWishlisted] = useState(false);
  // UX Law: Doherty Threshold — instant add feedback
  const [added, setAdded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const canHover = typeof window !== "undefined"
    ? window.matchMedia("(hover: hover)").matches
    : true;

  const defaultSize = product.sizes[1] ?? product.sizes[0];
  const resolvedHighlight = highlightLabel ?? resolveHighlightLabel(product);
  const onSale = isLegacyProductOnSale(product);
  const displayPrice = defaultSize?.price ?? product.price;
  const comparePrice =
    onSale && product.compareAtPrice && product.compareAtPrice > displayPrice
      ? product.compareAtPrice
      : undefined;

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
      price: displayPrice,
      quantity: 1,
      variantLabel: defaultSize.label,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const card = (
    <motion.article
      className={cn("group relative flex flex-col", className)}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px", amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      onHoverStart={() => setShowOverlay(true)}
      onHoverEnd={() => setShowOverlay(false)}
    >
      {/* ── Image container ──────────────────────────────────────────────── */}
      <motion.div
        className={cn(
          "relative aspect-[2/3] overflow-hidden border border-border bg-noir-surface shadow-card transition-shadow duration-500 [@media(hover:hover)]:group-hover:shadow-nocturne",
          radiusClass,
        )}
        variants={imageVariants}
        initial="rest"
        animate={showOverlay ? "hover" : "rest"}
        whileHover={canHover && !reduceMotion ? "hover" : undefined}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      >
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0 overflow-hidden">
          <ListingCardImages
            primarySrc={product.images[0]}
            secondarySrc={product.images[1]}
            alt={product.name}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>

        {/* ── Legacy badge (left) ─────────────────────────────────────────── */}
        {product.badge && (
          <span className={cn(
            "absolute left-3 top-3 z-10 font-body font-semibold text-[9px] uppercase tracking-[0.18em] px-2.5 py-1 rounded-none",
            badgeStyle(product.badge)
          )}>
            {badgeLabel(product.badge)}
          </span>
        )}

        {/* ── Highlight label (right) — Nocturne Doré feature ────────────── */}
        {resolvedHighlight && (
          <span className={cn(
            "absolute right-3 top-3 z-10 rounded-none px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em]",
            highlightLabelClasses(resolvedHighlight),
          )}>
            {highlightLabelText(resolvedHighlight)}
          </span>
        )}

        {/* ── Wishlist — Fitts's Law: 40px target, always visible ─────────── */}
        <motion.button
          whileTap={{ scale: 0.85 }}
          className={cn(
            "absolute top-3 right-3 z-20 w-[36px] h-[36px] flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-200",
            resolvedHighlight ? "top-11" : "top-3",
            wishlisted
              ? "bg-[#e05a5a]/20 text-[#e05a5a] border border-[#e05a5a]/40"
              : "bg-noir-surface/75 text-muted-foreground border border-border/50 hover:text-[#e05a5a] hover:border-[#e05a5a]/30"
          )}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted(!wishlisted); }}
          aria-label="Add to wishlist"
        >
          <Heart className={cn("w-3.5 h-3.5 transition-all", wishlisted && "fill-current")} />
        </motion.button>

        {/* ── Quick View overlay — mobile bottom bar ──────────────────────── */}
        <motion.div
          variants={overlayVariants}
          transition={{ duration: 0.2 }}
          className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/50 to-transparent lg:hidden"
        >
          <motion.div className="px-3 pb-3">
            {/* Fitts's Law: full-width touch target for quick view on mobile */}
            <button
              type="button"
              className="flex h-9 w-full items-center justify-center gap-1 rounded-none border border-border bg-noir-surface/95 text-[10px] font-medium uppercase tracking-wider text-foreground backdrop-blur-sm"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickOpen(true); }}
            >
              <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Quick view
            </button>
          </motion.div>
        </motion.div>

        {/* ── Desktop Quick View — appears on hover ───────────────────────── */}
        <AnimatePresence>
          {showOverlay && (
            <motion.button
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-3 right-3 z-20 hidden lg:flex w-[36px] h-[36px] items-center justify-center rounded-full bg-noir-surface/75 border border-border/50 text-muted-foreground hover:text-foreground backdrop-blur-sm"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickOpen(true); }}
              aria-label="Quick view"
            >
              <Eye className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Product Info ─────────────────────────────────────────────────── */}
      <div className="mt-4 flex flex-1 flex-col">
        {/* Category / top note meta line — Nocturne Doré feature */}
        {(product.categoryName || product.notes?.top?.[0]) && (
          <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-gold-warm">
            {[product.categoryName, product.notes?.top?.[0]].filter(Boolean).join(" · ")}
          </span>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-[clamp(0.9rem,2.5vw,1.35rem)] font-normal tracking-wide text-foreground transition-colors hover:text-gold-bright leading-snug">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1 truncate text-xs font-light text-muted-foreground">{product.tagline}</p>

        {/* Rating — Law of Similarity: stars consistently styled */}
        <div className="mt-2 flex items-center gap-2">
          <StarRating rating={product.rating} />
          <span className="text-[10px] text-muted-foreground font-body">({product.reviewCount})</span>
        </div>

        {/* Price row */}
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="font-display text-base font-medium text-gold-bright">
            {formatPKR(displayPrice)}
          </span>
          {comparePrice && (
            <span className="font-body text-xs text-muted-foreground line-through">
              {formatPKR(comparePrice)}
            </span>
          )}
        </div>

        {/* Add to Bag — UX Law Doherty: animated ✓ ADDED feedback state */}
        <motion.button
          ref={bagRef}
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          className={cn(
            "product-card-add-nocturne mt-3 flex h-10 w-full items-center justify-center gap-1.5 overflow-hidden rounded-none text-[10px] font-medium uppercase tracking-[0.18em] transition-all duration-200",
            added && "bg-[#4caf82] text-white border-[#4caf82]"
          )}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={3} /> Added
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                + Add to Bag
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
