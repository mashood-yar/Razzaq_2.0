import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart/cart-page-content";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Your Cart",
  description: "Review your RazzaqLuxe selections and proceed to secure checkout.",
  path: "/cart",
  noIndex: true,
});

export default function CartPage() {
  return <CartPageContent />;
}
