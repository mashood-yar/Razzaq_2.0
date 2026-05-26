import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ParallaxSection } from "@/components/cinematic/parallax-section";

export const metadata: Metadata = {
  title: "The House of Razzaq Luxe",
  description:
    "Discover the philosophy, craftsmanship, and origin of Razzaq Luxe — where fine fragrances meet uncompromising luxury.",
};

export default function AboutPage() {
  return (
    <div className="bg-obsidian min-h-screen text-ivory">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] items-center justify-center overflow-hidden">
        <Image
          src="/about-hero.png"
          alt="Razzaq Luxe Heritage"
          fill
          className="object-cover opacity-40 grayscale"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-obsidian/40 to-obsidian" />
        <div className="relative z-10 text-center px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold mb-6">
            Our Heritage
          </p>
          <h1 className="max-w-4xl font-display text-[clamp(3rem,6vw,6rem)] leading-none italic font-light">
            The Pursuit of Perfection
          </h1>
        </div>
      </section>

      {/* Cinematic Pull-Quote */}
      <section className="py-48 px-6 sm:px-12 lg:px-24">
        <ParallaxSection>
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-snug font-light text-ivory italic">
              "We don't just blend fragrances. We orchestrate emotions, bottling the essence of quiet confidence."
            </h2>
            <div className="mt-12 h-[1px] w-16 bg-gold mx-auto" />
            <p className="mt-8 text-sm uppercase tracking-widest text-smoke font-medium">
              — The Founders, Quetta
            </p>
          </div>
        </ParallaxSection>
      </section>

      {/* Editorial Story */}
      <section className="py-32 px-6 sm:px-12 lg:px-24 bg-charcoal border-y border-graphite">
        <div className="mx-auto max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <ParallaxSection>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2px]">
              <Image
                src="https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=1200&q=80"
                alt="Craftsmanship"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              />
            </div>
          </ParallaxSection>
          
          <div className="flex flex-col gap-10">
            <h3 className="font-display text-4xl sm:text-5xl font-light text-gold italic">
              Uncompromising Craft
            </h3>
            <div className="space-y-6 text-smoke text-lg leading-loose font-light">
              <p>
                Razzaq Luxe was born in Quetta from a singular obsession: to redefine luxury perfumery for the modern connoisseur. What started as a boutique vision has grown into a house known for its impeccable standards.
              </p>
              <p>
                Each composition—whether the vibrant energy of Sporty or the profound depth of Khan's Aura—is meticulously balanced. We source the finest raw materials, ensuring that every note unfolds with perfect clarity and lasts throughout the day.
              </p>
              <p>
                Our philosophy is simple: True luxury never shouts. It is felt in the weight of the bottle, the mist of the atomizer, and the indelible trail left behind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Boutique */}
      <section className="py-48 px-6 sm:px-12 lg:px-24">
        <div className="mx-auto max-w-[1200px] text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold mb-8">
            The Flagship
          </p>
          <h2 className="font-display text-5xl sm:text-6xl font-light text-ivory mb-12">
            Experience the House in Quetta
          </h2>
          <p className="max-w-2xl mx-auto text-smoke text-lg leading-loose font-light mb-16">
            Immerse yourself in the world of Razzaq Luxe. Discover our full signature line, receive personal layering consultations, and explore the raw materials that define our craft.
          </p>
          <Link href="/contact" className="btn-secondary">
            Plan Your Visit
          </Link>
        </div>
      </section>

      {/* Cinematic Film (Optional) */}
      <section className="relative h-[60vh] overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover grayscale opacity-30"
          src="/hero-final-bg.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-obsidian/40 mix-blend-multiply" />
      </section>
    </div>
  );
}
