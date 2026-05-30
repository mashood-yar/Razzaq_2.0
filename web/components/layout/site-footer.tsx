"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FooterPaymentMethods } from "@/components/layout/footer-payment-methods";
import { TrustBadges } from "@/components/layout/trust-badges";
import { siteConfig } from "@/lib/site";

const footerNav = {
  shop: [
    { href: "/shop", label: "All Products" },
    { href: "/highlights", label: "Highlights" },
    { href: "/shop?category=fragrances", label: "Fragrances" },
    { href: "/shop?category=lawn", label: "Lawn" },
    { href: "/shop?category=formal", label: "Formal" },
  ],
  account: [
    { href: "/account", label: "My Account" },
    { href: "/account/orders", label: "Orders" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/cart", label: "Cart" },
  ],
  company: [
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/policies/shipping-policy", label: "Shipping" },
    { href: "/policies/return-policy", label: "Returns" },
  ],
  legal: [
    { href: "/policies/privacy-policy", label: "Privacy Policy" },
    { href: "/policies/terms-of-service", label: "Terms of Service" },
  ],
};

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-border bg-ocean-deep section-alt">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <TrustBadges className="mb-10" />
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="font-display text-2xl font-semibold text-gold">
              {siteConfig.name}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Boutique luxury fragrances — Sporty, Habibi, Flourine, Khan&apos;s Aura. Rooted in
              Quetta, shipped nationwide.
            </p>
            <div className="mt-6 space-y-1 text-xs text-muted-foreground">
              <p>sultanbarak77@gmail.com</p>
              <p>Sat–Thu · 10 AM – 8 PM PKT</p>
              <p>Quetta, Balochistan · Pakistan</p>
            </div>
          </div>

          {Object.entries({
            Shop: footerNav.shop,
            Account: footerNav.account,
            Company: footerNav.company,
          }).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {heading}
              </p>
              <ul className="mt-4 space-y-2">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-ocean-light/80 transition-colors hover:text-ocean-light"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}{" "}
            <span className="font-display text-gold">{siteConfig.name}</span>. All rights
            reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {footerNav.legal.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <FooterPaymentMethods />
        </div>
      </div>
    </footer>
  );
}
