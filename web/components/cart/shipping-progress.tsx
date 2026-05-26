"use client";

import { motion } from "framer-motion";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/banner-constants";
import { formatPKR } from "@/stores/cart-store";
import { Check } from "lucide-react";

type ShippingProgressProps = {
  subtotal: number;
  className?: string;
};

export function ShippingProgress({ subtotal, className }: ShippingProgressProps) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  // Endowed progress effect: base progress is slightly above 0 (e.g. 5%) if empty, or just calculate
  const baseProgress = subtotal > 0 ? (subtotal / FREE_SHIPPING_THRESHOLD) * 100 : 5;
  const progress = Math.min(100, baseProgress);
  const unlocked = subtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className={`flex flex-col ${className || ''}`} role="status">
      <div className="flex justify-between items-center mb-2">
        <p className="font-body font-light text-[12px] text-[var(--cream-muted)]">
          {unlocked ? (
            <span className="flex items-center gap-1 text-[var(--gold-warm)] font-medium">
              <Check className="w-3 h-3" /> Free shipping unlocked ✦
            </span>
          ) : (
            <>Add <span className="font-medium text-[var(--cream-bone)]">{formatPKR(remaining)}</span> more for free shipping ✦</>
          )}
        </p>
      </div>
      <div className="h-[3px] w-full bg-[var(--bg-ash)] rounded-none overflow-hidden">
        <motion.div
          className="h-full bg-[var(--gold-warm)] rounded-none"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        />
      </div>
    </div>
  );
}
