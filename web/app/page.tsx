import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import {
  fetchActiveLegacyProducts,
  fetchLegacyProductsForHomeBestSellers,
} from "@/lib/catalog/fetch-catalog";
import { toHomeFeaturedMarqueeProducts } from "@/lib/home-featured-products";
import { buildPageMetadata } from "@/lib/seo/metadata";
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
    eyebrow: "Bold & Refined",
    href: "/shop?gender=men",
    image: "/images/habibi.png",
  },
  {
    title: "Women",
    eyebrow: "Floral · Feminine",
    href: "/shop?gender=women",
    image: "/images/flourine.png",
  },
  {
    title: "Unisex",
    eyebrow: "Universal",
    href: "/shop?gender=unisex",
    image: "/images/sporty.png",
  },
  {
    title: "Limited editions",
    eyebrow: "House Classics",
    href: "/shop",
    image: "/images/khan.png",
  },
];

const values = [
  {
    num: "I",
    title: "Master Craftsmanship",
    desc: "Every bottle is balanced for presence and longevity — nothing ships until it moves us in-house.",
  },
  {
    num: "II",
    title: "Rooted in Origin",
    desc: "Born in Quetta, carrying Balochistan — rose valleys, trade routes, and frankincense in mountain air.",
  },
  {
    num: "III",
    title: "Scent with Soul",
    desc: "We bottle feeling — named emotions and stories your skin tells for hours.",
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

const FALLBACK_MARQUEE = [
  { slug: "khans-aura", name: "Khan's Aura", tagline: "Dark oud — commanding presence." },
  { slug: "habibi-noir", name: "Habibi Noir", tagline: "Signature depth for evening." },
  { slug: "flourine", name: "Flourine Blanche", tagline: "Luminous florals — soft bloom." },
  { slug: "sporty", name: "Sporty Amber", tagline: "Bright energy — everyday standout." },
  { slug: "baji-rose", name: "Baji Rose", tagline: "Romantic rose with warmth." },
  { slug: "bacha-wood", name: "Bacha Wood", tagline: "Woody calm — understated luxury." },
  { slug: "girl-mystique", name: "Girl Mystique", tagline: "Mysterious floral allure." },
];

export default async function HomePage() {
  const [bestSellers, catalog] = await Promise.all([
    fetchLegacyProductsForHomeBestSellers(4),
    fetchActiveLegacyProducts(),
  ]);
  const marqueeProducts = toHomeFeaturedMarqueeProducts(catalog);
  const marqueeItems = marqueeProducts.length > 0 ? marqueeProducts : FALLBACK_MARQUEE;

  return (
    <>
      {/* Hero — Nocturne Doré */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-noir pt-[100px]">
        <div className="absolute inset-0 z-0">
          <div className="relative h-full w-full">
            <video
              className="h-full w-full object-cover opacity-45 transition-opacity duration-[2000ms]"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden
            >
              <source src="/hero-final-bg.mp4" type="video/mp4" />
            </video>
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0A0A08] via-[#0A0A08]/50 to-transparent"
              aria-hidden
            />
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-[40vw] w-[40vw] rounded-full bg-[radial-gradient(circle,rgba(196,154,30,0.07),transparent_70%)]"
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-20 pt-8 sm:px-6 md:pb-28">
          <span className="mb-5 block font-body text-[11px] font-medium uppercase tracking-[0.3em] text-gold-bright opacity-85">
            Razzaq Luxe · Quetta, Pakistan
          </span>
          <h1 className="max-w-4xl font-display text-[clamp(2.8rem,11vw,8rem)] font-light leading-[0.92] tracking-tight text-foreground">
            The Art of
            <br />
            <em className="text-gold-bright">Scent</em>
          </h1>
          <p className="mt-6 max-w-[400px] text-[clamp(0.9rem,2.2vw,1.05rem)] font-light leading-relaxed text-text-secondary">
            Cinematic fragrances crafted for the discerning soul. Dark oud, rare amber, timeless
            elegance — from the heart of Balochistan.
          </p>
          <div className="mt-10 flex flex-col gap-3 xs:flex-row sm:flex-row sm:gap-5">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/shop">Discover Fragrances</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
              <Link href="/about">Our Story</Link>
            </Button>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">
            Trusted by <strong className="font-medium text-gold-bright">1,000+</strong> customers
            across Pakistan
          </p>
        </div>
      </section>

      <SignatureScentsMarquee variant="minimal" products={marqueeItems} />

      <div className="quiz-section-nocturne px-5 sm:px-6">
        <div className="relative z-10 mx-auto max-w-4xl">
          <QuizTeaser />
        </div>
      </div>

      <div className="section-nocturne border-t border-border bg-noir px-5 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-24 lg:space-y-28">
          {/* Best sellers */}
          <section>
            <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className="eyebrow">Curated Selection</span>
                <h2 className="text-display mt-3">Best Sellers</h2>
              </div>
              <Button asChild variant="link-ghost" className="shrink-0">
                <Link href="/shop">View All</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-14 lg:grid-cols-3 lg:gap-16">
              {bestSellers.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>

          <SaleBanner />

          {/* Collections */}
          <section>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
              <div>
                <span className="eyebrow">Collections</span>
                <h2 className="text-display mt-3">Featured Collections</h2>
              </div>
              <Button asChild variant="link-ghost" className="shrink-0">
                <Link href="/shop">View All</Link>
              </Button>
            </div>
            <FeaturedCollectionsConveyor items={collections} />
          </section>

          {/* Brand values */}
          <section className="border-t border-border bg-noir-surface px-6 py-16 -mx-5 sm:-mx-6 sm:px-12 sm:py-20">
            <div className="mb-12">
              <span className="eyebrow">Crafted with Purpose</span>
              <h2 className="text-display mt-3">Our Philosophy</h2>
            </div>
            <div className="grid gap-12 md:grid-cols-3 md:gap-8">
              {values.map((v) => (
                <article key={v.num}>
                  <span className="value-number">{v.num}</span>
                  <div className="value-line" />
                  <h3 className="font-display text-2xl text-foreground">{v.title}</h3>
                  <p className="mt-3 max-w-xs text-sm font-light leading-relaxed text-text-secondary">
                    {v.desc}
                  </p>
                </article>
              ))}
            </div>
          </section>

          {/* Notes */}
          <section className="border border-border bg-noir-surface px-6 py-16 sm:px-12">
            <div className="mb-12 text-center">
              <span className="eyebrow">Our palette</span>
              <h2 className="text-display mt-3">Crafted with Purpose</h2>
              <p className="mt-3 text-sm font-light text-muted-foreground">
                Premium materials orchestrated like art.
              </p>
            </div>
            <ScentWheel />
          </section>

          {/* Testimonials */}
          <section>
            <div className="mb-12">
              <span className="eyebrow">From Our Community</span>
              <h2 className="text-display mt-3">
                What They <span className="text-gold-shimmer">Say</span>
              </h2>
            </div>
            <TestimonialCarousel />
          </section>

          {/* UGC */}
          <section className="border-t border-border bg-noir-elevated px-0 py-16 -mx-5 sm:-mx-6 sm:py-20">
            <div className="mb-10 px-5 sm:px-6">
              <span className="eyebrow">Community</span>
              <h2 className="text-display mt-3">As Seen on You</h2>
              <p className="mt-3 max-w-md text-sm font-light text-text-secondary">
                Tag <span className="text-gold-bright">#RazzaqLuxe</span> — we feature our community weekly.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
              {ugcTiles.map((tile) => (
                <div
                  key={tile.id}
                  className="group relative aspect-square overflow-hidden bg-noir-surface"
                >
                  <Image
                    src={tile.src}
                    alt={tile.alt}
                    fill
                    className="object-cover brightness-[0.8] grayscale-[0.2] transition-[filter,transform] duration-500 group-hover:scale-[1.04] group-hover:brightness-100 group-hover:grayscale-0"
                    sizes="(max-width:768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="section-nocturne border-t border-border px-5 text-center sm:px-6">
        <div className="mx-auto max-w-4xl">
          <NewsletterBanner />
        </div>
      </div>
    </>
  );
}
