import type { Metadata } from "next";
import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Saved LUMINA fragrances — move favorites to your bag.",
};

export default function WishlistPage() {
  return <WishlistView />;
}
