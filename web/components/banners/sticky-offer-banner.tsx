"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { STICKY_OFFER_DISMISS_KEY } from "@/lib/banner-constants";

const EXCLUDED_PREFIXES = ["/admin", "/checkout", "/cart"];

function isEligiblePath(pathname: string | null): boolean {
  if (!pathname) return false;
  if (EXCLUDED_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  return pathname === "/shop" || pathname.startsWith("/shop/") || pathname.startsWith("/products/");
}

export function StickyOfferBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(STICKY_OFFER_DISMISS_KEY) === "1");
  }, []);

  useEffect(() => {
    if (!isEligiblePath(pathname) || dismissed) {
      setVisible(false);
      return;
    }

    function onScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (max <= 0) {
        setVisible(false);
        return;
      }
      const ratio = doc.scrollTop / max;
      setVisible(ratio >= 0.6);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname, dismissed]);

  const dismiss = useCallback(() => {
    sessionStorage.setItem(STICKY_OFFER_DISMISS_KEY, "1");
    setDismissed(true);
    setVisible(false);
  }, []);

  if (!isEligiblePath(pathname) || dismissed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
          className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-lg sm:inset-x-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2"
          role="complementary"
          aria-label="Special offer"
        >
          <motion.div
            className="flex items-center gap-3 rounded-2xl border border-[#1B3A4B]/40 bg-[#1B262C] px-4 py-3 shadow-2xl sm:px-5"
            whileHover={{ scale: 1.01 }}
          >
            <div className="min-w-0 flex-1">
              <p className="font-display text-sm text-[#1B262C] sm:text-base">
                10% off your first order
              </p>
              <p className="text-xs text-[#1B3A4B]/90">
                Use code <span className="font-semibold text-gold">RAZZAQ10</span> at checkout
              </p>
            </div>
            <Link
              href="/shop"
              className="shrink-0 rounded-full bg-[#3282B8] px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-105 active:scale-95 sm:text-sm"
            >
              Shop now
            </Link>
            <button
              type="button"
              onClick={dismiss}
              className="shrink-0 rounded-full p-1.5 text-[#1B3A4B]/70 hover:bg-white/10 hover:text-[#1B262C]"
              aria-label="Dismiss offer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
