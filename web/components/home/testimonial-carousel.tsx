"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const items = [
  {
    quote:
      "Legend is the fragrance I wear when I want to feel at home wherever I land. Razzaq Luxe nailed warmth without heaviness.",
    name: "Ayesha K.",
    role: "Architect",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Sporty stays crisp from morning meetings to dinner — a signature line from a Quetta house that finally feels ours.",
    name: "Hamza R.",
    role: "Entrepreneur",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Khan\u2019s Aura fills a room politely and lingers beautifully. Flora surprised me \u2014 sharp, unforgettable.",
    name: "Sadia M.",
    role: "Stylist",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Ordering was straightforward \u2014 COD confirmation took seconds. Packaging felt bespoke; I'll be back for Sporty.",
    name: "Omar N.",
    role: "Product designer",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
  },
];

const AUTO_ADVANCE_MS = 6500;

export function TestimonialCarousel() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const cur = items[i];
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      paused
    ) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = window.setInterval(() => {
      setI((x) => (x + 1) % items.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  return (
    <div
      className="relative mx-auto max-w-3xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Gold top-border accent */}
      <div className="mx-auto mb-10 h-px w-16 bg-gradient-to-r from-transparent via-gold-warm to-transparent" />

      <AnimatePresence mode="wait">
        <motion.figure
          key={cur.name}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          className="relative px-4 text-center sm:px-12"
        >
          {/* Large decorative quote mark */}
          <span
            aria-hidden
            className="pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 font-display text-[120px] leading-none text-gold-warm/10 select-none"
          >
            &ldquo;
          </span>

          <blockquote className="relative font-display text-[clamp(1.1rem,2.5vw,1.5rem)] italic font-light leading-relaxed text-foreground">
            &ldquo;{cur.quote}&rdquo;
          </blockquote>

          <figcaption className="mt-8 flex flex-col items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full ring-1 ring-gold-warm/30 ring-offset-2 ring-offset-background">
              <Image
                src={cur.image}
                alt=""
                fill
                className="object-cover"
                sizes="48px"
                unoptimized
              />
            </div>
            <div>
              <p className="font-body text-sm font-medium text-foreground">{cur.name}</p>
              <p className="font-body text-[11px] uppercase tracking-[0.15em] text-muted-foreground mt-0.5">
                {cur.role}
              </p>
            </div>
          </figcaption>
        </motion.figure>
      </AnimatePresence>

      {/* Controls */}
      <div className="mt-10 flex items-center justify-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Previous testimonial"
          className="h-8 w-8 rounded-full border-border/50 text-muted-foreground hover:border-gold-warm hover:text-gold-bright"
          onClick={() => setI((x) => (x - 1 + items.length) % items.length)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <div className="flex items-center gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === i
                  ? "w-8 bg-gold-warm"
                  : "w-1.5 bg-border hover:bg-muted-foreground"
              }`}
              aria-label={`Go to testimonial ${idx + 1}`}
              aria-current={idx === i}
              onClick={() => setI(idx)}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Next testimonial"
          className="h-8 w-8 rounded-full border-border/50 text-muted-foreground hover:border-gold-warm hover:text-gold-bright"
          onClick={() => setI((x) => (x + 1) % items.length)}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
