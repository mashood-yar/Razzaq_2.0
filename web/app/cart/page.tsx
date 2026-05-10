import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/cart-page-content";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your LUMINA bag — adjust quantities and proceed to checkout.",
};

export default function CartPage() {
  return <CartPageContent />;
}
