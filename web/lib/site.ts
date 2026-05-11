export const siteConfig = {
  name: "Razzaq Luxe",
  titleTemplate: "%s · Razzaq Luxe",
  description:
    "Razzaq Luxe — luxury fragrances from Quetta, Pakistan. Sporty, Habibi, Flourine, Khan\u2019s Aura. Shop online or visit our boutique.",
  ogImage: "/og.jpg",
  twitterHandle: "@razzaqluxe",
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
