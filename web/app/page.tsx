import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { PRODUCTS, type LegacyProduct } from "@/lib/products";
import { siteConfig } from "@/lib/site";
import { GoldBrandText } from "@/components/brand/gold-brand-text";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { HomeMarqueeSkeleton } from "@/components/home/home-marquee-skeleton";
import { SectionCardSkeleton } from "@/components/home/section-card-skeleton";

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

const NewsletterSection = dynamic(
  () =>
    import("@/components/home/newsletter-section").then((m) => ({
      default: m.NewsletterSection,
    })),
  { loading: () => <SectionCardSkeleton height={220} /> },
);

export const metadata: Metadata = {
  title: "Luxury Fashion & Lifestyle",
  description: `${siteConfig.description} Explore luxury fashion, curated collections, and the Razzaq Luxe lifestyle.`,
};

const collections = [
  {
    title: "Men",
    href: "/shop?gender=men",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Women",
    href: "/shop?gender=women",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Unisex",
    href: "/shop?gender=unisex",
    image:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Limited editions",
    href: "/collections",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
  },
];

const ugcTiles = [
  { id: "ugc-a", src: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80" },
  { id: "ugc-b", src: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80" },
  { id: "ugc-c", src: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80" },
  { id: "ugc-d", src: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80" },
];

export default function HomePage() {
  const fallbackBest = [...PRODUCTS]
    .sort((a: LegacyProduct, b: LegacyProduct) => b.reviewCount - a.reviewCount)
    .slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            className="h-full w-full object-cover opacity-90"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-10 px-4 pb-24 pt-32 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold">
            Quetta · Fragrance house
          </p>
          <h1 className="max-w-4xl font-serif text-5xl leading-[1.05] tracking-tight text-luxe-gold sm:text-6xl lg:text-7xl">
            Razzaq Luxe
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Boutique luxury fragrances from Quetta, Pakistan — Sporty, Habibi, Flourine, and
            Khan&apos;s Aura. Crafted for presence, worn with intention.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/shop">
                Explore collection
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/shop?sort=new">Discover your scent</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="border-t border-graphite/80 bg-background px-4 pb-16 pt-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SignatureScentsMarquee />
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-24 px-4 py-24 sm:px-6 lg:space-y-32 lg:px-8">
        <QuizTeaser />

        {/* Collections */}
        <section>
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl">Featured collections</h2>
              <p className="mt-2 max-w-lg text-muted-foreground">
                <GoldBrandText text="Four doors into the Razzaq Luxe universe — each curated with obsessive precision." />
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/collections">View all</Link>
            </Button>
          </div>
          <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-2">
            {collections.map((c) => (
              <Link
                key={c.title}
                href={c.href}
                className="group relative h-72 min-w-[260px] flex-[0_0_auto] overflow-hidden rounded-2xl sm:min-w-[300px]"
              >
                <Image
                  src={c.image}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="300px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute bottom-6 left-6 font-serif text-2xl text-white">
                  {c.title}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Best sellers */}
        <section>
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl">Best sellers</h2>
            <p className="mt-3 text-muted-foreground">
              Coveted compositions — quick add to cart, endless compliments.
            </p>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {fallbackBest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Notes */}
        <section className="rounded-3xl border border-white/10 bg-card/50 px-6 py-16 backdrop-blur-md sm:px-12">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl">Crafted with Purpose</h2>
            <p className="mt-3 text-muted-foreground">
              Our palette — premium materials orchestrated like art.
            </p>
          </div>
          <ScentWheel />
        </section>

        {/* Testimonials */}
        <section>
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl sm:text-4xl">
              Voices of <span className="text-luxe-gold">Razzaq Luxe</span>
            </h2>
            <p className="mt-3 text-muted-foreground">Trusted by fashion enthusiasts worldwide.</p>
          </div>
          <TestimonialCarousel />
        </section>

        {/* UGC */}
        <section>
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl">As seen on you</h2>
              <p className="mt-2 text-muted-foreground">
                Tag <span className="text-luxe-gold">#RazzaqLuxe</span> — we feature our community weekly.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {ugcTiles.map((tile, idx) => (
              <div
                key={tile.id}
                className={`relative aspect-square overflow-hidden rounded-xl bg-muted ${idx === 1 ? "md:translate-y-8" : ""}`}
              >
                <Image src={tile.src} alt="Community wearing Razzaq Luxe" fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
              </div>
            ))}
          </div>
        </section>

        <NewsletterSection />
      </div>
    </>
  );
}
