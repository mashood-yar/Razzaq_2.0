"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { HighlightsSections } from "@/lib/highlights-products";
import { ProductCard } from "@/components/product/product-card";
import { SectionCta } from "@/components/highlights/section-cta";
import { Button } from "@/components/ui/button";

const RADIUS_CYCLE = [
  "rounded-[2.5rem_1.5rem_2rem_2rem]",
  "rounded-[1.5rem_2.5rem_2rem_2rem]",
  "rounded-[2rem_2rem_1.5rem_2.5rem]",
  "rounded-[2rem_1.5rem_2.5rem_2rem]",
] as const;

type HighlightsPageContentProps = HighlightsSections;

function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-48px" }}
      transition={{ duration: reduceMotion ? 0 : 0.45 }}
      className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl">{title}</h2>
        <p className="mt-2 max-w-lg text-muted-foreground">{description}</p>
      </div>
      <Button asChild variant="outline" className="shrink-0">
        <Link href={href}>{linkLabel}</Link>
      </Button>
    </motion.div>
  );
}

function ProductGrid({
  products,
  highlightLabel,
}: {
  products: HighlightsSections["trending"];
  highlightLabel: "most-selling" | "on-sale" | "premium";
}) {
  if (products.length === 0) {
    return (
      <p className="rounded-[2rem] border border-border/50 bg-noir-surface/40 px-6 py-12 text-center text-muted-foreground">
        No products in this collection yet — check back soon.
      </p>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard
          key={product.id}
          product={product}
          highlightLabel={highlightLabel}
          radiusClass={RADIUS_CYCLE[i % RADIUS_CYCLE.length]}
        />
      ))}
    </div>
  );
}

export function HighlightsPageContent({
  trending,
  onSale,
  premium,
  saleCtaHref,
  saleCtaProductName,
  premiumCtaHref,
  premiumCtaProductName,
}: HighlightsPageContentProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border/50 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        <div className="absolute inset-0" aria-hidden>
          <div className="relative h-full w-full">
            <Image
              src="/images/highlights-hero.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-55"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0A0A08] via-[#0A0A08]/65 to-[#0A0A08]/15"
              aria-hidden
            />
          </div>
        </div>
        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.4 }}
            className="text-xs font-semibold uppercase tracking-[0.35em] text-gold"
          >
            Curated for you
          </motion.p>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.08 }}
            className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl"
          >
            Trending &amp; Premium
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.14 }}
            className="mx-auto mt-4 max-w-2xl text-muted-foreground"
          >
            Discover what&apos;s moving fastest, what&apos;s on offer, and the most luxurious picks
            from the Razzaq Luxe house.
          </motion.p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-16 sm:px-6 lg:space-y-24 lg:px-8 lg:py-20">
        <section aria-labelledby="trending-heading">
          <SectionHeader
            eyebrow="Most selling"
            title="Trending now"
            description="Customer favourites and house signatures — the scents everyone is talking about."
            href="/shop?sort=bestselling"
            linkLabel="View all trending"
          />
          <ProductGrid products={trending} highlightLabel="most-selling" />
        </section>

        <SectionCta
          eyebrow="Limited time"
          title="Products on Sale"
          description={
            saleCtaProductName
              ? `Save on ${saleCtaProductName} and more — tap to explore our best offers.`
              : "Explore seasonal offers across the collection — tap to shop discounted pieces."
          }
          href={saleCtaHref}
          ctaLabel="Shop the sale"
          variant="ocean"
          align="left"
        />

        <section aria-labelledby="sale-heading">
          <SectionHeader
            eyebrow="On sale"
            title="Special offers"
            description="Pieces with compare-at pricing — luxury for less, while stocks last."
            href="/shop?sale=true"
            linkLabel="All sale items"
          />
          <ProductGrid products={onSale} highlightLabel="on-sale" />
        </section>

        <SectionCta
          eyebrow="The finest"
          title="Premium Picks"
          description={
            premiumCtaProductName
              ? `Experience ${premiumCtaProductName} — our most elevated compositions await.`
              : "Our highest-tier fragrances — depth, longevity, and unmistakable presence."
          }
          href={premiumCtaHref}
          ctaLabel="Explore premium"
          variant="gold"
          align="right"
        />

        <section aria-labelledby="premium-heading">
          <SectionHeader
            eyebrow="Premium"
            title="Most premium products"
            description="The pinnacle of the Razzaq Luxe line — crafted for those who demand the extraordinary."
            href="/shop?sort=price-desc"
            linkLabel="View all premium"
          />
          <ProductGrid products={premium} highlightLabel="premium" />
        </section>
      </div>
    </div>
  );
}
