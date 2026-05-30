"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
        <h2 className="font-display text-2xl text-foreground sm:text-3xl">
          Your bag awaits
        </h2>
        <p className="mt-2 max-w-xs text-sm text-muted-foreground">
          Discover curated fragrances and lifestyle pieces crafted for discerning taste.
        </p>
      </motion.div>

      <motion.div
        className="flex flex-col gap-3 sm:flex-row"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <Button asChild size="lg">
          <Link href="/shop" onClick={onNavigate}>
            Shop the collection
          </Link>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/shop?sort=new" onClick={onNavigate}>
            New arrivals
          </Link>
        </Button>
      </motion.div>
    </motion.div>
  );
}
