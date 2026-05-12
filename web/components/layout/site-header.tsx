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

const nav = [
  { href: "/shop", label: "Shop" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { status, user } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const setCartOpen = useUiStore((s) => s.setCartOpen);
  const itemCount = useCartStore((s) =>
    s.items.reduce((n, i) => n + i.quantity, 0),
  );

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded-md p-2 text-foreground hover:bg-white/5 lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-5 w-5" aria-hidden />
              <span className="sr-only">Open menu</span>
            </button>
            <Link
              href="/"
              className="font-serif text-xl italic tracking-tight text-luxe-gold transition-colors hover:text-luxe-gold-bright sm:text-2xl"
              aria-label="Razzaq Luxe — home"
            >
              Razzaq Luxe
            </Link>
            <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-xs font-medium uppercase tracking-[0.2em] transition-colors hover:text-gold",
                    pathname === item.href || pathname.startsWith(item.href + "/")
                      ? "text-gold"
                      : "text-muted-foreground",
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
              className="text-foreground"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-foreground" asChild>
              <Link href="/wishlist" aria-label="Wishlist">
                <Heart className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
            <HeaderAccountDropdown />
            <Button
              id="cart-fly-anchor"
              variant="ghost"
              size="icon"
              className="relative text-foreground"
              aria-label={`Cart${itemCount ? `, ${itemCount} items` : ""}`}
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-background">
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
              className="glass-panel flex h-full w-[min(100%,380px)] flex-col border-r border-white/10 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 p-4">
                <Link
                  href="/"
                  className="font-serif text-lg italic tracking-tight text-luxe-gold transition-colors hover:text-luxe-gold-bright"
                  aria-label="Razzaq Luxe — home"
                >
                  Razzaq Luxe
                </Link>
                <button
                  type="button"
                  className="rounded-md p-2 hover:bg-white/5"
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
                    className="rounded-lg px-3 py-3 text-sm font-medium uppercase tracking-[0.15em] text-foreground hover:bg-white/5"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  href={user ? "/account" : "/login"}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium uppercase tracking-[0.15em] text-foreground hover:bg-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  {status === "loading" ? (
                    <span className="flex h-9 w-9 shrink-0 animate-pulse rounded-full bg-white/10" />
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
              className="min-w-0 flex-1 cursor-default bg-black/60 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
