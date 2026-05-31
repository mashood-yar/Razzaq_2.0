"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Search,
  ShoppingCart,
  Heart,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import { useSession } from "@/lib/auth/use-session";
import {
  AccountAvatarGlyph,
  NavPersonOutlineIcon,
} from "@/components/layout/account-avatar-glyph";
import { HeaderAccountDropdown } from "@/components/layout/header-account-dropdown";
import {
  AnnouncementBar,
  useAnnouncementDismissed,
} from "@/components/layout/announcement-bar";

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/highlights", label: "Highlights" },
  { href: "/about", label: "About" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

function navLinkClass(pathname: string | null, href: string) {
  const active =
    pathname === href || (pathname?.startsWith(href + "/") ?? false);
  return cn(
    "text-[11px] font-medium uppercase tracking-[0.18em] transition-colors hover:text-gold-bright",
    active ? "text-gold-bright" : "text-text-secondary",
  );
}

function HeaderIconActions({
  itemCount,
  onSearch,
  onCart,
  className,
}: {
  itemCount: number;
  onSearch: () => void;
  onCart: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-0.5 sm:gap-1", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="text-text-secondary hover:text-gold-bright"
        aria-label="Search"
        onClick={onSearch}
      >
        <Search className="h-[18px] w-[18px]" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="text-text-secondary hover:text-gold-bright"
        asChild
      >
        <Link href="/wishlist" aria-label="Wishlist">
          <Heart className="h-[18px] w-[18px]" aria-hidden />
        </Link>
      </Button>
      <HeaderAccountDropdown />
      <Button
        id="cart-fly-anchor"
        data-cart-fly-anchor
        variant="ghost"
        size="icon"
        className="relative text-text-secondary hover:text-gold-bright"
        aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`}
        onClick={onCart}
      >
        <ShoppingCart className="h-[18px] w-[18px]" />
        {itemCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-gold-warm px-0.5 text-[10px] font-medium text-noir">
            {itemCount > 99 ? "99+" : itemCount}
          </span>
        )}
      </Button>
    </div>
  );
}

export function SiteHeader() {
  const { status, user } = useSession();
  const pathname = usePathname();
  const { dismissed: announcementDismissed, setDismissed: dismissAnnouncement } =
    useAnnouncementDismissed();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const itemCount = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0),
  );

  if (pathname?.startsWith("/admin")) return null;

  const headerTop = announcementDismissed ? "top-0" : "top-10";

  const openSearch = () => setSearchOpen(true);
  const openCart = () => setCartOpen(true);

  return (
    <>
      <AnnouncementBar
        dismissed={announcementDismissed}
        onDismiss={() => dismissAnnouncement(true)}
      />
      <header
        className={cn(
          "pointer-events-none fixed inset-x-0 z-50 transition-[top] duration-300",
          headerTop,
        )}
      >
        <div
          className={cn(
            "site-nav-bar pointer-events-auto grid h-[60px] w-full grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 sm:px-8 lg:px-10",
            scrolled && "scrolled",
          )}
        >
          {/* Left: desktop links + mobile menu trigger */}
          <div className="flex min-w-0 items-center justify-start">
            <nav
              className="hidden items-center gap-6 lg:flex xl:gap-8"
              aria-label="Main"
            >
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={navLinkClass(pathname, item.href)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <button
              type="button"
              className="p-2 text-text-secondary transition-colors hover:text-gold-bright lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden />
              <span className="sr-only">Open menu</span>
            </button>
          </div>

          {/* Center: brand */}
          <Link
            href="/"
            className="justify-self-center whitespace-nowrap font-display text-sm italic uppercase tracking-[0.3em] text-foreground transition-colors hover:text-gold-bright"
            aria-label="Razzaq Luxe — home"
          >
            Razzaq Luxe
          </Link>

          {/* Right: utility icons */}
          <HeaderIconActions
            itemCount={itemCount}
            onSearch={openSearch}
            onCart={openCart}
            className="justify-self-end"
          />
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex h-full w-full flex-col justify-center bg-noir p-6 sm:p-10"
            >
              <button
                type="button"
                className="absolute right-5 top-5 p-2 text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
              <nav className="flex flex-col" aria-label="Mobile">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "border-b border-border py-4 font-display text-[clamp(2rem,8vw,3.5rem)] font-light leading-snug transition-colors hover:text-gold-warm",
                      pathname === item.href ||
                        pathname?.startsWith(item.href + "/")
                        ? "text-gold-warm"
                        : "text-foreground",
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href={user ? "/account" : "/login"}
                  className="mt-2 flex items-center gap-3 border-b border-border py-4 text-sm font-medium uppercase tracking-[0.15em] text-text-secondary transition-colors hover:text-gold-warm"
                  onClick={() => setMobileOpen(false)}
                >
                  {status === "loading" ? (
                    <span className="flex h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
                  ) : user ? (
                    <AccountAvatarGlyph user={user} />
                  ) : (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center">
                      <NavPersonOutlineIcon />
                    </span>
                  )}
                  {user ? "Account" : "Sign in"}
                </Link>
              </nav>
              <div
                className="mt-10 flex items-center gap-2 border-t border-border pt-8"
                aria-label="Quick actions"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-text-secondary hover:text-gold-bright"
                  aria-label="Search"
                  onClick={() => {
                    setMobileOpen(false);
                    openSearch();
                  }}
                >
                  <Search className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-text-secondary hover:text-gold-bright"
                  asChild
                >
                  <Link
                    href="/wishlist"
                    aria-label="Wishlist"
                    onClick={() => setMobileOpen(false)}
                  >
                    <Heart className="h-5 w-5" aria-hidden />
                  </Link>
                </Button>
                <Button
                  data-cart-fly-anchor
                  variant="ghost"
                  size="icon"
                  className="relative text-text-secondary hover:text-gold-bright"
                  aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`}
                  onClick={() => {
                    setMobileOpen(false);
                    openCart();
                  }}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-gold-warm px-0.5 text-[10px] font-medium text-noir">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </Button>
              </div>
              <p className="mt-12 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                Quetta, Pakistan · Since 2020
              </p>
            </motion.aside>
            <button
              type="button"
              className="hidden"
              aria-hidden
              tabIndex={-1}
              onClick={() => setMobileOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
