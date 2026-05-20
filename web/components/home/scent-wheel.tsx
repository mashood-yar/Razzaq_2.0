"use client";

import { motion } from "framer-motion";

const notes = [
  { label: "Woody", angle: 0 },
  { label: "Oriental", angle: 51 },
  { label: "Floral", angle: 102 },
  { label: "Fresh", angle: 154 },
  { label: "Citrus", angle: 205 },
  { label: "Spicy", angle: 257 },
  { label: "Gourmand", angle: 308 },
];

export function ScentWheel() {
  return (
    <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-12 lg:flex-row lg:justify-between">
      <div className="relative aspect-square w-full max-w-[320px]">
        <div className="absolute inset-0 rounded-full border border-gold/30 bg-gradient-to-br from-brand-mist/60 via-brand-slate/50 to-gold/10 shadow-[inset_0_0_60px_rgba(184,227,233,0.14)]" />
        <motion.div
          className="absolute inset-8 rounded-full border border-border/50"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-foreground/20 px-6 py-8 text-center backdrop-blur-md">
            <p className="text-xs uppercase tracking-[0.35em] text-gold">Palette</p>
            <p className="mt-2 font-display text-lg text-foreground">Signature notes</p>
          </div>
        </div>
        {notes.map((n) => (
          <span
            key={n.label}
            className="absolute left-1/2 top-1/2 origin-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
            style={{
              transform: `rotate(${n.angle}deg) translateY(-140px) rotate(-${n.angle}deg)`,
            }}
          >
            {n.label}
          </span>
        ))}
      </div>
      <ul className="max-w-sm space-y-4 text-sm leading-relaxed text-muted-foreground">
        <li>
          <strong className="text-foreground">Woody & resinous</strong> — grounding santal,
          vetiver, and aged oud form the backbone of our evening compositions.
        </li>
        <li>
          <strong className="text-foreground">Radiant citrus</strong> — cold-pressed peel and
          living neroli keep daylight fragrances weightless.
        </li>
        <li>
          <strong className="text-foreground">Velvet florals</strong> — jasmine and iris treated
          as architecture, never decoration.
        </li>
      </ul>
    </div>
  );
}
