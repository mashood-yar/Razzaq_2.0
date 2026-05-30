"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Heart,
  X,
  Home,
  Store,
  User,
  Menu,
} from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import { useSession } from "@/lib/auth/use-session";
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

export function SiteHeader() {
  const { user } = useSession();
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
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const itemCount = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0),
  );

  if (pathname?.startsWith("/admin")) return null;

  const headerTop = announcementDismissed ? "top-0" : "top-10";

  // Mobile bottom nav helper
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <AnnouncementBar
        dismissed={announcementDismissed}
        onDismiss={() => dismissAnnouncement(true)}
      />
      
      {/* 
        DESKTOP HEADER (≥ 1024px)
      */}
      <header
        className={cn(
          "pointer-events-none fixed inset-x-0 z-50 transition-[top] duration-300",
          headerTop,
        )}
      >
        <div
          className={cn(
            "site-nav-bar pointer-events-auto flex items-center justify-between px-5 sm:px-6",
            scrolled && "scrolled",
          )}
        >
          <Link
            href="/"
            className="font-display text-sm italic uppercase tracking-[0.3em] text-foreground transition-colors hover:text-gold-bright"
            aria-label="Razzaq Luxe — home"
          >
            Razzaq Luxe
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex" aria-label="Main">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-[11px] font-medium uppercase tracking-[0.18em] transition-colors hover:text-gold-bright",
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "text-gold-bright"
                      : "text-text-secondary",
                  )}
                >
                  {item.label}
                </Link>
              ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
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
            <Button
              variant="ghost"
              size="icon"
              className="text-text-secondary hover:text-gold-bright"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-[18px] w-[18px]" />
            </Button>
            <Button variant="ghost" size="icon" className="text-text-secondary hover:text-gold-bright" asChild>
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart className="h-[18px] w-[18px]" aria-hidden />
              </Link>
            </Button>
            <HeaderAccountDropdown />
            <Button
              id="cart-fly-anchor"
              variant="ghost"
              size="icon"
              className="relative text-text-secondary hover:text-gold-bright"
              aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-gold-warm px-0.5 text-[10px] font-medium text-noir">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* 
        MOBILE HEADER (< 1024px) - TOP BAR
      */}
      <header
        className={cn(
          "lg:hidden fixed inset-x-0 z-40 transition-[top] duration-300 h-[56px] w-full flex items-center justify-between px-4",
          "bg-[rgba(8,7,5,0.92)] backdrop-blur-xl border-b",
          scrolled ? "border-[var(--border-mid)]" : "border-[var(--border-fine)]",
          headerTop,
        )}
      >
        {/* Left: Search */}
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-start text-[var(--cream-warm)] active:text-[var(--gold-warm)]"
          aria-label="Search"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-[22px] w-[22px]" />
        </button>

        {/* Center: Logo — taps to open slide-in menu */}
        <button 
          className="font-display text-[17px] font-medium tracking-[0.18em] text-[var(--cream-bone)] uppercase absolute left-1/2 -translate-x-1/2"
          onClick={() => setMobileOpen(true)}
        >
          RAZZAQ LUXE
        </button>

        {/* Right: Cart */}
        <button
          className="relative flex h-12 w-12 items-center justify-end text-[var(--cream-warm)] active:text-[var(--gold-warm)]"
          aria-label="Cart"
          onClick={() => setCartOpen(true)}
        >
          <ShoppingCart className="h-[22px] w-[22px]" />
          {itemCount > 0 && (
            <span className="absolute right-0 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--gold-warm)] px-1 font-body text-[9px] font-bold text-[var(--bg-void)]">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </button>
      </header>

      {/* 
        MOBILE BOTTOM NAV (< 1024px)
      */}
      <nav 
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex h-[calc(64px+env(safe-area-inset-bottom))] items-start justify-between bg-[rgba(8,7,5,0.96)] backdrop-blur-xl border-t border-[var(--border-fine)] pb-[env(safe-area-inset-bottom)]"
      >
        {[
          { href: "/", label: "Home", icon: Home },
          { href: "/shop", label: "Shop", icon: Store },
          { href: "/search", label: "Search", icon: Search, onClick: (e: React.MouseEvent) => { e.preventDefault(); setSearchOpen(true); } },
          { href: "/cart", label: "Cart", icon: ShoppingCart, count: itemCount, onClick: (e: React.MouseEvent) => { e.preventDefault(); setCartOpen(true); } },
          { href: user ? "/account" : "/login", label: "Account", icon: User },
        ].map((item) => {
          const active = isActive(item.href) && !item.onClick;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={item.onClick}
              className="relative flex h-[64px] flex-1 flex-col items-center justify-center gap-1"
            >
              {active && (
                <span className="absolute top-0 left-1/2 w-8 -translate-x-1/2 h-[2px] bg-[var(--gold-warm)]" />
              )}
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-[22px] w-[22px] transition-colors",
                    active ? "text-[var(--gold-warm)]" : "text-[var(--cream-muted)]"
                  )} 
                />
                {item.count !== undefined && (
                  <span className={cn(
                    "absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 font-body text-[9px] font-bold",
                    item.count > 0 ? "bg-[var(--gold-warm)] text-[var(--bg-void)]" : "bg-[var(--bg-stone)] text-[var(--cream-muted)]"
                  )}>
                    {item.count}
                  </span>
                )}
              </div>
              <span 
                className={cn(
                  "font-body text-[10px] font-medium transition-colors",
                  active ? "text-[var(--gold-warm)]" : "text-[var(--cream-muted)]"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* 
        MOBILE SLIDE-IN MENU (< 1024px)
      */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
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
                    className="border-b border-border py-4 font-display text-[clamp(2rem,8vw,3.5rem)] font-light leading-snug text-foreground transition-colors hover:text-gold-warm"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="font-display text-[2rem] text-[var(--cream-bone)] transition-all group-active:text-[var(--gold-warm)] group-active:translate-x-2">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </nav>

              <div className="flex flex-col px-8 pt-8 gap-4">
                <Link
                  href={user ? "/account" : "/login"}
                  className="mt-2 flex items-center gap-3 border-b border-border py-4 text-sm font-medium uppercase tracking-[0.15em] text-text-secondary transition-colors hover:text-gold-warm"
                  onClick={() => setMobileOpen(false)}
                >
                  My Account
                </Link>
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
