"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Heart, ChevronDown, ArrowLeft, Star, ShieldCheck, Truck, ArrowLeftRight } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { formatPKR, cn } from "@/lib/utils";
import { useFlyToCart } from "@/components/motion/fly-to-cart";
import { ListingCardImages } from "@/components/product/listing-card-images";
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

interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price_pkr: number;
  compare_at_price?: number | null;
  product_images: { url: string; is_primary?: boolean; sort_order?: number }[];
}

export function ProductDetail({ product, related }: { product: DbProduct; related: RelatedProduct[] }) {
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const fly = useFlyToCart();
  const galleryRef = useRef<HTMLDivElement>(null);

  const images = [...product.product_images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const variants = product.product_variants ?? [];
  const uniqueSizes = [...new Set(variants.map((v) => v.size).filter((s): s is string => Boolean(s)))];

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

  const handleAdd = () => {
    if (!inStock) return;
    const variantLabel = selectedSize || undefined;
    const thumb = images[selectedImage]?.url ?? images[0]?.url ?? "";
    
    // Optistic addition animation for mobile button
    setAdded(true);
    setTimeout(() => setAdded(false), 600);
    
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
    
    // On mobile, just update cart count/drawer implicitly, or open it
    if (window.innerWidth >= 1024) {
      setCartOpen(true);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-0 lg:px-24 pt-0 lg:pt-32 pb-[120px] lg:pb-24 text-[var(--cream-bone)] relative">
      <div className="grid gap-0 lg:gap-20 lg:grid-cols-2">
        
        {/* 1. IMAGE GALLERY */}
        <div className="w-full relative bg-[var(--bg-dusk)]">
          <div ref={galleryRef} className="relative aspect-[1/1.1] lg:aspect-[3/4] w-full overflow-hidden flex snap-x snap-mandatory overflow-x-auto hide-scrollbar">
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
                <Image src={PLACEHOLDER_PRODUCT_IMAGE} alt="Placeholder" fill className="object-cover" />
              </div>
            )}
            
            <div className="absolute top-4 right-4 z-10 bg-[var(--bg-obsidian)]/60 backdrop-blur px-2 py-1 rounded-[2px] font-body text-[11px] text-[var(--cream-muted)]">
              1 / {images.length || 1}
            </div>
            
            {/* Native Scroll Dots for mobile */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {images.map((_, i) => (
                  <div key={i} className={`w-[5px] h-[5px] rounded-full ${i === 0 ? 'bg-[var(--gold-warm)]' : 'bg-[var(--cream-ghost)]/40'}`} />
                ))}
              </div>
            )}
          </div>
          <button
            className="absolute top-4 left-4 z-10 lg:hidden w-[40px] h-[40px] bg-[var(--bg-obsidian)]/60 backdrop-blur rounded-full flex items-center justify-center text-[var(--cream-bone)]"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        {/* 2. PRODUCT INFO */}
        <div className="px-5 py-6 lg:px-0 lg:py-0 flex flex-col">
          {product.categories && (
            <span className="font-body font-semibold text-[10px] tracking-[0.2em] text-[var(--bg-void)] bg-[var(--gold-warm)] rounded-full px-3 py-1 w-fit mb-4">
              {product.categories.name}
            </span>
          )}
          
          <h1 className="font-display font-semibold text-[2rem] lg:text-[3rem] text-[var(--cream-bone)] leading-none mb-1">
            {product.name}
          </h1>
          <p className="font-body italic font-light text-[15px] text-[var(--cream-muted)] mb-3">
            A cinematic experience
          </p>
          
          <div className="flex gap-1 mb-6">
            {[1,2,3,4,5].map(s => <Star key={s} className="w-[13px] h-[13px] text-[var(--gold-earth)] fill-[var(--gold-earth)]" />)}
            <span className="font-body font-normal text-[13px] text-[var(--cream-ghost)] ml-2">(124)</span>
          </div>

          <div className="w-full h-[1px] bg-[var(--border-fine)] mb-6" />

          <div className="flex items-center gap-2 mb-8">
            <span className="font-body font-bold text-[1.5rem] lg:text-[2rem] text-[var(--gold-warm)]">{formatPKR(price)}</span>
            {product.compare_at_price && product.compare_at_price > price && (
              <span className="font-body font-light text-[1rem] text-[var(--cream-ghost)] line-through ml-2">{formatPKR(product.compare_at_price)}</span>
            )}
          </div>

          {/* 3. SIZE SELECTOR */}
          {uniqueSizes.length > 0 && (
            <div className="mb-8">
              <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "h-[44px] min-w-[72px] px-4 font-body font-medium text-[13px] rounded-full flex items-center justify-center transition-colors border",
                      selectedSize === size 
                        ? "bg-[var(--gold-warm)] border-[var(--gold-warm)] text-[var(--bg-void)]" 
                        : "bg-[var(--bg-dusk)] border-[var(--border-mid)] text-[var(--cream-warm)] hover:border-[var(--gold-warm)]/50"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity on Desktop */}
          <div className="hidden lg:flex items-center gap-4 mb-8">
            <div className="flex h-[44px] items-center rounded-[2px] border border-[var(--border-mid)] bg-[var(--bg-dusk)]">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 text-[var(--cream-muted)] hover:text-[var(--gold-warm)]"><Minus className="w-4 h-4" /></button>
              <span className="w-10 text-center font-body text-[14px]">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="p-3 text-[var(--cream-muted)] hover:text-[var(--gold-warm)]"><Plus className="w-4 h-4" /></button>
            </div>
            <button className="flex h-[44px] w-[44px] items-center justify-center rounded-[2px] border border-[var(--border-mid)] bg-[var(--bg-dusk)] hover:border-[var(--gold-warm)] transition-colors text-[var(--cream-muted)]" onClick={() => setWishlisted(!wishlisted)}>
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-[var(--rose-dust)] text-[var(--rose-dust)]' : ''}`} />
            </button>
            <button className="h-[44px] px-8 bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-semibold text-[11px] tracking-[0.2em] rounded-[2px]" onClick={handleAdd} disabled={!inStock}>
              ADD TO BAG
            </button>
          </div>

          {/* 5. FRAGRANCE NOTES PYRAMID (Accordion) */}
          <div className="mb-8 border-y border-[var(--border-fine)] overflow-hidden py-2">
            <button 
              className="w-full flex items-center justify-between p-5"
              onClick={() => setNotesExpanded(!notesExpanded)}
            >
              <span className="font-body font-medium text-[12px] tracking-[0.2em] text-[var(--cream-muted)] uppercase">SEE FRAGRANCE NOTES</span>
              <ChevronDown className={cn("w-4 h-4 text-[var(--cream-muted)] transition-transform", notesExpanded && "rotate-180")} />
            </button>
            
            <AnimatePresence>
              {notesExpanded && (
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 pt-0 flex flex-col gap-4 border-t border-[var(--border-fine)] mt-2">
                    <div className="grid grid-cols-[100px_1fr] items-start pt-4">
                      <span className="font-body font-semibold text-[10px] text-[var(--cream-muted)] uppercase">Top Notes</span>
                      <div className="flex flex-wrap gap-3 font-body font-light text-[13px] text-[var(--cream-warm)]">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-earth)]" />Bergamot</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-earth)]" />Citrus</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-start border-t border-[var(--border-fine)] pt-4">
                      <span className="font-body font-semibold text-[10px] text-[var(--cream-muted)] uppercase">Heart Notes</span>
                      <div className="flex flex-wrap gap-3 font-body font-light text-[13px] text-[var(--cream-warm)]">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-earth)]" />Rose</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-earth)]" />Oud</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-earth)]" />Jasmine</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-[100px_1fr] items-start border-t border-[var(--border-fine)] pt-4">
                      <span className="font-body font-semibold text-[10px] text-[var(--cream-muted)] uppercase">Base Notes</span>
                      <div className="flex flex-wrap gap-3 font-body font-light text-[13px] text-[var(--cream-warm)]">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-earth)]" />Musk</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-earth)]" />Amber</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 6. PRODUCT STORY */}
          <div className="mb-10">
            <h2 className="font-display italic text-[1.5rem] text-[var(--cream-bone)] mb-4">The Story</h2>
            <div className="font-body font-light text-[15px] text-[var(--cream-warm)] leading-[1.85] relative">
              <span className="float-left font-display text-[3.5rem] text-[var(--gold-warm)] leading-[0.8] mr-2 mt-1">
                {(product.description || "T")[0]}
              </span>
              {product.description || "he art of perfumery reaches its zenith in this meticulously crafted formulation. A journey that begins with bright, effervescent top notes before settling into a deeply complex heart that speaks of ancient traditions and modern luxury."}
              <br /><br />
              <button className="text-[var(--gold-warm)] font-medium text-[13px] hover:underline">Read the full story →</button>
            </div>
          </div>

          {/* 7. SOCIAL PROOF (Restyled) */}
          <div className="border-t border-[var(--border-fine)] pt-8 flex flex-col gap-5 mb-10">
            <div className="flex items-center gap-3 font-body font-normal text-[13px] text-[var(--cream-warm)]">
              <ShieldCheck className="w-5 h-5 text-[var(--gold-warm)]" /> Guaranteed Authentic
            </div>
            <div className="flex items-center gap-3 font-body font-normal text-[13px] text-[var(--cream-warm)]">
              <Truck className="w-5 h-5 text-[var(--gold-warm)]" /> Free Nationwide Delivery
            </div>
            <div className="flex items-center gap-3 font-body font-normal text-[13px] text-[var(--cream-warm)]">
              <ArrowLeftRight className="w-5 h-5 text-[var(--gold-warm)]" /> 7-Day Returns
            </div>
          </div>

        </div>
      </div>

      {/* 4. STICKY ADD-TO-CART BAR (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-[calc(68px+env(safe-area-inset-bottom))] bg-[rgba(8,7,5,0.96)] backdrop-blur-xl border-t border-[var(--border-fine)] px-4 flex items-center justify-between pb-[env(safe-area-inset-bottom)] z-40">
        <div className="flex flex-col">
          <span className="font-body font-bold text-[1.375rem] text-[var(--gold-warm)] leading-none">{formatPKR(price)}</span>
        </div>
        <button 
          onClick={handleAdd}
          disabled={!inStock}
          className="flex-1 max-w-[200px] h-[48px] bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-semibold text-[11px] tracking-[0.2em] rounded-[2px] transition-colors"
        >
          {added ? "✓ ADDED" : "ADD TO CART"}
        </button>
      </div>

    </div>
  );
}
