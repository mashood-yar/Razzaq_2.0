"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FooterPaymentMethods } from "@/components/layout/footer-payment-methods";
import { siteConfig } from "@/lib/site";

const footerNav = {
  shop: [
    { href: "/shop", label: "All Fragrances" },
    { href: "/shop", label: "Best Sellers" },
    { href: "/shop?sort=new", label: "New Arrivals" },
    { href: "/highlights", label: "Highlights" },
  ],
  company: [
    { href: "/about", label: "Our Story" },
    { href: "/contact", label: "Contact" },
    { href: "/policies/return-policy", label: "Returns" },
    { href: "/account/orders", label: "Track Order" },
  ],
  legal: [
    { href: "/policies/privacy-policy", label: "Privacy Policy" },
    { href: "/policies/terms-of-service", label: "Terms of Service" },
    { href: "/policies/shipping-policy", label: "Shipping Policy" },
  ],
};

const socialLinks = [
  { href: "https://instagram.com/razzaqluxe", label: "Instagram" },
  { href: "https://tiktok.com/@razzaqluxe", label: "TikTok" },
  { href: "https://facebook.com/razzaqluxe", label: "Facebook" },
];

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-border bg-noir pb-safe">
      <div className="mx-auto max-w-4xl px-5 py-16 pb-10 sm:px-6">
        <Link
          href="/"
          className="font-display text-sm italic uppercase tracking-[0.3em] text-foreground transition-colors hover:text-gold-bright"
          aria-label={`${siteConfig.name} home`}
        >
          Razzaq Luxe
        </Link>
        <p className="mt-1 text-[11px] tracking-[0.15em] text-muted-foreground">
          Quetta, Pakistan
        </p>

        <div className="mt-10 grid grid-cols-2 gap-10 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-10">
          <div className="col-span-2 md:col-span-1">
            <p className="max-w-[220px] text-[13px] font-light leading-relaxed text-muted-foreground">
              A luxury fragrance house rooted in the scent traditions of Balochistan. Crafted with
              purpose. Worn with intention.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-gold-bright"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Shop
            </p>
            <ul className="mt-5 space-y-3.5">
              {footerNav.shop.map((l) => (
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

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Company
            </p>
            <ul className="mt-5 space-y-3.5">
              {footerNav.company.map((l) => (
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

          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Legal
            </p>
            <ul className="mt-5 space-y-3.5">
              {footerNav.legal.map((l) => (
                <li key={l.href}>
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
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-[10px] tracking-wider text-[#4A4640]">
            © {new Date().getFullYear()} Razzaq Luxe. All rights reserved. Quetta, Pakistan.
          </p>
          <FooterPaymentMethods />
        </div>
      </div>
    </footer>
  );
}
