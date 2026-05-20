"use client";

import { motion } from "framer-motion";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/banner-constants";
import { formatPKR } from "@/stores/cart-store";

type ShippingProgressProps = {
  subtotal: number;
  className?: string;
};

export function ShippingProgress({ subtotal, className }: ShippingProgressProps) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const unlocked = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
      role="status"
    >
      <motion.div
        className="h-2 overflow-hidden rounded-full bg-[#16213E]"
        layout
      >
        <motion.div
          className="h-full rounded-full bg-[#0F4C75]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </motion.div>
      <p className="mt-2 text-xs text-muted-foreground">
        {unlocked ? (
          <span className="font-medium text-[#0F4C75]">
            You&apos;ve unlocked free standard shipping!
          </span>
        ) : (
          <>
            Add <span className="font-medium text-foreground">{formatPKR(remaining)}</span> more
            for free delivery (orders over {formatPKR(FREE_SHIPPING_THRESHOLD)})
          </>
        )}
      </p>
    </motion.div>
  );
}
