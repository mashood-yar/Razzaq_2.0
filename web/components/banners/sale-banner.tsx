"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SALE_COUNTDOWN_END_KEY } from "@/lib/banner-constants";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function getEndTimestamp(): number {
  if (typeof window === "undefined") return Date.now() + SEVEN_DAYS_MS;
  const stored = localStorage.getItem(SALE_COUNTDOWN_END_KEY);
  if (stored) {
    const n = Number(stored);
    if (!Number.isNaN(n) && n > Date.now()) return n;
  }
  const end = Date.now() + SEVEN_DAYS_MS;
  localStorage.setItem(SALE_COUNTDOWN_END_KEY, String(end));
  return end;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function useCountdown(endAt: number) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, endAt - now);
  return useMemo(
    () => ({
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    }),
    [diff],
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <span className="font-display text-[clamp(3rem,8vw,5rem)] font-light leading-none tracking-tight text-foreground">
        {pad(value)}
      </span>
      <span className="mt-2 block text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function CountdownSeparator() {
  return (
    <span
      className="animate-pulse self-center pb-4 font-display text-[clamp(2rem,5vw,3.5rem)] text-gold-warm opacity-40"
      aria-hidden
    >
      :
    </span>
  );
}

export function SaleBanner() {
  const reduceMotion = useReducedMotion();
  const [endAt, setEndAt] = useState<number | null>(null);

  useEffect(() => {
    setEndAt(getEndTimestamp());
  }, []);

  const countdown = useCountdown(endAt ?? Date.now() + SEVEN_DAYS_MS);

  if (endAt === null) return null;

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 32 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="border-y border-border bg-noir-elevated px-5 py-20 text-center sm:px-6 md:py-28"
      aria-labelledby="sale-heading"
    >
      <span className="eyebrow">Limited Time</span>
      <h2 id="sale-heading" className="text-display mt-3 text-foreground">
        Eid Collection Sale
      </h2>
      <p className="mt-2 text-[13px] tracking-widest text-muted-foreground">
        Up to 30% off our finest oriental fragrances. Ends soon.
      </p>

      <div
        className="mx-auto mt-12 flex max-w-2xl flex-wrap items-end justify-center gap-8"
        aria-live="polite"
        aria-label="Sale countdown timer"
      >
        <CountdownUnit value={countdown.days} label="Days" />
        <CountdownSeparator />
        <CountdownUnit value={countdown.hours} label="Hours" />
        <CountdownSeparator />
        <CountdownUnit value={countdown.minutes} label="Minutes" />
        <CountdownSeparator />
        <CountdownUnit value={countdown.seconds} label="Seconds" />
      </div>

      <Button asChild size="lg" className="mt-12">
        <Link href="/shop?sale=true">Shop the Sale</Link>
      </Button>
    </motion.section>
  );
}
