"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

type OrderSuccessBannerProps = {
  orderId?: string;
};

function buildWhatsAppShareUrl(orderId?: string) {
  const text = orderId
    ? `Hi Razzaq Luxe, I have a question about my order #${orderId.slice(0, 8).toUpperCase()}`
    : "Hi Razzaq Luxe, I have a question about my order.";
  const encoded = encodeURIComponent(text);
  const phone =
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_PHONE?.replace(/\D/g, "") ?? "";
  if (phone) return `https://wa.me/${phone}?text=${encoded}`;
  return `https://wa.me/?text=${encoded}`;
}

export function OrderSuccessBanner({ orderId }: OrderSuccessBannerProps) {
  const displayId = orderId
    ? orderId.slice(0, 8).toUpperCase()
    : "PENDING";

  return (
    <div className="flex flex-col items-center text-center">
      {/* Animated Checkmark */}
      <div className="relative w-[120px] h-[120px] mb-12 flex items-center justify-center">
        <motion.svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          className="absolute inset-0"
        >
          <motion.circle
            cx="60"
            cy="60"
            r="58"
            fill="transparent"
            stroke="var(--gold-warm)"
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0, scale: 0.5 }}
            animate={{ pathLength: 1, opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.6, ease: "easeOut" }}
          />
          <motion.path
            d="M38 60 L54 76 L82 44"
            fill="transparent"
            stroke="var(--gold-warm)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </motion.svg>
      </div>

      <motion.h1 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="font-display italic font-light text-[var(--type-display)] text-[var(--cream-bone)] mb-4"
      >
        Your order is on its way.
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="font-body font-light text-[15px] text-[var(--cream-muted)] mb-10"
      >
        Order #{displayId} <span className="opacity-40 mx-2">·</span> Confirmation sent to your email.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="w-full h-[1px] bg-[var(--border-fine)] mb-10" 
      />

      {/* Next Steps */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="flex flex-col gap-6 text-left w-full mb-12"
      >
        <div className="flex items-start gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold-warm)] mt-2 shrink-0" />
          <p className="font-body font-light text-[14px] text-[var(--cream-warm)]">
            You'll receive a WhatsApp notification when your order ships.
          </p>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold-warm)] mt-2 shrink-0" />
          <p className="font-body font-light text-[14px] text-[var(--cream-warm)]">
            Track your order anytime from My Account.
          </p>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold-warm)] mt-2 shrink-0" />
          <a href={buildWhatsAppShareUrl(orderId)} target="_blank" rel="noreferrer" className="font-body font-light text-[14px] text-[var(--cream-warm)] flex items-center gap-2 hover:text-[var(--gold-warm)] transition-colors">
            Questions? Chat with us on WhatsApp <MessageCircle className="w-3.5 h-3.5" />
          </a>
        </div>
      </motion.div>

      {/* CTAs */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex flex-col gap-5 w-full items-center"
      >
        <Link 
          href="/shop" 
          className="flex items-center justify-center w-full h-[52px] border border-[var(--cream-bone)] text-[var(--cream-bone)] font-body font-semibold text-[11px] tracking-[0.2em] rounded-[2px] transition-colors hover:bg-[var(--cream-bone)] hover:text-[var(--bg-void)]"
        >
          CONTINUE SHOPPING
        </Link>
        {orderId && (
          <Link 
            href={`/order/${orderId}`}
            className="font-body font-light text-[13px] text-[var(--cream-muted)] hover:text-[var(--gold-warm)] transition-colors mt-2"
          >
            VIEW MY ORDER
          </Link>
        )}
      </motion.div>
    </div>
  );
}
