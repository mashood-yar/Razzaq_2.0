import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GoldBrandText } from "@/components/brand/gold-brand-text";
import { Button } from "@/components/ui/button";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "About RazzaqLuxe",
  description:
    "RazzaqLuxe — a Pakistani fragrance house rooted in Quetta. Signature scents Sporty, Habibi, Flourine, and Khan\u2019s Aura, crafted for discerning wearers.",
  path: "/about",
});

const stats = [
  { value: "1K+", label: "Happy Customers" },
  { value: "7", label: "Signature Scents" },
  { value: "4+", label: "Years of Craft" },
  { value: "100%", label: "Pakistani Heritage" },
];

const milestones = [
  { year: "Origins", text: "Razzaq Luxe grows from a Quetta boutique — local craft, uncompromising quality." },
  { year: "Signature line", text: "House pillars take shape: Sporty, Habibi, Flourine, and Khan\u2019s Aura." },
  { year: "Today", text: "Flagship store in Quetta; nationwide shipping and personal consultations." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-noir pt-[100px]">
        <div className="absolute inset-0" aria-hidden>
          <div className="relative h-full w-full">
            <Image
              src="/images/about-hero.png"
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
        <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-20 pt-8 sm:px-6 md:pb-28">
          <span className="eyebrow mb-5 block">Our Story</span>
          <h1 className="font-display text-[clamp(2.5rem,10vw,5rem)] font-light leading-[0.95] tracking-tight text-foreground">
            Born in <em className="text-gold-bright">Quetta</em>,
            <br />
            Made for the World
          </h1>
          <p className="mt-6 max-w-lg text-base font-light leading-relaxed text-text-secondary">
            A fragrance house built on the belief that Pakistan deserves its own voice in the
            language of luxury scent.
          </p>
        </div>
      </section>

      <section className="border-y border-border bg-noir-surface py-16">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-10 px-5 sm:grid-cols-4 sm:px-6">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <span className="font-display text-4xl font-light text-gold-bright sm:text-5xl">
                {s.value}
              </span>
              <span className="mt-2 block text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="section-nocturne mx-auto max-w-4xl space-y-20 px-5 sm:px-6">
        <section className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-noir-surface">
            <Image
              src="/images/areeb.png"
              alt="Razzaq Luxe founder"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 480px"
            />
            <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.2em] text-text-secondary">
              Quetta, Pakistan · 2020
            </span>
          </div>
          <div>
            <span className="eyebrow">The Origin</span>
            <h2 className="text-display mt-5">A Dream Born in the Balochistan Mountains</h2>
            <p className="mt-6 text-sm font-light leading-relaxed text-text-secondary">
              <GoldBrandText text="Razzaq Luxe was founded with one conviction: that the rich, ancient olfactory culture of Pakistan — rose valleys, frankincense trade routes, saffron markets — deserved to be captured in bottles worthy of the world stage." />
            </p>
            <p className="mt-4 text-sm font-light leading-relaxed text-muted-foreground">
              Our founder spent years training in perfumery, studying regional raw materials, and
              listening to what Pakistani men and women wanted to smell like. The result is a house
              line built for presence in our climate — Sporty, Habibi, Flourine, and Khan&apos;s Aura.
            </p>
          </div>
        </section>

        <section>
          <span className="eyebrow">Timeline</span>
          <h2 className="text-display mt-3">Milestones</h2>
          <ol className="mt-10 space-y-8 border-l border-border pl-8">
            {milestones.map((m) => (
              <li key={m.year} className="relative">
                <span className="absolute -left-[39px] top-1.5 h-3 w-3 bg-gold-warm" />
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold-warm">
                  {m.year}
                </p>
                <p className="mt-2 text-sm font-light text-muted-foreground">
                  <GoldBrandText text={m.text} />
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border border-border bg-noir-surface p-8 sm:p-12">
          <h2 className="font-display text-3xl font-light">Philosophy & craftsmanship</h2>
          <p className="mt-6 text-sm font-light leading-relaxed text-text-secondary">
            Each composition is balanced for our climate and occasions — bright openings, durable
            hearts, and bases that stay close without overwhelming. We listen to customers in-store
            in Quetta and refine the line with the same obsession that started the house.
          </p>
        </section>

        <section>
          <h2 className="font-display text-3xl font-light">Visit us</h2>
          <p className="mt-6 text-sm font-light leading-relaxed text-muted-foreground">
            Our flagship boutique is in <strong className="text-foreground">Quetta, Balochistan</strong>.
            Try the full signature line, ask for layering tips, or pick up your order in person.
            Saturday–Thursday, 10 AM – 8 PM PKT.
          </p>
          <Button asChild variant="secondary" size="lg" className="mt-8">
            <Link href="/contact">Contact us</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
