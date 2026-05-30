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

  const headerTop = announcementDismissed ? "top-4" : "top-11";

  return (
    <>
      <AnnouncementBar
        dismissed={announcementDismissed}
        onDismiss={() => dismissAnnouncement(true)}
      />
      <header
        className={cn(
          "pointer-events-none fixed inset-x-0 z-50 px-4 transition-[top] duration-300",
          headerTop,
        )}
      >
        <div className="nav-pill pointer-events-auto mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div
            className="flex items-center gap-3"
          >
            <button
              type="button"
              className="rounded-full p-2 text-foreground hover:bg-accent/60 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden />
              <span className="sr-only">Open menu</span>
            </button>
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="Razzaq Luxe — home"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground">
                R
              </span>
              <span className="hidden font-display text-lg font-semibold text-foreground sm:inline">
                Razzaq Luxe
              </span>
            </Link>
            <nav className="ml-4 hidden items-center gap-6 lg:flex" aria-label="Main">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-xs font-semibold uppercase tracking-[0.15em] transition-colors hover:text-primary",
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
            <HeaderAccountDropdown />
            <Button
              id="cart-fly-anchor"
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-ocean-deep">
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
              className="flex h-full w-[min(100%,380px)] flex-col rounded-r-[2rem] border border-border bg-ocean-surface/95 shadow-ocean backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <Link
                  href="/"
                  className="font-display text-lg font-semibold text-foreground"
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
                    className="rounded-full px-4 py-3 text-sm font-medium text-foreground hover:bg-muted"
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
