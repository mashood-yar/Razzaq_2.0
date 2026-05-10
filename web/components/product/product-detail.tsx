"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Heart, ChevronDown } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useUiStore } from "@/stores/ui-store";
import { formatPKR } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

function AccordionSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-graphite">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-body text-sm font-medium uppercase tracking-widest text-ivory">
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-smoke transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="pb-4 text-sm text-smoke leading-relaxed">{children}</div>}
    </div>
  );
}

export function ProductDetail({ product, related }: { product: DbProduct; related: RelatedProduct[] }) {
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUiStore((s) => s.setCartOpen);

  const images = [...product.product_images].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );
  const variants = product.product_variants ?? [];
  const uniqueColors = [...new Set(variants.map((v) => v.color).filter((c): c is string => Boolean(c)))];
  const uniqueSizes = [...new Set(variants.map((v) => v.size).filter((s): s is string => Boolean(s)))];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(uniqueColors[0] ?? null);
  const [selectedSize, setSelectedSize] = useState(uniqueSizes[0] ?? null);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);

  const currentVariant =
    variants.find((v) => v.color === selectedColor && v.size === selectedSize) ??
    variants.find((v) => v.color === selectedColor) ??
    variants.find((v) => v.size === selectedSize) ??
    (variants.length === 1 ? variants[0] : null);

  const price = currentVariant?.price_override ?? product.price_pkr;
  const inStock = currentVariant
    ? currentVariant.stock_quantity > 0
    : product.stock_quantity > 0;

  const handleAdd = () => {
    if (!inStock) return;
    const variantLabel = [selectedColor, selectedSize].filter(Boolean).join(" / ") || undefined;
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
    setCartOpen(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-charcoal">
            {images[selectedImage]?.url && (
              <Image
                src={images[selectedImage].url}
                alt={images[selectedImage].alt_text ?? product.name}
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            )}
            {product.compare_at_price && product.compare_at_price > price && (
              <span className="absolute left-4 top-4 rounded-full bg-error/90 px-3 py-1 text-xs font-medium uppercase tracking-wider text-ivory">
                Sale
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    selectedImage === idx ? "border-gold" : "border-transparent opacity-60"
                  }`}
                >
                  <Image src={img.url} alt={img.alt_text ?? ""} fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          {product.categories && (
            <Link
              href={`/shop?category=${product.categories.slug}`}
              className="text-xs uppercase tracking-widest text-gold hover:text-gold-light transition-colors"
            >
              {product.categories.name}
            </Link>
          )}
          <h1 className="mt-2 font-display text-4xl text-ivory sm:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-medium text-gold">{formatPKR(price)}</span>
            {product.compare_at_price && product.compare_at_price > price && (
              <span className="text-lg text-smoke line-through">{formatPKR(product.compare_at_price)}</span>
            )}
          </div>

          {uniqueColors.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-smoke">Colour</p>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      selectedColor === color
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-graphite text-smoke hover:border-gold/40"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {uniqueSizes.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-smoke">Size</p>
              <div className="flex flex-wrap gap-2">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      selectedSize === size
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-graphite text-smoke hover:border-gold/40"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-lg border border-graphite">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="p-3 text-smoke hover:text-gold transition-colors"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center tabular-nums text-ivory">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="p-3 text-smoke hover:text-gold transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button size="lg" className="flex-1 min-w-[180px]" onClick={handleAdd} disabled={!inStock}>
              {inStock ? `Add to bag · ${formatPKR(price * qty)}` : "Out of stock"}
            </Button>
            <button
              type="button"
              onClick={() => setWishlisted((w) => !w)}
              className="rounded-lg border border-graphite p-3 hover:border-gold/40 transition-colors"
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`h-5 w-5 ${wishlisted ? "fill-gold text-gold" : "text-smoke"}`} />
            </button>
          </div>

          <p className={`mt-3 text-xs ${inStock ? "text-success" : "text-error"}`}>
            {inStock ? "In stock · Ships in 2–3 business days" : "Currently out of stock"}
          </p>

          <div className="mt-10 border-t border-graphite">
            <AccordionSection title="Description">
              <p>{product.description ?? "No description available."}</p>
            </AccordionSection>
            <AccordionSection title="Delivery & Returns">
              <p>Standard delivery: 3–5 business days within Pakistan · Free on orders over PKR 5,000.</p>
              <p className="mt-2">Express delivery: 1–2 business days via TCS for PKR 500.</p>
              <p className="mt-2">Returns accepted within 7 days on unworn items with original tags.</p>
            </AccordionSection>
            <AccordionSection title="Care Instructions">
              <p>Please refer to the care label on the garment. When in doubt, dry clean only.</p>
            </AccordionSection>
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-graphite px-3 py-1 text-xs text-smoke">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-24">
          <h2 className="font-display text-3xl text-ivory">You may also like</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((rp) => {
              const imgs = [...rp.product_images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
              const img = imgs.find((i) => i.is_primary)?.url ?? imgs[0]?.url;
              return (
                <Link key={rp.id} href={`/products/${rp.slug}`} className="group flex flex-col">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-charcoal">
                    {img && (
                      <Image
                        src={img}
                        alt={rp.name}
                        fill
                        sizes="(max-width:640px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <h3 className="mt-3 font-body text-sm text-ivory group-hover:text-gold transition-colors">
                    {rp.name}
                  </h3>
                  <p className="text-gold text-sm">{formatPKR(rp.price_pkr)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
