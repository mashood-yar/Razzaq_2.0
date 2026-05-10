"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Eye } from "lucide-react";
import { motion } from "framer-motion";
import type { LegacyProduct as Product } from "@/lib/products";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/product/star-rating";
import { useCartStore } from "@/stores/cart-store";
import { QuickViewModal } from "@/components/product/quick-view-modal";

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
  const [quickOpen, setQuickOpen] = useState(false);
  const defaultSize = product.sizes[1] ?? product.sizes[0];

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!defaultSize) return;
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

  return (
    <>
      <motion.article
        layout
        className={cn("group relative flex flex-col", className)}
      >
        <Link
          href={`/shop/${product.slug}`}
          className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted"
        >
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
          {product.badge && (
            <Badge className="absolute left-3 top-3 border-gold/30 bg-black/50 text-[10px]">
              {badgeLabel(product.badge)}
            </Badge>
          )}
          <div className="absolute inset-x-0 bottom-0 flex translate-y-2 gap-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="flex-1 gap-1 text-xs"
              onClick={(e) => {
                e.preventDefault();
                setQuickOpen(true);
              }}
            >
              <Eye className="h-3.5 w-3.5" />
              Quick view
            </Button>
          </div>
        </Link>

        <div className="mt-4 flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/shop/${product.slug}`}>
              <h3 className="font-serif text-lg leading-tight transition-colors hover:text-gold">
                {product.name}
              </h3>
            </Link>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 text-gold hover:bg-gold/10"
              aria-label={`Add ${product.name} to cart`}
              onClick={handleAdd}
            >
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {product.tagline}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <StarRating rating={product.rating} />
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>
          <p className="mt-3 font-medium text-gold">
            ${defaultSize?.price ?? product.price}
            {product.compareAtPrice && (
              <span className="ml-2 text-sm text-muted-foreground line-through">
                ${product.compareAtPrice}
              </span>
            )}
          </p>
        </div>
      </motion.article>

      <QuickViewModal
        product={product}
        open={quickOpen}
        onOpenChange={setQuickOpen}
      />
    </>
  );
}
