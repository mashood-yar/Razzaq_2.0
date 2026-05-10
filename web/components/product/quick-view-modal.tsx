"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/product/star-rating";
import { NotePyramid } from "@/components/product/note-pyramid";
import type { LegacyProduct as Product } from "@/lib/products";
import { useCartStore } from "@/stores/cart-store";

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
  const defaultSize = product.sizes[1] ?? product.sizes[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto gap-6 border-white/10 bg-card p-6 sm:p-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-muted">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
          <div>
            <DialogHeader className="text-left">
              <DialogTitle className="font-serif text-3xl">{product.name}</DialogTitle>
            </DialogHeader>
            <p className="mt-2 text-muted-foreground">{product.tagline}</p>
            <div className="mt-4 flex items-center gap-3">
              <StarRating rating={product.rating} />
              <span className="text-sm text-muted-foreground">
                {product.reviewCount} reviews
              </span>
            </div>
            <p className="mt-6 text-2xl font-medium text-gold">
              ${defaultSize?.price ?? product.price}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                · {defaultSize?.label ?? "100 ml"}
              </span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                onClick={() => {
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
                  onOpenChange(false);
                }}
              >
                Add to bag
              </Button>
              <Button variant="secondary" asChild>
                <Link href={`/shop/${product.slug}`} onClick={() => onOpenChange(false)}>
                  Full details
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <NotePyramid product={product} />
      </DialogContent>
    </Dialog>
  );
}
