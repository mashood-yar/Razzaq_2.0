"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Heart,
  ChevronDown,
  ArrowLeft,
  Star,
  ShieldCheck,
  Truck,
  ArrowLeftRight,
  Check,
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { formatPKR, cn } from "@/lib/utils";
import { useFlyToCart } from "@/components/motion/fly-to-cart";
import { PLACEHOLDER_PRODUCT_IMAGE } from "@/lib/catalog/map-db-product";

// Types remain unchanged to respect backend integrity
interface ProductImage {
  id: string;
  url: string;
  alt_text?: string;
  is_primary?: boolean;
  sort_order?: number;
}

interface ProductVariant {
  id: string;
  color?: string;
  size?: string;
  sku?: string;
  price_override?: number | null;
  stock_quantity: number;
}

export interface DbProduct {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price_pkr: number;
  compare_at_price?: number | null;
  stock_quantity: number;
  tags?: string[] | null;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  categories?: { name: string; slug: string } | null;
}

// ─── UX Law: Doherty Threshold — sub-400ms feedback for every action ─────────
const springTransition = { type: "spring", stiffness: 380, damping: 30 } as const;
const revealTransition = { duration: 0.45, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] as [number, number, number, number] };

export function ProductDetail({ product }: { product: DbProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const fly = useFlyToCart();
  const galleryRef = useRef<HTMLDivElement>(null);

  const images = [...product.product_images].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const variants = product.product_variants ?? [];
  const uniqueSizes = [
    ...new Set(
      variants.map((v) => v.size).filter((s): s is string => Boolean(s))
    ),
  ];

  // ─── State ────────────────────────────────────────────────────────────────
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(uniqueSizes[0] ?? null);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [added, setAdded] = useState(false);

  const currentVariant =
    variants.find((v) => v.size === selectedSize) ??
    (variants.length === 1 ? variants[0] : null);

  const price = currentVariant?.price_override ?? product.price_pkr;
  const inStock = currentVariant
    ? currentVariant.stock_quantity > 0
    : product.stock_quantity > 0;

  // ─── Gallery scroll sync — tracks active dot (Law of Proximity) ───────────
  const handleGalleryScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setSelectedImage(idx);
    },
    []
  );

  // ─── UX Law: Doherty — optimistic "ADDED" state within 100ms ─────────────
  const handleAdd = () => {
    if (!inStock) return;
    const variantLabel = selectedSize || undefined;
    const thumb = images[selectedImage]?.url ?? images[0]?.url ?? "";

    setAdded(true);
    setTimeout(() => setAdded(false), 1800);

    if (thumb && window.innerWidth >= 1024) fly(thumb, galleryRef.current);

    addItem({
      id: currentVariant?.id ?? product.id,
      productId: product.id,
      variantId: currentVariant?.id,
      name: product.name,
      variantLabel,
      imageUrl: images[0]?.url ?? "",
      price,
      quantity: qty,
    });

    if (window.innerWidth >= 1024) {
      setCartOpen(true);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-0 lg:px-24 pt-0 lg:pt-32 pb-[120px] lg:pb-24 text-[var(--cream-bone)] relative">
      <div className="grid gap-0 lg:gap-24 lg:grid-cols-2">

        {/* ── 1. IMAGE GALLERY ─────────────────────────────────────────────── */}
        {/* UX Law: Aesthetic-Usability — premium sticky gallery with active dot sync */}
        <div className="w-full relative bg-[var(--bg-dusk)] lg:sticky lg:top-24 lg:self-start">
          <div
            ref={galleryRef}
            onScroll={handleGalleryScroll}
            className="relative aspect-[1/1.1] lg:aspect-[3/4] w-full overflow-hidden flex snap-x snap-mandatory overflow-x-auto hide-scrollbar"
          >
            {images.length > 0 ? (
              images.map((img, idx) => (
                <div key={idx} className="min-w-full relative snap-center">
                  <Image
                    src={img.url}
                    alt={img.alt_text ?? product.name}
                    fill
                    sizes="(max-width:1024px) 100vw, 50vw"
                    className="object-cover"
                    priority={idx === 0}
                  />
                </div>
              ))
            ) : (
              <div className="min-w-full relative snap-center">
                <Image
                  src={PLACEHOLDER_PRODUCT_IMAGE}
                  alt="Placeholder"
                  fill
                  className="object-cover"
                />
              </div>
            )}

            {/* Image counter badge */}
            <div className="absolute top-4 right-4 z-10 bg-[var(--bg-obsidian)]/70 backdrop-blur-sm px-3 py-1.5 rounded-full font-body text-[11px] text-[var(--cream-muted)] tracking-[0.15em]">
              {selectedImage + 1} / {images.length || 1}
            </div>

            {/* Back button — Fitts's Law: large 44px target, top-left thumb zone */}
            <button
              className="absolute top-4 left-4 z-10 lg:hidden w-[44px] h-[44px] bg-[var(--bg-obsidian)]/70 backdrop-blur-sm rounded-full flex items-center justify-center text-[var(--cream-bone)] transition-all active:scale-95"
              onClick={() => window.history.back()}
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* ── Active-synced dot indicators (Law of Proximity + Aesthetic-Usability) */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {images.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width: i === selectedImage ? 20 : 5,
                    backgroundColor:
                      i === selectedImage
                        ? "var(--gold-warm)"
                        : "rgba(245,240,232,0.3)",
                  }}
                  transition={springTransition}
                  className="h-[5px] rounded-full"
                />
              ))}
            </div>
          )}
        </div>

        {/* ── 2. PRODUCT INFO ───────────────────────────────────────────────── */}
        <div className="px-5 py-8 lg:px-0 lg:py-0 flex flex-col">

          {/* Category badge */}
          {product.categories && (
            <motion.span
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={revealTransition}
              className="font-body font-semibold text-[10px] tracking-[0.3em] text-[var(--gold-warm)] uppercase mb-3 block"
            >
              {product.categories.name}
            </motion.span>
          )}

          {/* Product Name — Aesthetic-Usability: large, confident display type */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...revealTransition, delay: 0.05 }}
            className="font-display font-semibold text-[2.25rem] lg:text-[3.25rem] text-[var(--cream-bone)] leading-[1.05] mb-2 tracking-tight"
          >
            {product.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...revealTransition, delay: 0.1 }}
            className="font-body italic font-light text-[15px] text-[var(--cream-muted)] mb-4"
          >
            A cinematic experience
          </motion.p>

          {/* Stars — Law of Proximity: grouped tightly with review count */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="w-[13px] h-[13px] text-[var(--gold-earth)] fill-[var(--gold-earth)]"
                />
              ))}
            </div>
            <span className="font-body font-light text-[13px] text-[var(--cream-ghost)]">
              (124 reviews)
            </span>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-[var(--border-fine)] mb-6" />

          {/* Price — dominant gold, compare-at clearly struck through */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...revealTransition, delay: 0.12 }}
            className="flex items-baseline gap-3 mb-8"
          >
            <span className="font-body font-bold text-[1.875rem] lg:text-[2.25rem] text-[var(--gold-warm)] leading-none">
              {formatPKR(price)}
            </span>
            {product.compare_at_price && product.compare_at_price > price && (
              <span className="font-body font-light text-[1.0625rem] text-[var(--cream-ghost)] line-through">
                {formatPKR(product.compare_at_price)}
              </span>
            )}
            {product.compare_at_price && product.compare_at_price > price && (
              <span className="text-[10px] font-body font-semibold tracking-[0.15em] text-[var(--sage)] bg-[var(--sage)]/10 border border-[var(--sage)]/20 px-2 py-0.5 rounded-full">
                SAVE {Math.round(((product.compare_at_price - price) / product.compare_at_price) * 100)}%
              </span>
            )}
          </motion.div>

          {/* ── SIZE SELECTOR — Hick's Law: pills reduce decision complexity */}
          {uniqueSizes.length > 0 && (
            <div className="mb-8">
              <p className="font-body font-semibold text-[10px] tracking-[0.3em] text-[var(--cream-ghost)] uppercase mb-3">
                SIZE / VOLUME
              </p>
              <div className="flex gap-2 flex-wrap">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "relative h-[44px] min-w-[80px] px-5 font-body font-medium text-[13px] rounded-full transition-all duration-200 border overflow-hidden",
                      selectedSize === size
                        ? "bg-[var(--gold-warm)] border-[var(--gold-warm)] text-[var(--bg-void)] shadow-[0_0_20px_rgba(201,160,80,0.25)]"
                        : "bg-[var(--bg-dusk)] border-[var(--border-mid)] text-[var(--cream-warm)] hover:border-[var(--gold-warm)]/60"
                    )}
                  >
                    {/* Active pulse ring — Doherty: immediate visual feedback */}
                    {selectedSize === size && (
                      <motion.span
                        layoutId="size-indicator"
                        className="absolute inset-0 rounded-full bg-[var(--gold-warm)]"
                        style={{ zIndex: -1 }}
                        transition={springTransition}
                      />
                    )}
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── DESKTOP QTY + ADD — Fitts's Law: large, reachable targets */}
          <div className="hidden lg:flex items-center gap-3 mb-8">
            {/* Quantity stepper */}
            <div className="flex h-[52px] items-center rounded-full border border-[var(--border-mid)] bg-[var(--bg-dusk)] overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-[52px] h-full flex items-center justify-center text-[var(--cream-muted)] hover:text-[var(--gold-warm)] transition-colors active:bg-[var(--bg-stone)]"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-body font-semibold text-[15px] text-[var(--cream-bone)]">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-[52px] h-full flex items-center justify-center text-[var(--cream-muted)] hover:text-[var(--gold-warm)] transition-colors active:bg-[var(--bg-stone)]"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Wishlist — 52px square Fitts target */}
            <button
              className={cn(
                "flex h-[52px] w-[52px] items-center justify-center rounded-full border transition-all duration-200",
                wishlisted
                  ? "border-[var(--rose-dust)] bg-[var(--rose-dust)]/10 text-[var(--rose-dust)]"
                  : "border-[var(--border-mid)] bg-[var(--bg-dusk)] text-[var(--cream-muted)] hover:border-[var(--rose-dust)]/60 hover:text-[var(--rose-dust)]"
              )}
              onClick={() => setWishlisted(!wishlisted)}
              aria-label="Add to wishlist"
            >
              <Heart className={cn("w-5 h-5 transition-all", wishlisted && "fill-current")} />
            </button>

            {/* Add to Bag CTA */}
            <motion.button
              className={cn(
                "flex-1 h-[52px] font-body font-semibold text-[11px] tracking-[0.25em] rounded-full transition-all duration-200 flex items-center justify-center gap-2",
                added
                  ? "bg-[var(--sage)] text-white"
                  : inStock
                  ? "bg-[var(--gold-warm)] text-[var(--bg-void)] hover:bg-[var(--gold-bright)] active:scale-[0.98] shadow-[0_0_30px_rgba(201,160,80,0.2)] hover:shadow-[0_0_40px_rgba(201,160,80,0.35)]"
                  : "bg-[var(--bg-dusk)] text-[var(--cream-ghost)] border border-[var(--border-mid)] cursor-not-allowed"
              )}
              onClick={handleAdd}
              disabled={!inStock}
              whileTap={inStock ? { scale: 0.97 } : {}}
            >
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" /> ADDED TO BAG
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    {inStock ? "ADD TO BAG" : "OUT OF STOCK"}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* ── FRAGRANCE NOTES — Hick's Law: accordion prevents info overload */}
          <div className="mb-6 rounded-[4px] border border-[var(--border-fine)] overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-[var(--bg-dusk)]/50 transition-colors"
              onClick={() => setNotesExpanded(!notesExpanded)}
              aria-expanded={notesExpanded}
            >
              <span className="font-body font-semibold text-[11px] tracking-[0.25em] text-[var(--cream-warm)] uppercase">
                Fragrance Notes
              </span>
              <motion.div animate={{ rotate: notesExpanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown className="w-4 h-4 text-[var(--cream-muted)]" />
              </motion.div>
            </button>

            <AnimatePresence initial={false}>
              {notesExpanded && (
                <motion.div
                  key="notes"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] as [number, number, number, number] }}
                  className="overflow-hidden"
                >
                  {/* ── Visual pyramid — Law of Similarity: dot color codes layers */}
                  <div className="px-5 pb-5 pt-2 flex flex-col gap-0">
                    {[
                      {
                        label: "TOP",
                        timing: "Opens for 15 min",
                        notes: ["Bergamot", "Citrus"],
                        dotColor: "var(--gold-bright)",
                        opacity: "opacity-100",
                      },
                      {
                        label: "HEART",
                        timing: "Blooms for 2–4 hrs",
                        notes: ["Rose", "Oud", "Jasmine"],
                        dotColor: "var(--gold-warm)",
                        opacity: "opacity-80",
                      },
                      {
                        label: "BASE",
                        timing: "Lingers 6–8 hrs",
                        notes: ["Musk", "Amber"],
                        dotColor: "var(--gold-earth)",
                        opacity: "opacity-60",
                      },
                    ].map((layer, i) => (
                      <div
                        key={layer.label}
                        className={cn(
                          "flex gap-4 py-4 items-start",
                          i < 2 && "border-b border-[var(--border-fine)]"
                        )}
                      >
                        <div className="w-[56px] shrink-0 pt-0.5">
                          <span className="font-body font-bold text-[9px] tracking-[0.3em] text-[var(--cream-ghost)] block">
                            {layer.label}
                          </span>
                          <span className="font-body font-light text-[10px] text-[var(--cream-ghost)]/60 leading-tight block mt-1">
                            {layer.timing}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {layer.notes.map((note) => (
                            <span
                              key={note}
                              className="flex items-center gap-1.5 font-body font-light text-[13px] text-[var(--cream-warm)] bg-[var(--bg-void)]/60 border border-[var(--border-fine)] px-3 py-1 rounded-full"
                            >
                              <span
                                className={cn("w-1.5 h-1.5 rounded-full shrink-0", layer.opacity)}
                                style={{ backgroundColor: layer.dotColor }}
                              />
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── PRODUCT STORY — Aesthetic-Usability: drop-cap, relaxed leading */}
          {(product.description) && (
            <div className="mb-8 rounded-[4px] border border-[var(--border-fine)] p-5 bg-[var(--bg-void)]/30">
              <h2 className="font-display italic text-[1.25rem] text-[var(--cream-bone)] mb-3">
                The Story
              </h2>
              <p className="font-body font-light text-[14px] text-[var(--cream-warm)] leading-[1.9]">
                {product.description}
              </p>
            </div>
          )}

          {/* ── TRUST BADGES — Law of Proximity: grouped in a single card */}
          {/* UX Law: Jakob's Law — familiar trust signals in expected format */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: ShieldCheck, label: "Authentic", sub: "100% genuine" },
              { icon: Truck, label: "Free Delivery", sub: "Orders 5K+" },
              { icon: ArrowLeftRight, label: "7-Day Returns", sub: "Hassle free" },
            ].map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-2 p-3 rounded-[4px] border border-[var(--border-fine)] bg-[var(--bg-dusk)]/50"
              >
                <Icon className="w-5 h-5 text-[var(--gold-warm)]" />
                <div>
                  <p className="font-body font-semibold text-[11px] text-[var(--cream-bone)] leading-tight">
                    {label}
                  </p>
                  <p className="font-body font-light text-[10px] text-[var(--cream-muted)] leading-tight mt-0.5">
                    {sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── STICKY MOBILE ADD-TO-CART — Fitts's Law: thumb-zone, full width */}
      {/* UX Law: Jakob's Law — matches e-commerce convention */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[rgba(8,7,5,0.97)] backdrop-blur-xl border-t border-[var(--border-fine)] px-4 pt-3 flex items-center gap-3 pb-[calc(12px+env(safe-area-inset-bottom))] z-40">
        <div className="flex flex-col min-w-0">
          <span className="font-body font-bold text-[1.375rem] text-[var(--gold-warm)] leading-none">
            {formatPKR(price)}
          </span>
          {product.compare_at_price && product.compare_at_price > price && (
            <span className="font-body font-light text-[12px] text-[var(--cream-ghost)] line-through leading-tight mt-0.5">
              {formatPKR(product.compare_at_price)}
            </span>
          )}
        </div>

        <motion.button
          onClick={handleAdd}
          disabled={!inStock}
          whileTap={inStock ? { scale: 0.97 } : {}}
          className={cn(
            "flex-1 h-[52px] font-body font-semibold text-[11px] tracking-[0.22em] rounded-full transition-all duration-200 flex items-center justify-center gap-2",
            added
              ? "bg-[var(--sage)] text-white"
              : inStock
              ? "bg-[var(--gold-warm)] text-[var(--bg-void)] shadow-[0_0_24px_rgba(201,160,80,0.3)]"
              : "bg-[var(--bg-dusk)] text-[var(--cream-ghost)] border border-[var(--border-mid)]"
          )}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> ADDED!
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {inStock ? "ADD TO CART" : "OUT OF STOCK"}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Wishlist — always visible on mobile */}
        <button
          onClick={() => setWishlisted(!wishlisted)}
          className={cn(
            "w-[52px] h-[52px] flex items-center justify-center rounded-full border flex-shrink-0 transition-all duration-200",
            wishlisted
              ? "border-[var(--rose-dust)] bg-[var(--rose-dust)]/10 text-[var(--rose-dust)]"
              : "border-[var(--border-mid)] text-[var(--cream-muted)]"
          )}
          aria-label="Add to wishlist"
        >
          <Heart className={cn("w-5 h-5 transition-all", wishlisted && "fill-current")} />
        </button>
      </div>
    </div>
  );
}
