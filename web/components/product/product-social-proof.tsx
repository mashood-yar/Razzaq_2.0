"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const MESSAGES = [
  { text: "12 people viewed this in the last hour", emoji: "👀" },
  { text: "Sold 47 times this month", emoji: "🔥" },
  { text: "Rated 4.9 by Razzaq Luxe customers", emoji: "⭐" },
  { text: "3 added to bag in the last 24 hours", emoji: "🛍️" },
];

const ROTATE_MS = 3000;

export function ProductSocialProof() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  const current = MESSAGES[index];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-4 inline-flex min-h-9 items-center rounded-full bg-[#16213E] px-4 py-2"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm"
        >
          <span className="animate-pulse text-base" aria-hidden>
            {current.emoji}
          </span>
          {current.text}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
}
