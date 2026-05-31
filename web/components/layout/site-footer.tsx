"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrustBadges } from "@/components/layout/trust-badges";
import { MessageCircle } from "lucide-react";

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
    <footer className="relative overflow-hidden border-t border-border bg-noir">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.02]">
        <span className="font-display text-[15vw] whitespace-nowrap text-foreground leading-none">
          RAZZAQ LUXE
        </span>
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-5 py-16 pb-10 sm:px-6">
        <TrustBadges className="mb-12" />
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-10">
          <div className="col-span-2 md:col-span-1">
            <p className="font-display text-sm italic uppercase tracking-[0.3em] text-foreground">
              Razzaq Luxe
            </p>
            <p className="mt-1 text-[11px] tracking-[0.15em] text-muted-foreground">
              Quetta, Pakistan · Since 2020
            </p>
            <p className="mt-6 max-w-[220px] text-[13px] font-light leading-relaxed text-muted-foreground">
              Boutique luxury fragrances — Sporty, Habibi, Flourine, Khan&apos;s Aura. Rooted in
              Quetta, shipped nationwide.
            </p>
            
            <div className="flex flex-col gap-1 text-[12px] font-light text-[var(--cream-ghost)] mb-6">
              <p>sultanbarak77@gmail.com</p>
              <p>Sat–Thu · 10 AM – 8 PM PKT</p>
              <p>Quetta, Balochistan · Pakistan</p>
            </div>

            <div className="flex gap-4">
              <a href="#" aria-label="Instagram" className="text-[var(--cream-ghost)] hover:text-[var(--gold-warm)] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a href="#" aria-label="WhatsApp" className="text-[var(--cream-ghost)] hover:text-[var(--gold-warm)] transition-colors">
                <MessageCircle className="h-[20px] w-[20px]" />
              </a>
            </div>
          </div>

          {/* Nav Columns */}
          {Object.entries({
            Shop: footerNav.shop,
            Account: footerNav.account,
            Company: footerNav.company,
          }).map(([heading, links]) => (
            <div key={heading}>
              <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
                {heading}
              </p>
              <ul className="mt-5 space-y-3.5">
                {links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[13px] tracking-wide text-muted-foreground transition-colors hover:text-gold-bright"
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
          <p className="text-[10px] tracking-wider text-[#4A4640]">
            © {new Date().getFullYear()}{" "}
            <span className="font-display italic text-gold-bright">Razzaq Luxe</span>. All rights
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
        </div>
      </div>
    </footer>
  );
}
