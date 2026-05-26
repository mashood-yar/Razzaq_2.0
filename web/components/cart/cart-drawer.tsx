"use client";

import { SafeProductImage } from "@/components/product/safe-product-image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
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
        // Override default close button in SheetContent, handled manually below
        hideClose
      >
        {/* Header */}
        <SheetHeader className="h-[56px] border-b border-[var(--border-fine)] px-5 flex flex-row items-center justify-between space-y-0 relative z-10 shrink-0">
          <div className="flex items-center gap-2">
            <SheetTitle className="font-body font-semibold text-[10px] tracking-[0.4em] text-[var(--cream-muted)] uppercase">
              YOUR CART
            </SheetTitle>
            <span className="font-body font-light text-[10px] text-[var(--cream-ghost)]">({itemCount} items)</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-[48px] h-[48px] flex items-center justify-end text-[var(--cream-ghost)] hover:text-[var(--gold-warm)] transition-colors"
            aria-label="Close cart"
          >
            <X className="w-5 h-5" />
          </button>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <EmptyCartCta onNavigate={() => setOpen(false)} />
          </div>
        ) : (
          <>
            {/* Scrollable Items */}
            <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-6">
              <ShippingProgress subtotal={sub} className="mb-8" />
              
              <ul className="flex flex-col gap-6">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4">
                    {/* Image */}
                    <div className="relative h-[88px] w-[72px] shrink-0 overflow-hidden rounded-[4px] bg-[var(--bg-dusk)] border border-[var(--border-fine)]">
                      <SafeProductImage
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="72px"
                      />
                    </div>
                    
                    {/* Details Grouped */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex flex-col min-w-0 pr-2">
                          <p className="font-display font-semibold text-[1rem] text-[var(--cream-bone)] leading-tight truncate">
                            {item.name}
                          </p>
                          {item.variantLabel && (
                            <p className="font-body font-light text-[12px] text-[var(--cream-ghost)] mt-1 truncate">
                              {item.variantLabel}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          className="flex h-[32px] w-[32px] items-center justify-center rounded-[2px] text-[var(--cream-ghost)]/60 hover:text-[var(--gold-warm)] transition-colors shrink-0"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <p className="font-body font-semibold text-[0.9375rem] text-[var(--gold-warm)] mt-auto mb-3">
                        {formatPKR(item.price)}
                      </p>
                      
                      {/* Qty Controls */}
                      <div className="flex items-center h-[32px] w-fit rounded-[2px] border border-[var(--border-fine)] bg-[var(--bg-dusk)]">
                        <button
                          className="flex h-[32px] w-[32px] items-center justify-center text-[var(--cream-muted)] hover:text-[var(--gold-warm)] transition-colors"
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-body text-[13px] text-[var(--cream-bone)]">
                          {item.quantity}
                        </span>
                        <button
                          className="flex h-[32px] w-[32px] items-center justify-center text-[var(--cream-muted)] hover:text-[var(--gold-warm)] transition-colors"
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Sticky Area */}
            <div className="border-t border-[var(--border-fine)] bg-[var(--bg-obsidian)] p-5 pb-[env(safe-area-inset-bottom,20px)] flex flex-col gap-5 shrink-0 z-10">
              <div className="flex justify-between items-center">
                <span className="font-body font-semibold text-[10px] tracking-[0.3em] text-[var(--cream-ghost)] uppercase">
                  SUBTOTAL
                </span>
                <span className="font-body font-bold text-[1.125rem] text-[var(--gold-warm)]">
                  {formatPKR(sub)}
                </span>
              </div>
              
              <Link 
                href="/checkout" 
                className="flex items-center justify-center w-full h-[52px] bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-semibold text-[11px] tracking-[0.2em] rounded-[2px] transition-colors hover:bg-[var(--gold-bright)]"
                onClick={() => setOpen(false)}
              >
                PROCEED TO CHECKOUT →
              </Link>
              
              <button 
                onClick={() => setOpen(false)}
                className="font-body font-light text-[13px] text-[var(--cream-muted)] text-center hover:text-[var(--cream-bone)] transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
