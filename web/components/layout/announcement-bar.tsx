"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ANNOUNCEMENT_DISMISS_KEY } from "@/lib/banner-constants";

const MESSAGES = [
  "Free delivery on orders above PKR 5,000",
  "New arrivals — explore the collection",
  "Use code RAZZAQ10 for 10% off your first order",
];

const ROTATE_MS = 4000;

export function useAnnouncementDismissed() {
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    setDismissed(sessionStorage.getItem(ANNOUNCEMENT_DISMISS_KEY) === "1");
  }, []);
  return { dismissed, setDismissed };
}

type AnnouncementBarProps = {
  dismissed: boolean;
  onDismiss: () => void;
};

export function AnnouncementBar({ dismissed, onDismiss }: AnnouncementBarProps) {
  const pathname = usePathname();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (dismissed) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [dismissed]);

  const dismiss = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      sessionStorage.setItem(ANNOUNCEMENT_DISMISS_KEY, "1");
      onDismiss();
    },
    [onDismiss],
  );

  if (pathname?.startsWith("/admin") || dismissed) return null;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      className="fixed inset-x-0 top-0 z-[60] bg-[#0F4C75] text-[#BBE1FA]"
      role="region"
      aria-label="Store announcements"
    >
      <Link
        href="/shop"
        className="group flex min-h-9 items-center justify-center gap-2 px-10 py-2 text-center text-sm font-medium transition-opacity hover:opacity-90"
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="font-body [&_strong]:text-gold-light"
          >
            {MESSAGES[index].includes("RAZZAQ10") ? (
              <>
                Use code <span className="font-semibold text-gold-light">RAZZAQ10</span> for 10%
                off your first order
              </>
            ) : (
              MESSAGES[index]
            )}
          </motion.span>
        </AnimatePresence>
      </Link>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[#F3F4F1]/80 transition-colors hover:bg-white/10 hover:text-[#F3F4F1]"
        aria-label="Dismiss announcements"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
