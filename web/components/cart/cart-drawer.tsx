"use client";

import { SafeProductImage } from "@/components/product/safe-product-image";
import Link from "next/link";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUiStore } from "@/stores/ui-store";
import {
  useCartStore,
  cartSubtotal,
  formatPKR,
} from "@/stores/cart-store";
import { EmptyCartCta } from "@/components/cart/empty-cart-cta";
import { ShippingProgress } from "@/components/cart/shipping-progress";

// ─── Spring for snappy item removal/addition animations ──────────────────────
const itemSpring = { type: "spring", stiffness: 400, damping: 35 };

export function CartDrawer() {
  const open = useUiStore((s) => s.cartOpen);
  const setOpen = useUiStore((s) => s.setCartOpen);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const sub = cartSubtotal(items);
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col bg-[var(--bg-obsidian)] border-l border-[var(--border-fine)] p-0 sm:max-w-[420px]"
        hideClose
      >
        {/* ── Header — Law of Proximity: title + count grouped, close on far right */}
        <SheetHeader className="h-[60px] border-b border-[var(--border-fine)] px-5 flex flex-row items-center justify-between space-y-0 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-[var(--gold-warm)]" />
            <SheetTitle className="font-body font-semibold text-[11px] tracking-[0.4em] text-[var(--cream-muted)] uppercase">
              YOUR CART
            </SheetTitle>
            {/* Animated item count badge — Doherty Threshold: instant feedback */}
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={itemSpring}
                  className="w-[20px] h-[20px] rounded-full bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-bold text-[10px] flex items-center justify-center leading-none"
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          {/* Fitts's Law: generous 48px close target */}
          <button
            onClick={() => setOpen(false)}
            className="w-[48px] h-[48px] flex items-center justify-end text-[var(--cream-ghost)] hover:text-[var(--cream-bone)] transition-colors active:scale-95"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </SheetHeader>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center"
            >
              <EmptyCartCta onNavigate={() => setOpen(false)} />
            </motion.div>
          ) : (
            <motion.div
              key="filled"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col flex-1 min-h-0"
            >
              {/* Scrollable Items */}
              <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-5">
                <ShippingProgress subtotal={sub} className="mb-6" />

                {/* ── Item list with layout animations — Doherty Threshold */}
                <motion.ul className="flex flex-col gap-0" layout>
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 24, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: "auto" }}
                        exit={{ opacity: 0, x: -24, height: 0, marginBottom: 0 }}
                        transition={{ ...itemSpring, opacity: { duration: 0.2 } }}
                        className="overflow-hidden"
                      >
                        {/* ── Item card — Law of Proximity: visual card groups item data */}
                        <div className="flex gap-4 py-4 border-b border-[var(--border-fine)] last:border-b-0">
                          {/* Product Image */}
                          <div className="relative h-[90px] w-[72px] shrink-0 overflow-hidden rounded-[4px] bg-[var(--bg-dusk)] border border-[var(--border-fine)]">
                            <SafeProductImage
                              src={item.imageUrl}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="72px"
                            />
                          </div>

                          {/* Item Details */}
                          <div className="flex flex-col flex-1 min-w-0">
                            {/* Name + Remove — Law of Proximity: closely grouped */}
                            <div className="flex justify-between items-start mb-1.5">
                              <div className="flex flex-col min-w-0 pr-2">
                                <p className="font-display font-semibold text-[0.9375rem] text-[var(--cream-bone)] leading-tight truncate">
                                  {item.name}
                                </p>
                                {item.variantLabel && (
                                  <p className="font-body font-light text-[11px] text-[var(--cream-ghost)] mt-0.5">
                                    {item.variantLabel}
                                  </p>
                                )}
                              </div>
                              {/* Fitts's Law: 36px remove target with clear hit-zone */}
                              <button
                                type="button"
                                className="flex h-[32px] w-[32px] items-center justify-center rounded-full text-[var(--cream-ghost)]/50 hover:text-[var(--ember)] hover:bg-[var(--ember)]/10 transition-all duration-200 shrink-0"
                                aria-label={`Remove ${item.name}`}
                                onClick={() => removeItem(item.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Price — Law of Similarity: gold = price throughout site */}
                            <p className="font-body font-bold text-[0.9375rem] text-[var(--gold-warm)] mb-3">
                              {formatPKR(item.price * item.quantity)}
                              {item.quantity > 1 && (
                                <span className="font-light text-[12px] text-[var(--cream-ghost)] ml-1.5">
                                  ({formatPKR(item.price)} each)
                                </span>
                              )}
                            </p>

                            {/* Qty Controls — Fitts's Law: 36px minimum touch target */}
                            <div className="flex items-center h-[36px] w-fit rounded-full border border-[var(--border-mid)] bg-[var(--bg-dusk)] overflow-hidden">
                              <button
                                className="flex h-full w-[36px] items-center justify-center text-[var(--cream-muted)] hover:text-[var(--gold-warm)] hover:bg-[var(--bg-stone)] transition-all duration-150 active:scale-90"
                                onClick={() => setQuantity(item.id, item.quantity - 1)}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <motion.span
                                key={item.quantity}
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.15 }}
                                className="w-8 text-center font-body font-semibold text-[13px] text-[var(--cream-bone)]"
                              >
                                {item.quantity}
                              </motion.span>
                              <button
                                className="flex h-full w-[36px] items-center justify-center text-[var(--cream-muted)] hover:text-[var(--gold-warm)] hover:bg-[var(--bg-stone)] transition-all duration-150 active:scale-90"
                                onClick={() => setQuantity(item.id, item.quantity + 1)}
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              </div>

              {/* ── Bottom Sticky CTA — Jakob's Law: expected checkout pattern */}
              <div className="border-t border-[var(--border-fine)] bg-[var(--bg-obsidian)] p-5 pb-[max(20px,env(safe-area-inset-bottom))] flex flex-col gap-4 shrink-0">
                {/* Subtotal row */}
                <div className="flex justify-between items-center">
                  <span className="font-body font-medium text-[13px] text-[var(--cream-muted)]">
                    Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
                  </span>
                  <motion.span
                    key={sub}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-body font-bold text-[1.125rem] text-[var(--gold-warm)]"
                  >
                    {formatPKR(sub)}
                  </motion.span>
                </div>

                {/* Checkout CTA */}
                <Link
                  href="/checkout"
                  className="flex items-center justify-center w-full h-[52px] bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-bold text-[11px] tracking-[0.25em] rounded-full transition-all duration-200 hover:bg-[var(--gold-bright)] active:scale-[0.98] shadow-[0_0_30px_rgba(201,160,80,0.2)] hover:shadow-[0_0_40px_rgba(201,160,80,0.35)]"
                  onClick={() => setOpen(false)}
                >
                  PROCEED TO CHECKOUT →
                </Link>

                <button
                  onClick={() => setOpen(false)}
                  className="font-body font-light text-[12px] tracking-[0.15em] text-[var(--cream-muted)] text-center hover:text-[var(--cream-bone)] transition-colors uppercase"
                >
                  Continue Shopping
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
