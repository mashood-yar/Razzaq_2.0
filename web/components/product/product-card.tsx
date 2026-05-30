"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
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
  radiusClass = "rounded-sm",
  highlightLabel,
}: {
  product: Product;
  className?: string;
  radiusClass?: string;
  highlightLabel?: HighlightLabel;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const fly = useFlyToCart();
  const bagRef = useRef<HTMLButtonElement>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);
  const defaultSize = product.sizes[1] ?? product.sizes[0];
  const resolvedHighlight = highlightLabel ?? resolveHighlightLabel(product);
  const onSale = isLegacyProductOnSale(product);
  const displayPrice = defaultSize?.price ?? product.price;
  const comparePrice =
    onSale && product.compareAtPrice && product.compareAtPrice > displayPrice
      ? product.compareAtPrice
      : undefined;

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
      price: displayPrice,
      quantity: 1,
      variantLabel: defaultSize.label,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const card = (
    // ─── Aesthetic-Usability: subtle card lift on hover ─────────────────────
    <motion.article
      className={cn("group relative flex flex-col", className)}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px", amount: 0.12 }}
      transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={cn(
          "relative aspect-[2/3] overflow-hidden rounded-sm border border-border bg-noir-surface shadow-card transition-transform duration-500 [@media(hover:hover)]:group-hover:shadow-nocturne",
          radiusClass,
        )}
        variants={imageVariants}
        initial="rest"
        animate={showOverlay ? "hover" : "rest"}
        whileHover={canHover && !reduceMotion ? "hover" : undefined}
      >
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0 overflow-hidden">
          <ListingCardImages
            primarySrc={product.images[0]}
            secondarySrc={product.images[1]}
            alt={product.name}
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </Link>
        {product.badge && (
          <Badge className="absolute left-3 top-3 z-10 rounded-none bg-gold-warm text-[10px] uppercase tracking-[0.18em] text-noir" variant="default">
            {badgeLabel(product.badge)}
          </Badge>
        )}
        {resolvedHighlight && (
          <span
            className={cn(
              "absolute right-3 top-3 z-10 rounded-none px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em]",
              highlightLabelClasses(resolvedHighlight),
            )}
          >
            {highlightLabelText(resolvedHighlight)}
          </span>
        )}
        <motion.div
          variants={overlayVariants}
          transition={{ duration: 0.2 }}
          className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/50 to-transparent lg:hidden"
        >
          <motion.div className="px-3 pb-3">
            <button
              type="button"
              className="flex h-9 w-full items-center justify-center gap-1 rounded-none border border-border bg-noir-surface/95 text-[10px] font-medium uppercase tracking-wider text-foreground backdrop-blur-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickOpen(true);
              }}
            >
              <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Quick view
            </button>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="mt-4 flex flex-1 flex-col">
        {(product.categoryName || product.notes?.top?.[0]) && (
          <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-gold-warm">
            {[product.categoryName, product.notes?.top?.[0]].filter(Boolean).join(" · ")}
          </span>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-[clamp(1.1rem,3vw,1.4rem)] font-normal tracking-wide text-foreground transition-colors hover:text-gold-bright">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 truncate text-xs font-light text-muted-foreground">{product.tagline}</p>
        <div className="mt-2 flex items-center gap-2">
          <StarRating rating={product.rating} />
          <span className="text-[10px] text-[var(--cream-ghost)] font-body">({product.reviewCount})</span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-lg font-medium text-gold-bright">
            {formatPKR(displayPrice)}
          </span>
          {comparePrice && (
            <span className="font-body text-xs text-muted-foreground line-through">
              {formatPKR(comparePrice)}
            </span>
          )}
        </div>
        <button
          ref={bagRef}
          type="button"
          className="product-card-add-nocturne"
          onClick={handleAdd}
        >
          + Add to Bag
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
