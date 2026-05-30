"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
    <motion.div
      key={`${label}-${value}`}
      initial={{ scale: 0.92, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex min-w-[3.25rem] flex-col items-center rounded-2xl bg-white/15 px-2 py-2 backdrop-blur-sm sm:min-w-[4rem] sm:px-3"
    >
      <span className="font-display text-2xl tabular-nums text-white sm:text-3xl">
        {pad(value)}
      </span>
      <span className="mt-0.5 text-[10px] uppercase tracking-widest text-white/80">
        {label}
      </span>
    </motion.div>
  );
}

export function SaleBanner() {
  const [endAt, setEndAt] = useState<number | null>(null);

  useEffect(() => {
    setEndAt(getEndTimestamp());
  }, []);

  const countdown = useCountdown(endAt ?? Date.now() + SEVEN_DAYS_MS);

  if (endAt === null) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="relative overflow-hidden rounded-[2rem] bg-[#3282B8] px-6 py-12 sm:px-12 sm:py-14"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-white/20 blur-3xl"
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-[#0F4C75]/25 blur-2xl"
        animate={{ x: [0, 12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-grain opacity-[0.12] mix-blend-overlay"
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-8 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left"
      >
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/90">
            Limited time offer
          </p>
          <h2 className="mt-2 font-display text-3xl text-white sm:text-4xl">
            Seasonal indulgence
          </h2>
          <p className="mt-2 text-lg font-semibold text-white">Up to 30% off select pieces</p>
        </motion.div>

        <motion.div
          className="flex flex-wrap justify-center gap-2 sm:gap-3"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
        >
          <CountdownUnit value={countdown.days} label="Days" />
          <CountdownUnit value={countdown.hours} label="Hours" />
          <CountdownUnit value={countdown.minutes} label="Min" />
          <CountdownUnit value={countdown.seconds} label="Sec" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/shop?sale=true"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-[#3282B8] shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            Shop the sale
          </Link>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
