"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth/use-session";
import { signOut } from "@/lib/auth/actions";
import {
  AccountAvatarGlyph,
  NavPersonOutlineIcon,
} from "@/components/layout/account-avatar-glyph";

export function HeaderAccountDropdown() {
  const { data: session, status, user } = useSession();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocMouseDown(e: MouseEvent) {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (status === "loading") {
    return (
      <Button variant="ghost" size="icon" className="text-foreground" aria-busy aria-label="Checking account">
        <span className="flex h-9 w-9 animate-pulse rounded-full bg-white/10" />
      </Button>
    );
  }

  if (status === "unauthenticated" || !session || !user) {
    return (
      <Button variant="ghost" size="icon" className="text-foreground" asChild>
        <Link href="/login" aria-label="Sign in">
          <NavPersonOutlineIcon />
        </Link>
      </Button>
    );
  }

  const displayName =
    session.user.name?.trim() ||
    session.user.email?.split("@")[0]?.trim() ||
    "Account";

  return (
    <div ref={wrapRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative h-10 w-10 shrink-0 text-foreground"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${session.user.email ?? displayName}`}
        onClick={() => setOpen((v) => !v)}
      >
        <AccountAvatarGlyph user={user} />
      </Button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            aria-orientation="vertical"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-[calc(100%+10px)] z-[60] w-64 overflow-hidden rounded-xl border border-white/10 bg-background/95 shadow-xl backdrop-blur-xl"
          >
            <div className="border-b border-white/10 px-4 py-3">
              <p className="truncate font-serif text-base text-foreground">{displayName}</p>
              {session.user.email ? (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{session.user.email}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-0.5 p-2">
              <Link
                href="/account"
                role="menuitem"
                className="rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                My account
              </Link>
              <form action={signOut} className="mt-1 border-t border-white/10 pt-2">
                <Button
                  type="submit"
                  variant="ghost"
                  role="menuitem"
                  className="h-auto w-full justify-start px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  magnetic={false}
                >
                  Sign out
                </Button>
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
