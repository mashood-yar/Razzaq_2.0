"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type SectionCtaProps = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  variant?: "ocean" | "gold" | "deep";
  align?: "left" | "right";
};

const VARIANTS = {
  ocean: {
    section: "bg-[#3282B8] text-white",
    blob: "bg-white/20",
    button: "bg-white text-[#3282B8] hover:bg-white/95",
  },
  gold: {
    section: "bg-[#1B3A4B] text-foreground border border-gold/20",
    blob: "bg-gold/15",
    button: "bg-gold text-ocean-deep hover:bg-gold-light",
  },
  deep: {
    section: "bg-[#0F4C75] text-[#F3F4F1]",
    blob: "bg-white/15",
    button: "bg-gold text-ocean-deep hover:bg-gold-light",
  },
} as const;

export function SectionCta({
  eyebrow,
  title,
  description,
  href,
  ctaLabel,
  variant = "ocean",
  align = "left",
}: SectionCtaProps) {
  const reduceMotion = useReducedMotion();
  const styles = VARIANTS[variant];

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <Link
        href={href}
        className={cn(
          "group relative block overflow-hidden rounded-[2rem] px-6 py-10 transition-transform hover:scale-[1.01] active:scale-[0.99] sm:px-10 sm:py-12",
          styles.section,
          align === "right" && "text-right",
        )}
      >
        <motion.div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -top-10 h-40 w-40 rounded-full blur-3xl",
            styles.blob,
            align === "right" ? "-left-8" : "-right-8",
          )}
          animate={reduceMotion ? undefined : { scale: [1, 1.12, 1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -bottom-12 h-32 w-32 rounded-full blur-2xl",
            styles.blob,
            align === "right" ? "right-8" : "left-8",
          )}
          animate={reduceMotion ? undefined : { x: [0, 14, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />

        <div
          className={cn(
            "relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between",
            align === "right" && "sm:flex-row-reverse",
          )}
        >
          <div className={cn("max-w-xl", align === "right" && "sm:ml-auto")}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-85">
              {eyebrow}
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl">{title}</h2>
            <p className="mt-2 text-sm opacity-90 sm:text-base">{description}</p>
          </div>
          <span
            className={cn(
              "inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold shadow-lg transition-transform group-hover:scale-105",
              styles.button,
            )}
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </span>
        </div>
      </Link>
    </motion.section>
  );
}
