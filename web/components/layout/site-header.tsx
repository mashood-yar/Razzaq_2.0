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
  Home,
  Store,
  User,
} from "lucide-react";
import type React from "react";
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

  // Lock body scroll when mobile menu is open
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

  // Mobile bottom nav active helper
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
        DESKTOP HEADER — centered 3-column layout (≥ 1024px)
      */}
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
          {/* Left: desktop nav links + mobile hamburger */}
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

          {/* Center: brand logo */}
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

      {/*
        MOBILE BOTTOM NAV (< 1024px)
      */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex h-[calc(64px+env(safe-area-inset-bottom))] items-start justify-between bg-[rgba(8,7,5,0.96)] backdrop-blur-xl border-t border-[var(--border-fine)] pb-[env(safe-area-inset-bottom)]"
      >
        {[
          { href: "/", label: "Home", icon: Home },
          { href: "/shop", label: "Shop", icon: Store },
          { href: "/search", label: "Search", icon: Search, onClick: (e: React.MouseEvent) => { e.preventDefault(); openSearch(); } },
          { href: "/cart", label: "Cart", icon: ShoppingCart, count: itemCount, onClick: (e: React.MouseEvent) => { e.preventDefault(); openCart(); } },
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
        MOBILE SLIDE-IN MENU (< 1024px) — premium staggered entrance
      */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            {/* Backdrop tap to close */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="relative flex h-full w-[85vw] max-w-sm flex-col justify-center bg-noir border-r border-border px-8 py-10"
            >
              {/* Close button */}
              <motion.button
                type="button"
                initial={{ opacity: 0, rotate: -45 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.25 }}
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold-warm hover:text-gold-bright"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </motion.button>

              {/* Brand mark */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
                className="mb-10 font-display text-[11px] italic uppercase tracking-[0.35em] text-gold-warm"
              >
                Razzaq Luxe
              </motion.p>

              <nav className="flex flex-col" aria-label="Mobile">
                {nav.map((item, idx) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center justify-between border-b border-border/50 py-4 font-display text-[2rem] font-light leading-snug transition-colors hover:text-gold-warm",
                        pathname === item.href || pathname?.startsWith(item.href + "/")
                          ? "text-gold-warm"
                          : "text-foreground"
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      {item.label}
                      <span className="text-muted-foreground opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100 text-xl">→</span>
                    </Link>
                  </motion.div>
                ))}

                {/* Account link with avatar */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + nav.length * 0.07, duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                >
                  <Link
                    href={user ? "/account" : "/login"}
                    className="mt-2 flex items-center gap-3 border-b border-border/50 py-4 text-sm font-medium uppercase tracking-[0.15em] text-text-secondary transition-colors hover:text-gold-warm"
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
                </motion.div>
              </nav>

              {/* Quick actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="mt-8 flex items-center gap-2 border-t border-border pt-6"
                aria-label="Quick actions"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-text-secondary hover:text-gold-bright"
                  aria-label="Search"
                  onClick={() => { setMobileOpen(false); openSearch(); }}
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
                  onClick={() => { setMobileOpen(false); openCart(); }}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-gold-warm px-0.5 text-[10px] font-medium text-noir">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="mt-10 text-[10px] uppercase tracking-[0.25em] text-muted-foreground"
              >
                Quetta · Balochistan · Since 2020
              </motion.p>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
