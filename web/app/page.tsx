import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { fetchLegacyProductsForHomeBestSellers } from "@/lib/catalog/fetch-catalog";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { GoldBrandText } from "@/components/brand/gold-brand-text";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { HomeMarqueeSkeleton } from "@/components/home/home-marquee-skeleton";
import { SectionCardSkeleton } from "@/components/home/section-card-skeleton";
import { FeaturedCollectionsConveyor } from "@/components/home/featured-collections-conveyor";

const SignatureScentsMarquee = dynamic(
  () =>
    import("@/components/home/signature-scents-marquee").then((m) => ({
      default: m.SignatureScentsMarquee,
    })),
  { loading: () => <HomeMarqueeSkeleton /> },
);

const QuizTeaser = dynamic(
  () => import("@/components/home/quiz-teaser").then((m) => ({ default: m.QuizTeaser })),
  { loading: () => <SectionCardSkeleton height={200} /> },
);

const ScentWheel = dynamic(
  () => import("@/components/home/scent-wheel").then((m) => ({ default: m.ScentWheel })),
  { loading: () => <SectionCardSkeleton height={340} /> },
);

const TestimonialCarousel = dynamic(
  () =>
    import("@/components/home/testimonial-carousel").then((m) => ({
      default: m.TestimonialCarousel,
    })),
  { loading: () => <SectionCardSkeleton height={260} /> },
);

const NewsletterBanner = dynamic(
  () =>
    import("@/components/banners/newsletter-banner").then((m) => ({
      default: m.NewsletterBanner,
    })),
  { loading: () => <SectionCardSkeleton height={220} /> },
);

const SaleBanner = dynamic(
  () =>
    import("@/components/banners/sale-banner").then((m) => ({
      default: m.SaleBanner,
    })),
  { loading: () => <SectionCardSkeleton height={160} /> },
);

export const metadata: Metadata = buildPageMetadata({
  title: "RazzaqLuxe — Premium Pakistani Fragrances & Luxury Lifestyle",
  description:
    "Discover handcrafted oud, attar, and niche luxury fragrances from Pakistan. Explore signature scents, curated collections, and the RazzaqLuxe lifestyle.",
  path: "/",
});

const collections = [
  {
    title: "Men",
    href: "/shop?gender=men",
    image: "/images/habibi.png",
  },
  {
    title: "Women",
    href: "/shop?gender=women",
    image: "/images/flourine.png",
  },
  {
    title: "Unisex",
    href: "/shop?gender=unisex",
    image: "/images/sporty.png",
  },
  {
    title: "Limited editions",
    href: "/shop",
    image: "/images/khan.png",
  },
];

const ugcTiles = [
  {
    id: "ugc-a",
    src: "/images/home-ugc-sporty.png",
    alt: "Sporty — Razzaq Luxe fragrance",
  },
  {
    id: "ugc-b",
    src: "/images/flourine-promo.png",
    alt: "Flourine — Razzaq Luxe fragrance",
  },
  {
    id: "ugc-c",
    src: "/images/sporty-promo.png",
    alt: "Sporty — Razzaq Luxe fragrance",
  },
  {
    id: "ugc-d",
    src: "/images/khans-aura-promo.png",
    alt: "Khan's Aura — Razzaq Luxe fragrance",
  },
];

export default async function HomePage() {
  const bestSellers = await fetchLegacyProductsForHomeBestSellers(4);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-6rem)] flex-col justify-end overflow-hidden bg-[#1B262C]">
        <div className="absolute inset-0 z-0">
          <div className="relative h-full w-full">
            <video
              className="h-full w-full object-cover brightness-75"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden
            >
              <source src="/hero-bg.mp4" type="video/mp4" />
            </video>
            <div
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/40"
              aria-hidden
            />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-[#0F4C75] blur-3xl opacity-20"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 top-1/4 h-80 w-80 rounded-full bg-[#3282B8] blur-3xl opacity-20"
          />
        </div>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-24 pt-32 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold">
            Quetta · Fragrance house
          </p>
          <h1 className="max-w-4xl font-display text-5xl leading-[1.05] tracking-tight text-[#F3F4F1] sm:text-6xl lg:text-7xl">
            Crafted for the Discerning Pakistani
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Premium fragrances and lifestyle pieces — delivered with care across Pakistan.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/shop">
                Shop the Collection
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/about">Our Story</Link>
            </Button>
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Trusted by <span className="font-semibold text-gold">1,000+</span> customers nationwide
          </p>
        </div>
      </section>

      <div className="section-alt border-t border-border px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SignatureScentsMarquee />
        </div>
      </div>

      <div className="section-ocean-surface border-t border-border px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <QuizTeaser />
        </div>
      </div>

      <div className="section-ocean-primary border-t border-border px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-24 lg:space-y-32">

        {/* Best sellers */}
        <section>
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl sm:text-4xl">Best sellers</h2>
            <p className="mt-3 text-muted-foreground">
              Coveted compositions — quick add to cart, endless compliments.
            </p>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {bestSellers.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                radiusClass={
                  i % 3 === 0
                    ? "rounded-[2.5rem_1.5rem_2rem_2rem]"
                    : i % 3 === 1
                      ? "rounded-[1.5rem_2.5rem_2rem_2rem]"
                      : "rounded-[2rem_2rem_1.5rem_2.5rem]"
                }
              />
            ))}
          </div>
        </section>

        <SaleBanner />

        {/* Collections */}
        <section>
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl">Featured collections</h2>
              <p className="mt-2 max-w-lg text-muted-foreground">
                <GoldBrandText text="Four doors into the Razzaq Luxe universe — each curated with obsessive precision." />
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/shop">View all</Link>
            </Button>
          </div>
          <FeaturedCollectionsConveyor items={collections} />
        </section>

        {/* Notes */}
        <section className="section-ocean-surface rounded-[2rem] border border-border/50 bg-ocean-surface/80 px-6 py-16 sm:px-12">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl sm:text-4xl">Crafted with Purpose</h2>
            <p className="mt-3 text-muted-foreground">
              Our palette — premium materials orchestrated like art.
            </p>
          </div>
          <ScentWheel />
        </section>

        {/* Testimonials */}
        <section>
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl sm:text-4xl">
              Voices of <span className="text-gold">Razzaq Luxe</span>
            </h2>
            <p className="mt-3 text-muted-foreground">Trusted by fashion enthusiasts worldwide.</p>
          </div>
          <TestimonialCarousel />
        </section>

        {/* UGC */}
        <section>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-3xl sm:text-4xl">As seen on you</h2>
              <p className="mt-2 text-muted-foreground">
                Tag <span className="text-gold">#RazzaqLuxe</span> — we feature our community weekly.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {ugcTiles.map((tile) => (
              <div
                key={tile.id}
                className="relative aspect-[1/1.15] overflow-hidden rounded-[2rem] bg-muted"
              >
                <Image src={tile.src} alt={tile.alt} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
              </div>
            ))}
          </div>
        </section>

      </div>
      </div>

      <div className="section-ocean-deep border-t border-border px-4 pb-24 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <NewsletterBanner />
        </div>
      </div>
    </>
  );
}
