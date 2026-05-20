"use client";

import Link from "next/link";
import { HOUSE_PRODUCTS } from "@/lib/house-products";

function MarqueeTrack({ reverse }: { reverse?: boolean }) {
  const sequence = HOUSE_PRODUCTS.flatMap((p) => [
    { type: "link" as const, ...p },
    { type: "dot" as const },
  ]);

  const row = (
    <div className="flex shrink-0 items-center whitespace-nowrap">
      {sequence.map((cell, idx) =>
        cell.type === "dot" ? (
          <span
            key={`d-${idx}`}
            className="mx-6 shrink-0 align-middle text-2xl text-muted-foreground sm:mx-10 sm:text-[1.65rem]"
            aria-hidden
          >
            ·
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

function ProductLink({
  product,
}: {
  product: (typeof HOUSE_PRODUCTS)[number];
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative shrink-0 align-middle font-body text-[clamp(1.65rem,4.8vw,2.75rem)] font-normal tracking-tight text-foreground outline-none transition-[transform,color] duration-300 ease-out hover:z-10 hover:text-gold focus-visible:z-10 focus-visible:text-gold motion-safe:hover:scale-105 motion-reduce:hover:scale-100"
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

export function SignatureScentsMarquee() {
  return (
    <section
      aria-labelledby="signature-scents-heading"
      className="w-full overflow-hidden rounded-2xl border border-brand-mist/30 bg-graphite md:rounded-3xl"
    >
      <div className="px-6 pb-6 pt-10 md:px-12 md:pb-8 md:pt-14">
        <h2
          id="signature-scents-heading"
          className="font-body text-[11px] font-medium uppercase tracking-[0.35em] text-gold-muted"
        >
          Signature line
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Our house fragrances — Sporty, Habibi, Flourine, and Khan&apos;s Aura. Boutique in{" "}
          <strong className="font-medium text-foreground">Quetta, Pakistan</strong>. Hover for a preview; click to shop.
        </p>
      </div>

      <div className="pb-12 md:pb-16">
        <div className="flex flex-col gap-7 md:gap-9 motion-reduce:hidden">
          <MarqueeTrack />
          <MarqueeTrack reverse />
        </div>

        <div className="hidden flex-wrap items-center justify-center gap-x-3 gap-y-4 px-6 pb-10 text-center motion-reduce:flex md:gap-x-6">
          {HOUSE_PRODUCTS.map((p, i) => (
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
