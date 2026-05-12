"use client";

import dynamic from "next/dynamic";

const CartDrawer = dynamic(
  () =>
    import("@/components/cart/cart-drawer").then((m) => ({
      default: m.CartDrawer,
    })),
  { ssr: false },
);

const SearchModal = dynamic(
  () =>
    import("@/components/search/search-modal").then((m) => ({
      default: m.SearchModal,
    })),
  { ssr: false },
);

const AIBot = dynamic(
  () =>
    import("@/components/layout/ai-bot").then((m) => ({
      default: m.AIBot,
    })),
  { ssr: false },
);

/** Lazy-loaded shell widgets — splits JS off the critical path. */
export function DeferredChrome() {
  return (
    <>
      <CartDrawer />
      <SearchModal />
      <AIBot />
    </>
  );
}
