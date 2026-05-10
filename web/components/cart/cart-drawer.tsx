"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useUiStore } from "@/stores/ui-store";
import {
  useCartStore,
  cartSubtotal,
  cartShipping,
  cartTotal,
  formatPKR,
} from "@/stores/cart-store";

export function CartDrawer() {
  const open = useUiStore((s) => s.cartOpen);
  const setOpen = useUiStore((s) => s.setCartOpen);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const promoCode = useCartStore((s) => s.promoCode);
  const promoDiscount = useCartStore((s) => s.promoDiscount);

  const sub = cartSubtotal(items);
  const shipping = cartShipping(sub, promoCode);
  const total = cartTotal(sub, promoDiscount, shipping);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl tracking-wide">
            Your Bag ({items.reduce((n, i) => n + i.quantity, 0)})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12 text-center">
            <p className="font-display text-2xl italic text-muted-foreground">
              Your bag is empty.
            </p>
            <Button asChild variant="default">
              <Link href="/shop" onClick={() => setOpen(false)}>
                Explore Collection
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="-mr-2 flex-1 pr-3">
              <ul className="space-y-4 py-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-4 rounded-lg border border-graphite bg-charcoal/40 p-3"
                  >
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="h-full w-full bg-graphite" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-tight text-ivory">
                        {item.name}
                      </p>
                      {item.variantLabel && (
                        <p className="mt-1 text-xs text-smoke">
                          {item.variantLabel}
                        </p>
                      )}
                      <p className="mt-2 text-sm text-gold">
                        {formatPKR(item.price)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded border border-graphite p-1 hover:bg-graphite"
                          aria-label="Decrease quantity"
                          onClick={() => setQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="rounded border border-graphite p-1 hover:bg-graphite"
                          aria-label="Increase quantity"
                          onClick={() => setQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="ml-auto rounded p-1 text-muted-foreground hover:text-error"
                          aria-label={`Remove ${item.name}`}
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            <div className="space-y-4 border-t border-graphite pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-smoke">Subtotal</span>
                <span className="text-ivory">{formatPKR(sub)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-smoke">Discount ({promoCode})</span>
                  <span className="text-success">− {formatPKR(promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-smoke">Shipping</span>
                <span className="text-ivory">
                  {shipping === 0 ? "Free" : formatPKR(shipping)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span className="text-ivory">Total</span>
                <span className="text-gold">{formatPKR(total)}</span>
              </div>
              {sub < 5000 && (
                <p className="text-xs text-smoke">
                  Add {formatPKR(5000 - sub)} more for free standard shipping.
                </p>
              )}
              <Button asChild className="w-full" size="lg">
                <Link href="/checkout" onClick={() => setOpen(false)}>
                  Checkout
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/cart" onClick={() => setOpen(false)}>
                  View Full Cart
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
