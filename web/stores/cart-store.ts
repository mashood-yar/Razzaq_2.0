"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;             // variant id or product id
  productId: string;
  variantId?: string;
  name: string;
  variantLabel?: string;  // e.g. "Black / M"
  imageUrl: string;
  price: number;          // PKR
  quantity: number;
}

type CartState = {
  items: CartItem[];
  promoCode: string | null;
  promoDiscount: number;  // absolute PKR amount discounted
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyPromo: (code: string, discountAmount: number) => void;
  removePromo: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      promoDiscount: 0,

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i,
            ),
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      removeItem: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      setQuantity: (id, quantity) => {
        if (quantity < 1) {
          set({ items: get().items.filter((i) => i.id !== id) });
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity } : i,
          ),
        });
      },

      clearCart: () => set({ items: [], promoCode: null, promoDiscount: 0 }),

      applyPromo: (code, discountAmount) =>
        set({ promoCode: code, promoDiscount: discountAmount }),

      removePromo: () => set({ promoCode: null, promoDiscount: 0 }),
    }),
    {
      name: "razzaq-cart",
      skipHydration: true,
    },
  ),
);

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((n, i) => n + i.quantity, 0);
}

export function cartShipping(subtotal: number, promoCode: string | null): number {
  if (promoCode === "FREESHIP") return 0;
  if (subtotal >= 5000) return 0;
  return 250;
}

export function cartTotal(
  subtotal: number,
  promoDiscount: number,
  shippingCost: number,
): number {
  return Math.max(0, subtotal - promoDiscount) + shippingCost;
}

export function formatPKR(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
}
