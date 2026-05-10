"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  useCartStore,
  cartSubtotal,
  cartShipping,
  cartTotal,
  formatPKR,
} from "@/stores/cart-store";

export function CartPageContent() {
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const applyPromo = useCartStore((s) => s.applyPromo);
  const removePromo = useCartStore((s) => s.removePromo);
  const promoCode = useCartStore((s) => s.promoCode);
  const promoDiscount = useCartStore((s) => s.promoDiscount);

  const [codeInput, setCodeInput] = useState("");
  const [promoMsg, setPromoMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);

  const sub = cartSubtotal(items);
  const shipping = cartShipping(sub, promoCode);
  const total = cartTotal(sub, promoDiscount, shipping);

  async function tryPromo(e: React.FormEvent) {
    e.preventDefault();
    if (!codeInput) return;
    setPromoLoading(true);
    setPromoMsg(null);

    try {
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeInput, orderAmount: sub }),
      });
      const data = await res.json();
      if (data.valid) {
        applyPromo(codeInput.toUpperCase(), data.discountAmount ?? 0);
        setPromoMsg({ type: "success", text: `Code applied — saving ${formatPKR(data.discountAmount)}` });
        setCodeInput("");
      } else {
        setPromoMsg({ type: "error", text: data.error ?? "Invalid code" });
      }
    } catch {
      setPromoMsg({ type: "error", text: "Failed to validate code" });
    } finally {
      setPromoLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 lg:grid-cols-3 lg:px-8">
      <div className="lg:col-span-2">
        <h1 className="font-display text-4xl text-ivory">Your Bag</h1>
        {items.length === 0 ? (
          <p className="mt-8 text-smoke">
            Your bag is empty.{" "}
            <Link href="/shop" className="text-gold underline">
              Continue shopping
            </Link>
          </p>
        ) : (
          <ul className="mt-10 space-y-6">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex gap-6 rounded-xl border border-graphite bg-charcoal/40 p-4 backdrop-blur-sm"
              >
                <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="h-full w-full bg-graphite" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ivory">{item.name}</p>
                  {item.variantLabel && (
                    <p className="text-sm text-smoke">{item.variantLabel}</p>
                  )}
                  <p className="mt-2 text-gold">{formatPKR(item.price)}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded border border-graphite p-1.5 hover:bg-graphite"
                      aria-label="Decrease"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center tabular-nums text-ivory">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="rounded border border-graphite p-1.5 hover:bg-graphite"
                      aria-label="Increase"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      className="ml-auto text-smoke hover:text-error"
                      aria-label="Remove"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="h-fit rounded-2xl border border-graphite bg-charcoal/60 p-6 backdrop-blur-md lg:sticky lg:top-28">
        <h2 className="font-display text-xl text-ivory">Summary</h2>
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-smoke">Subtotal</span>
            <span className="text-ivory">{formatPKR(sub)}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount ({promoCode})</span>
              <span>− {formatPKR(promoDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-smoke">Shipping</span>
            <span className="text-ivory">
              {shipping === 0 ? "Free" : formatPKR(shipping)}
            </span>
          </div>
          <Separator className="bg-graphite" />
          <div className="flex justify-between text-lg font-medium">
            <span className="text-ivory">Total</span>
            <span className="text-gold">{formatPKR(total)}</span>
          </div>
        </div>

        <form className="mt-8 space-y-3" onSubmit={tryPromo}>
          <label className="sr-only" htmlFor="promo">Promo code</label>
          <div className="flex gap-2">
            <Input
              id="promo"
              placeholder="Promo code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              disabled={!!promoCode}
              className="uppercase"
            />
            {promoCode ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => { removePromo(); setPromoMsg(null); }}
              >
                Remove
              </Button>
            ) : (
              <Button type="submit" variant="secondary" disabled={promoLoading}>
                {promoLoading ? "…" : "Apply"}
              </Button>
            )}
          </div>
          {promoMsg && (
            <p className={`text-xs ${promoMsg.type === "success" ? "text-success" : "text-error"}`}>
              {promoMsg.text}
            </p>
          )}
        </form>

        <Button
          asChild
          className="mt-8 w-full"
          size="lg"
          disabled={items.length === 0}
        >
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
      </aside>
    </div>
  );
}
