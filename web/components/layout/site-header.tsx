"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Heart,
  X,
  Home,
  Store,
  User,
  Clock,
  Mail,
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
  { href: "/about", label: "About" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { user } = useSession();
  const pathname = usePathname();
  const { dismissed: announcementDismissed, setDismissed: dismissAnnouncement } =
    useAnnouncementDismissed();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const itemCount = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0),
  );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/admin")) return null;

  const headerTop = announcementDismissed ? "top-4" : "top-11";

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
          "hidden lg:block pointer-events-none fixed inset-x-0 z-50 px-4 transition-[top] duration-300",
          headerTop,
        )}
      >
        <div 
          className={cn(
            "pointer-events-auto mx-auto grid h-[72px] w-full max-w-[1440px] grid-cols-3 items-center px-12 xl:px-24 transition-all duration-500",
            scrolled ? "bg-[rgba(8,7,5,0.94)] backdrop-blur-xl border-b border-[rgba(201,160,80,0.12)]" : "bg-transparent border-b border-transparent"
          )}
        >
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="font-display text-[19px] font-medium tracking-[0.2em] text-[var(--cream-bone)]"
              aria-label="Razzaq Luxe — home"
            >
              RAZZAQ LUXE
            </Link>
          </div>

          {/* Center: Nav */}
          <nav className="flex justify-center gap-8" aria-label="Main">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "font-body text-[10px] font-semibold uppercase tracking-[0.28em] transition-colors duration-150",
                  pathname === item.href || pathname.startsWith(item.href + "/")
                    ? "text-[var(--gold-warm)]"
                    : "text-[var(--cream-muted)] hover:text-[var(--cream-bone)]",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right: Icons */}
          <div className="flex justify-end items-center gap-2">
            <Button
              variant="ghost"
              className="h-10 w-10 px-0 text-[var(--cream-warm)] hover:text-[var(--gold-warm)]"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-[22px] w-[22px]" />
            </Button>
            <Button variant="ghost" className="h-10 w-10 px-0 text-[var(--cream-warm)] hover:text-[var(--gold-warm)]" asChild>
              <Link href="/wishlist" aria-label="Wishlist" className="flex items-center justify-center">
                <Heart className="h-[22px] w-[22px]" aria-hidden />
              </Link>
            </Button>
            <HeaderAccountDropdown />
            <Button
              id="cart-fly-anchor"
              variant="ghost"
              className="relative h-10 w-10 px-0 text-[var(--cream-warm)] hover:text-[var(--gold-warm)]"
              aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-[22px] w-[22px]" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--gold-warm)] px-1 font-body text-[9px] font-bold text-[var(--bg-void)]">
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

        {/* Center: Logo (taps to open full menu per spec) */}
        <button 
          className="font-display text-[17px] font-medium tracking-[0.18em] text-[var(--cream-bone)] uppercase absolute left-1/2 -translate-x-1/2"
          onClick={() => setMobileMenuOpen(true)}
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
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex lg:hidden bg-void"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="flex h-full w-full flex-col bg-[var(--bg-void)] relative"
            >
              <div className="flex flex-col pt-12 pb-8 px-8 border-b border-[var(--border-fine)] relative">
                <h2 className="font-display text-[20px] font-medium text-[var(--cream-bone)]">RAZZAQ LUXE</h2>
                <p className="font-body text-[12px] font-light italic text-[var(--cream-ghost)]">Quetta, Pakistan</p>
                <button
                  type="button"
                  className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center text-[var(--cream-ghost)] active:text-[var(--gold-warm)]"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex flex-col px-8 pt-8" aria-label="Mobile Main">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-center border-b border-[var(--border-fine)] py-5"
                    onClick={() => setMobileMenuOpen(false)}
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
                  className="font-body text-[14px] text-[var(--cream-muted)] active:text-[var(--gold-warm)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Account
                </Link>
                <Link
                  href="/wishlist"
                  className="font-body text-[14px] text-[var(--cream-muted)] active:text-[var(--gold-warm)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wishlist
                </Link>
                <Link
                  href="/account/orders"
                  className="font-body text-[14px] text-[var(--cream-muted)] active:text-[var(--gold-warm)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Track Order
                </Link>
              </div>

              <div className="mt-auto px-8 pb-12 flex flex-col gap-1">
                <p className="font-body text-[12px] font-light text-[var(--cream-ghost)] flex items-center gap-2">
                  <Mail className="h-3 w-3" /> sultanbarak77@gmail.com
                </p>
                <p className="font-body text-[12px] font-light text-[var(--cream-ghost)] flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Sat–Thu · 10 AM – 8 PM PKT
                </p>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
