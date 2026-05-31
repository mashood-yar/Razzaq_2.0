"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { LegacyProduct as Product } from "@/lib/products";
import { ListingCardImages } from "@/components/product/listing-card-images";
import { cn, formatPKR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/product/star-rating";
import { useCartStore } from "@/stores/cart-store";
import { QuickViewModal } from "@/components/product/quick-view-modal";
import { useFlyToCart } from "@/components/motion/fly-to-cart";
import {
  isLegacyProductOnSale,
  resolveHighlightBadges,
} from "@/lib/product-highlights";
import { HighlightBadge } from "@/components/product/highlight-badge";

const imageVariants = {
  rest: {},
  hover: {},
};

const overlayVariants = {
  rest: { opacity: 0, y: 10 },
  hover: { opacity: 1, y: 0 },
};

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
  radiusClass = "rounded-sm",
  showHighlightBadges = false,
}: {
  product: Product;
  className?: string;
  radiusClass?: string;
  /** Styled sale / premium / new / trending badges — highlights page only */
  showHighlightBadges?: boolean;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const fly = useFlyToCart();
  const bagRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const [quickOpen, setQuickOpen] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const defaultSize = product.sizes[1] ?? product.sizes[0];
  const highlightBadges = showHighlightBadges ? resolveHighlightBadges(product) : {};
  const onSale = isLegacyProductOnSale(product);
  const displayPrice = defaultSize?.price ?? product.price;
  const comparePrice =
    onSale && product.compareAtPrice && product.compareAtPrice > displayPrice
      ? product.compareAtPrice
      : undefined;

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const showOverlay = !canHover || !!reduceMotion;

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultSize) return;
    fly(product.images[0], bagRef.current);
    addItem({
      id: `${product.id}::${defaultSize.label}`,
      productId: product.id,
      name: product.name,
      imageUrl: product.images[0],
      price: displayPrice,
      quantity: 1,
      variantLabel: defaultSize.label,
    });
  }

  const card = (
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
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </Link>
        {!showHighlightBadges && product.badge && (
          <Badge className="absolute left-3 top-3 z-10 rounded-none bg-gold-warm text-[10px] uppercase tracking-[0.18em] text-noir" variant="default">
            {badgeLabel(product.badge)}
          </Badge>
        )}
        {highlightBadges.seal && (
          <HighlightBadge label={highlightBadges.seal} className="highlight-badge-seal-slot" />
        )}
        {highlightBadges.pill && (
          <HighlightBadge label={highlightBadges.pill} className="highlight-badge-pill-slot" />
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
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
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
