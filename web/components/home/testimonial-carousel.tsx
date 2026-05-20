"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GoldBrandText } from "@/components/brand/gold-brand-text";

const items = [
  {
    quote:
      "Habibi is the fragrance I wear when I want to feel at home wherever I land. Razzaq Luxe nailed warmth without heaviness.",
    name: "Ayesha K.",
    role: "Architect",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Sporty stays crisp from morning meetings to dinner — signature line from a Quetta house that finally feels ours.",
    name: "Hamza R.",
    role: "Entrepreneur",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Khan\u2019s Aura fills a room politely and lingers beautifully. Flourine surprised me — sharp, unforgettable.",
    name: "Sadia M.",
    role: "Stylist",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Ordering was straightforward — COD confirmation took seconds. Packaging felt bespoke; I'll be back for Sporty.",
    name: "Omar N.",
    role: "Product designer",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
  },
];

const AUTO_ADVANCE_MS = 6500;

export function TestimonialCarousel() {
  const [i, setI] = useState(0);
  const cur = items[i];

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = window.setInterval(() => {
      setI((x) => (x + 1) % items.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative mx-auto max-w-4xl">
      <Quote className="absolute -left-2 top-0 h-16 w-16 text-gold/15" aria-hidden />
      <AnimatePresence mode="wait">
        <motion.figure
          key={cur.name}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.35 }}
          className="relative px-4 pt-8 text-center sm:px-12"
        >
          <blockquote className="font-display text-xl italic leading-relaxed text-foreground sm:text-2xl">
            “<GoldBrandText text={cur.quote} />”
          </blockquote>
          <figcaption className="mt-10 flex flex-col items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-full ring-2 ring-gold/40">
              <Image
                src={cur.image}
                alt=""
                fill
                className="object-cover"
                sizes="56px"
                /** Direct CDN avoids `/_next/image` fetch timeouts/404 when dev/proxy drops optimizer fetches */
                unoptimized
              />
            </div>
            <div>
              <p className="font-medium">{cur.name}</p>
              <p className="text-sm text-muted-foreground">{cur.role}</p>
            </div>
          </figcaption>
        </motion.figure>
      </AnimatePresence>

      <div className="mt-10 flex justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Previous testimonial"
          onClick={() => setI((x) => (x - 1 + items.length) % items.length)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1.5 px-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              className={`h-2 rounded-full transition-all ${idx === i ? "w-6 bg-gold" : "w-2 bg-white/20"}`}
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
          onClick={() => setI((x) => (x + 1) % items.length)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
