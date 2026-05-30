"use client";

import { motion } from "framer-motion";
import type { LegacyProduct as Product } from "@/lib/products";

const tierClass =
  "rounded-2xl border border-border/50 bg-gradient-to-b from-white/[0.06] to-transparent p-5 backdrop-blur-sm";

export function NotePyramid({ product }: { product: Product }) {
  const tiers = [
    { label: "Top", notes: product.notes.top, delay: 0 },
    { label: "Heart", notes: product.notes.heart, delay: 0.08 },
    { label: "Base", notes: product.notes.base, delay: 0.16 },
  ];

  return (
    <div className="relative mx-auto max-w-md space-y-3">
      <div className="pointer-events-none absolute inset-x-8 top-1/2 -z-10 h-32 bg-gold/10 blur-3xl" />
      {tiers.map((tier) => (
        <motion.div
          key={tier.label}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: tier.delay }}
          className={tierClass}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            {tier.label}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {tier.notes.map((n) => (
              <li
                key={n}
                className="rounded-full border border-white/15 bg-white/50 px-3 py-1 text-sm text-foreground"
              >
                {n}
              </li>
            ))}
          </ul>
        </motion.div>
      ))}
    </div>
  );
}
