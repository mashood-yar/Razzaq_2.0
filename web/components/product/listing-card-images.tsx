"use client";

import { cn } from "@/lib/utils";
import { SafeProductImage } from "@/components/product/safe-product-image";

/** Dual-image listing thumb: secondary fades in on hover when distinct from primary (listing cards / grids). */
export function ListingCardImages({
  primarySrc,
  secondarySrc,
  alt,
  sizes,
  className,
}: {
  primarySrc: string;
  secondarySrc?: string | null;
  alt: string;
  sizes: string;
  className?: string;
}) {
  const secondary =
    secondarySrc && secondarySrc.trim() !== primarySrc.trim() ? secondarySrc : null;

  return (
    <div className={cn("relative h-full w-full overflow-hidden bg-charcoal animate-pulse", className)}>
      <div className="absolute inset-0 motion-safe:transition-transform motion-safe:duration-700 motion-safe:group-hover:scale-105">
        <SafeProductImage
          src={primarySrc}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
        {secondary ? (
          <SafeProductImage
            src={secondary}
            alt=""
            fill
            sizes={sizes}
            className="absolute inset-0 object-cover opacity-0 motion-safe:transition-opacity motion-safe:duration-500 motion-safe:group-hover:opacity-100"
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}
