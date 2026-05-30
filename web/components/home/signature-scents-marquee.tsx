"use client";

import Link from "next/link";
import type { HomeFeaturedMarqueeProduct } from "@/lib/home-featured-products";

function MarqueeTrack({
  products,
  reverse,
  separator = "dot",
}: {
  products: HomeFeaturedMarqueeProduct[];
  reverse?: boolean;
  separator?: "dot" | "diamond";
}) {
  const sequence = products.flatMap((p) => [
    { type: "link" as const, ...p },
    { type: "dot" as const },
  ]);

  const row = (
    <div className="flex shrink-0 items-center whitespace-nowrap">
      {sequence.map((cell, idx) =>
        cell.type === "dot" ? (
          <span
            key={`d-${idx}`}
            className="mx-5 shrink-0 align-middle text-[0.6rem] text-gold-warm opacity-70 sm:mx-6"
            aria-hidden
          >
            {separator === "diamond" ? "◆" : "·"}
          </span>
        ) : (
          <ProductLink key={`${cell.slug}-${idx}`} product={cell} />
        ),
      )}
    </div>
  );

  return (
    <div className="relative overflow-hidden py-2 motion-reduce:hidden">
      <div
        className={`flex w-max will-change-transform ${
          reverse ? "animate-marquee-row-reverse" : "animate-marquee-row"
        }`}
      >
        <div className="flex">{row}</div>
        <div className="flex" aria-hidden>
          {row}
        </div>
      </div>
    </div>
  );
}

function ProductLink({ product }: { product: HomeFeaturedMarqueeProduct }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative shrink-0 align-middle font-display text-[clamp(1rem,2.5vw,1.3rem)] font-light italic tracking-wide text-text-secondary outline-none transition-[color] duration-300 ease-out hover:z-10 hover:text-gold-warm focus-visible:z-10 focus-visible:text-gold-warm"
    >
      <span>{product.name}</span>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute bottom-[calc(100%+12px)] left-1/2 z-30 w-max max-w-[min(272px,calc(100vw-28px))] -translate-x-1/2 rounded-xl border border-brand-mist/35 bg-charcoal px-4 py-2.5 text-xs font-normal normal-case tracking-normal text-cream opacity-0 shadow-2xl shadow-black/50 ring-1 ring-gold/25 transition-opacity duration-200 ease-out group-hover:visible group-hover:opacity-100 motion-safe:translate-y-2 motion-safe:transition-[opacity,transform] motion-safe:duration-200 motion-safe:group-hover:translate-y-0 md:text-sm md:leading-snug"
      >
        {product.tagline}
      </span>
    </Link>
  );
}

export function SignatureScentsMarquee({
  products = [],
  variant = "full",
}: {
  products?: HomeFeaturedMarqueeProduct[];
  variant?: "full" | "minimal";
}) {
  const productsList = products ?? [];
  if (productsList.length === 0) return null;

  const isMinimal = variant === "minimal";

  return (
    <section
      aria-labelledby={isMinimal ? undefined : "signature-scents-heading"}
      aria-hidden={isMinimal ? true : undefined}
      className="w-full overflow-hidden border-y border-border bg-noir-surface py-5"
    >
      {!isMinimal && (
        <div className="px-5 pb-2 pt-6 md:px-8 md:pt-8">
          <h2 id="signature-scents-heading" className="eyebrow">
            Signature line
          </h2>
          <p className="mt-2 max-w-xl text-sm font-light leading-relaxed text-muted-foreground">
            Our house fragrances — Khan&apos;s Aura, Flora, Sporty, and Legend. Boutique in{" "}
            <strong className="font-medium text-foreground">Quetta, Pakistan</strong>. Hover for a
            preview; click to shop.
          </p>
        </div>
      )}

      <div className={isMinimal ? "py-1" : "pb-10 md:pb-12"}>
        <div
          className={
            isMinimal
              ? "motion-reduce:hidden"
              : "flex flex-col gap-7 md:gap-9 motion-reduce:hidden"
          }
        >
          <MarqueeTrack products={productsList} separator={isMinimal ? "diamond" : "dot"} />
          {!isMinimal && <MarqueeTrack products={productsList} reverse separator="dot" />}
        </div>

        <div className="hidden flex-wrap items-center justify-center gap-x-3 gap-y-4 px-6 pb-10 text-center motion-reduce:flex md:gap-x-6">
          {productsList.map((p, i) => (
            <span key={p.slug} className="flex items-center gap-x-3 md:gap-x-6">
              {i > 0 ? (
                <span className="select-none text-muted-foreground" aria-hidden>
                  ·
                </span>
              ) : null}
              <ProductLink product={p} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
