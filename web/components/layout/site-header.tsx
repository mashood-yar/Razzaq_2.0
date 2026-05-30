"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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

export function SiteHeader() {
  const { status, user } = useSession();
  const pathname = usePathname();
  const { dismissed: announcementDismissed, setDismissed: dismissAnnouncement } =
    useAnnouncementDismissed();
  const [mobileOpen, setMobileOpen] = useState(false);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const itemCount = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0),
  );

  if (pathname?.startsWith("/admin")) return null;

  const headerTop = announcementDismissed ? "top-0" : "top-10";

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
        <div className="nav-pill pointer-events-auto flex h-[60px] items-center justify-between px-5 sm:px-6">
          <div className="flex items-center gap-3">
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
            <Link
              href="/"
              className="font-display text-sm italic uppercase tracking-[0.3em] text-foreground transition-colors hover:text-gold-bright"
              aria-label="Razzaq Luxe — home"
            >
              Razzaq Luxe
            </Link>
            <nav className="ml-6 hidden items-center gap-8 lg:flex" aria-label="Main">
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
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
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

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="flex h-full w-[min(100%,380px)] flex-col border-r border-border bg-noir shadow-nocturne backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <Link
                  href="/"
                  className="font-display text-2xl font-light italic text-foreground"
                  aria-label="Razzaq Luxe — home"
                >
                  Razzaq Luxe
                </Link>
                <button
                  type="button"
                  className="rounded-full p-2 hover:bg-muted"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-4" aria-label="Mobile">
                {nav.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="border-b border-border px-1 py-4 font-display text-2xl font-light text-foreground transition-colors hover:text-gold-warm"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href={user ? "/account" : "/login"}
                  className="flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
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
            </motion.aside>
            <button
              type="button"
              className="min-w-0 flex-1 cursor-default bg-foreground/20 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
