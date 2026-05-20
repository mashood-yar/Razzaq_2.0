"use client";

import Link from "next/link";
import { motion, type MotionValue } from "framer-motion";
import type { LegacyProduct } from "@/lib/products";
import { SafeProductImage } from "@/components/product/safe-product-image";
import { formatPKR, cn } from "@/lib/utils";

type CinematicProductCardProps = {
  product: LegacyProduct;
  scale: MotionValue<number>;
  className?: string;
};

export function CinematicProductCard({ product, scale, className }: CinematicProductCardProps) {
  return (
    <motion.div
      className={cn("group relative flex flex-col", className)}
      style={{ scale, willChange: "transform" }}
    >
      {/* Spotlight under product */}
      <div
        className="absolute -bottom-2 left-1/2 z-0 h-6 w-[85%] -translate-x-1/2 rounded-[50%] opacity-60 blur-md transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(212,168,50,0.35) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      {/* Glass display case */}
      <div
        className="relative flex min-h-[220px] flex-col overflow-hidden rounded-lg border border-[#D4A832]/45 shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(212,168,50,0.15),inset_0_0_24px_rgba(212,168,50,0.06)] transition-all duration-500 group-hover:-translate-y-4 group-hover:border-[#D4A832]/80 group-hover:shadow-[0_24px_56px_rgba(212,168,50,0.2),inset_0_0_32px_rgba(212,168,50,0.12)] sm:min-h-[260px]"
        style={{
          background:
            "linear-gradient(165deg, #16213E 0%, #0F1A2E 45%, #0A1628 100%)",
        }}
      >
        {/* Image — 65% */}
        <motion.div className="relative h-[65%] min-h-[120px] overflow-hidden bg-[#0A1014]/60">
          <SafeProductImage
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes="220px"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A1628]/80 via-transparent to-[rgba(212,168,50,0.06)]"
            aria-hidden
          />
          {product.badge && (
            <span className="absolute left-2 top-2 rounded-full border border-[#D4A832]/40 bg-[#1B262C]/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-[#D4A832] backdrop-blur-sm">
              {product.badge}
            </span>
          )}
        </motion.div>

        {/* Name + price — 35% */}
        <div className="flex h-[35%] flex-col justify-center gap-1.5 border-t border-[#D4A832]/20 px-3 py-2.5">
          <h3 className="font-display text-xs font-semibold leading-tight text-[#F3F4F1] line-clamp-2 sm:text-sm">
            {product.name}
          </h3>
          <p className="font-body text-[11px] font-semibold text-[#D4A832] sm:text-xs">
            {formatPKR(product.price)}
          </p>

          <div className="mt-1 flex gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Link
              href={`/products/${product.slug}`}
              className="flex-1 rounded border border-[#D4A832]/50 px-1.5 py-1 text-center font-body text-[9px] font-semibold uppercase tracking-wider text-[#D4A832] transition-colors hover:bg-[#D4A832]/10 sm:text-[10px]"
            >
              View Item
            </Link>
            <Link
              href={`/products/${product.slug}`}
              className="flex-1 rounded bg-[#D4A832] px-1.5 py-1 text-center font-body text-[9px] font-semibold uppercase tracking-wider text-[#1B262C] transition-colors hover:bg-[#B8961E] sm:text-[10px]"
            >
              Buy Now
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
