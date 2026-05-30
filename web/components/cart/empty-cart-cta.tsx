"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type EmptyCartCtaProps = {
  onNavigate?: () => void;
};

export function EmptyCartCta({ onNavigate }: EmptyCartCtaProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-1 flex-col items-center justify-center gap-6 overflow-hidden py-12 text-center"
    >
      <div className="relative flex h-32 w-32 items-center justify-center" aria-hidden>
        <motion.div
          className="absolute h-24 w-24 rounded-[45%_55%_60%_40%] bg-gold/15 blur-sm"
          animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute h-20 w-20 rounded-[55%_45%_40%_60%] bg-gold/20"
          animate={{ y: [0, 10, 0], x: [0, 4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.div
          className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border bg-noir-surface"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="font-display text-2xl text-gold">R</span>
        </motion.div>
      </div>

      <motion.div>
        <h2 className="font-display text-2xl text-ivory sm:text-3xl italic">
          Your bag awaits
        </h2>
        <p className="mt-2 max-w-xs text-sm text-smoke font-light">
          Discover curated fragrances crafted for the discerning palate.
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-3 sm:flex-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Link href="/shop" className="btn-primary w-full text-center" onClick={onNavigate}>
          Discover the collection
        </Link>
        <Link href="/shop?sort=new" className="text-sm text-smoke hover:text-gold transition-colors pt-2" onClick={onNavigate}>
          View new arrivals
        </Link>
      </motion.div>
    </motion.div>
  );
}
