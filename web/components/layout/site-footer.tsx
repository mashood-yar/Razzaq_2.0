import Link from "next/link";
import { FooterPaymentMethods } from "@/components/layout/footer-payment-methods";
import { siteConfig } from "@/lib/site";

const footerNav = {
  shop: [
    { href: "/shop",                   label: "All Products" },
    { href: "/shop?category=fragrances", label: "Fragrances" },
    { href: "/shop?category=lawn",       label: "Lawn" },
    { href: "/shop?category=formal",     label: "Formal" },
    { href: "/collections",              label: "Collections" },
  ],
  account: [
    { href: "/account",          label: "My Account" },
    { href: "/account/orders",   label: "Orders" },
    { href: "/wishlist", label: "Wishlist" },
    { href: "/cart",             label: "Cart" },
  ],
  company: [
    { href: "/about",   label: "About" },
    { href: "/contact", label: "Contact" },
    { href: "/policies/shipping-policy", label: "Shipping" },
    { href: "/policies/return-policy",   label: "Returns" },
  ],
  legal: [
    { href: "/policies/privacy-policy",  label: "Privacy Policy" },
    { href: "/policies/terms-of-service",label: "Terms of Service" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-graphite bg-charcoal/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="font-display text-2xl italic tracking-wide text-luxe-gold">
              {siteConfig.name}
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-smoke">
              Boutique luxury fragrances — Sporty, Habibi, Flourine, Khan&apos;s Aura. Rooted in Quetta,
              shipped nationwide.
            </p>
            <div className="mt-6 space-y-1 text-xs text-smoke">
              <p>sultanbarak77@gmail.com</p>
              <p>Sat–Thu · 10 AM – 8 PM PKT</p>
              <p>Quetta, Balochistan · Pakistan</p>
            </div>
          </div>

          {Object.entries({ Shop: footerNav.shop, Account: footerNav.account, Company: footerNav.company }).map(
            ([heading, links]) => (
              <div key={heading}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                  {heading}
                </p>
                <ul className="mt-4 space-y-2">
                  {links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-smoke transition-colors hover:text-ivory"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-graphite pt-8 md:flex-row">
          <p className="text-xs text-ash">
            © {new Date().getFullYear()}{" "}
            <span className="text-luxe-gold">{siteConfig.name}</span>. All rights
            reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            {footerNav.legal.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-ash transition-colors hover:text-smoke"
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
