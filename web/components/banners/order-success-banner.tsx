"use client";

import Link from "next/link";
import { MessageCircle, Package, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type OrderSuccessBannerProps = {
  orderId?: string;
};

function buildWhatsAppShareUrl(orderId?: string) {
  const text = orderId
    ? `I just placed an order with Razzaq Luxe! Order #${orderId.slice(0, 8).toUpperCase()}`
    : "I just shopped at Razzaq Luxe — luxury fragrances from Pakistan.";
  const encoded = encodeURIComponent(text);
  const phone =
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE?.replace(/\D/g, "") ?? "";
  if (phone) return `https://wa.me/${phone}?text=${encoded}`;
  return `https://wa.me/?text=${encoded}`;
}

export function OrderSuccessBanner({ orderId }: OrderSuccessBannerProps) {
  const displayId = orderId
    ? orderId.slice(0, 8).toUpperCase()
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="order-success-confetti relative overflow-hidden rounded-[2rem] border border-border bg-[#1B262C] px-6 py-12 text-center sm:px-10"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${8 + (i * 7) % 85}%`,
              animationDelay: `${i * 0.12}s`,
              backgroundColor: i % 3 === 0 ? "#0F4C75" : i % 3 === 1 ? "#3282B8" : "#B8961E",
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        <motion.p
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-xs font-semibold uppercase tracking-[0.35em] text-[#0F4C75]"
        >
          Order confirmed
        </motion.p>
        <h1 className="mt-4 font-display text-3xl text-foreground sm:text-4xl">
          Thank you for choosing Razzaq Luxe
        </h1>
        {displayId && (
          <p className="mt-4 text-sm text-muted-foreground">
            Order number{" "}
            <span className="font-display text-lg font-semibold text-gold">#{displayId}</span>
          </p>
        )}
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
          We&apos;re preparing your parcel with care. Estimated delivery via{" "}
          <span className="font-medium text-foreground">TCS</span> in 3–5 business days across
          Pakistan.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          {orderId && (
            <Button asChild size="lg" className="gap-2">
              <Link href={`/order/${orderId}`}>
                <Package className="h-4 w-4" aria-hidden />
                Track order
              </Link>
            </Button>
          )}
          <Button asChild variant="secondary" size="lg" className="gap-2">
            <Link href="/shop">
              <ShoppingBag className="h-4 w-4" aria-hidden />
              Continue shopping
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <a
              href={buildWhatsAppShareUrl(orderId)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Share on WhatsApp
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
