export const siteConfig = {
  name: "RazzaqLuxe",
  defaultTitle: "RazzaqLuxe — Premium Pakistani Fragrances & Luxury Lifestyle",
  titleTemplate: "%s | RazzaqLuxe",
  description:
    "Discover handcrafted oud, attar, and niche luxury fragrances from Pakistan. RazzaqLuxe delivers premium Pakistani perfumery nationwide — Sporty, Habibi, Flourine, and Khan\u2019s Aura.",
  ogImage: "/images/default-og.jpg",
  twitterHandle: "@razzaqluxe",
  keywords: [
    "razzaqluxe",
    "luxury fragrances pakistan",
    "pakistani oud",
    "attar pakistan",
    "niche perfumery",
    "luxury lifestyle pakistan",
    "quetta fragrance house",
  ],
};

export function getSiteUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/** Public site origin for server-only redirects (Safepay/Stripe URLs). No trailing slash. */
export function getServerSiteOrigin() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}
