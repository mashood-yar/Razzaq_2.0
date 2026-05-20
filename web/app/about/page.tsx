import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GoldBrandText } from "@/components/brand/gold-brand-text";

export const metadata: Metadata = {
  title: "About",
  description:
    "Razzaq Luxe — fragrance house in Quetta, Pakistan. Signature scents Sporty, Habibi, Flourine, and Khan\u2019s Aura.",
};

const milestones = [
  { year: "Origins", text: "Razzaq Luxe grows from a Quetta boutique — local craft, uncompromising quality." },
  { year: "Signature line", text: "House pillars take shape: Sporty, Habibi, Flourine, and Khan\u2019s Aura." },
  { year: "Today", text: "Flagship store in Quetta; nationwide shipping and personal consultations." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="relative flex min-h-[55vh] items-end overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=2000&q=80"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold">
            Our story
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl sm:text-6xl">
            Fragrance from Quetta
          </h1>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-16 px-4 py-20 sm:px-6 lg:px-8">
        <section>
          <h2 className="font-display text-3xl">Brand story</h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            <GoldBrandText text={"Razzaq Luxe is a Pakistan fragrance house built around four signatures — Sporty, Habibi, Flourine, and Khan\u2019s Aura. We blend for presence and longevity, with a physical boutique in Quetta and the same care whether you walk in or order online."} />
          </p>
        </section>

        <section>
          <h2 className="font-display text-3xl">Timeline</h2>
          <ol className="mt-10 space-y-8 border-l border-white/15 pl-8">
            {milestones.map((m) => (
              <li key={m.year} className="relative">
                <span className="absolute -left-[39px] top-1.5 h-3 w-3 rounded-full bg-gold" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  {m.year}
                </p>
                <p className="mt-2 text-muted-foreground">
                  <GoldBrandText text={m.text} />
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-border/50 bg-card/40 p-8 backdrop-blur-md">
          <h2 className="font-display text-3xl">Philosophy & craftsmanship</h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Each composition is balanced for our climate and occasions — bright openings, durable
            hearts, and bases that stay close without overwhelming. We listen to customers in-store
            in Quetta and refine the line with the same obsession that started the house.
          </p>
        </section>

        <section>
          <h2 className="font-display text-3xl">Visit us</h2>
          <p className="mt-6 leading-relaxed text-muted-foreground">
            Our flagship boutique is in <strong className="text-foreground">Quetta, Balochistan</strong>.
            Try the full signature line, ask for layering tips, or pick up your order in person.
            Saturday–Thursday, 10 AM – 8 PM PKT — see our{" "}
            <Link href="/contact" className="text-gold underline-offset-4 hover:underline">
              Contact
            </Link>{" "}
            page for enquiries.
          </p>
        </section>

        <section className="relative overflow-hidden rounded-2xl border border-border/50">
          <div className="relative aspect-video bg-muted">
            <video
              className="absolute inset-0 h-full w-full object-cover"
              src="/hero-bg.mp4"
              autoPlay
              muted
              loop
              playsInline
              aria-label="Razzaq Luxe brand film"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
