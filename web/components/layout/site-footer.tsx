"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrustBadges } from "@/components/layout/trust-badges";
import { MessageCircle } from "lucide-react";

const footerNav = {
  shop: [
    { href: "/shop", label: "All Products" },
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
};

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="relative overflow-hidden bg-[var(--bg-void)] border-t border-[var(--border-fine)] pt-24 pb-32 lg:pb-12">
      {/* Decorative Watermark */}
      <div 
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center"
        aria-hidden="true"
      >
        <span className="font-display font-bold text-[clamp(4rem,15vw,12rem)] text-[var(--cream-bone)] opacity-[0.02] whitespace-nowrap">
          RAZZAQ LUXE
        </span>
      </div>

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 sm:px-12 lg:px-24">
        {/* Content Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-24">
          
          {/* Column 1: Brand Info */}
          <div className="col-span-2 flex flex-col">
            <p className="font-display text-[20px] font-medium text-[var(--gold-warm)] mb-4">
              Razzaq Luxe
            </p>
            <p className="font-body text-[13px] font-light text-[var(--cream-muted)] max-w-[220px] leading-[1.7] mb-8">
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
            <div key={heading} className="flex flex-col">
              <h3 className="font-body text-[10px] font-semibold tracking-[0.32em] text-[var(--cream-ghost)] uppercase mb-6">
                {heading}
              </h3>
              <ul className="flex flex-col gap-[10px]">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-body text-[13px] font-light text-[var(--cream-warm)] hover:text-[var(--cream-bone)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between border-t border-[var(--border-fine)] py-[24px] gap-8 lg:gap-0">
          
          {/* Left: Trust Badges */}
          <div className="w-full lg:w-auto opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
             <TrustBadges className="mb-0" />
          </div>

          {/* Right: Copyright & Legal */}
          <div className="flex items-center gap-[16px] font-body text-[12px] font-light text-[var(--cream-ghost)] w-full lg:w-auto justify-center lg:justify-end">
            <p>© {new Date().getFullYear()} Razzaq Luxe</p>
            <span className="opacity-30">·</span>
            <Link href="/policies/privacy-policy" className="hover:text-[var(--cream-bone)] transition-colors">
              Privacy
            </Link>
            <span className="opacity-30">·</span>
            <Link href="/policies/terms-of-service" className="hover:text-[var(--cream-bone)] transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
