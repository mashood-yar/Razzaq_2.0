"use client";

import { motion } from "framer-motion";
import { ParallaxSection } from "./parallax-section";

export function EditorialSection() {
  return (
    <section className="bg-charcoal py-32 sm:py-48 px-6 sm:px-12 lg:px-24">
      <div className="mx-auto max-w-[1200px]">
        <ParallaxSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-8">
              <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-snug tracking-tight text-ivory font-light">
                A Legacy of <br />
                <span className="italic text-gold">Refined Taste</span>
              </h2>
              <div className="h-[1px] w-12 bg-graphite" />
              <p className="text-lg tracking-wide text-smoke leading-loose font-light max-w-md">
                We believe in the power of restraint. Our fragrances are crafted not to overpower, but to leave an indelible mark of sophistication. Every bottle is a testament to the art of quiet luxury.
              </p>
            </div>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2px]">
              <motion.img
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0, 1] }}
                src="/images/flourine.png"
                alt="Editorial brand image"
                className="h-full w-full object-cover grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
              />
            </div>
          </div>
        </ParallaxSection>
      </div>
    </section>
  );
}
