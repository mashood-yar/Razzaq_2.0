"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUiStore } from "@/stores/ui-store";
import type { LegacyProduct } from "@/lib/products";
import type { Product as DbProduct } from "@/lib/types";
import { mapDbProductToLegacy } from "@/lib/catalog/map-db-product";
import { formatPKR } from "@/lib/utils";

export function SearchModal() {
  const open = useUiStore((s) => s.searchOpen);
  const setOpen = useUiStore((s) => s.setSearchOpen);
  const [q, setQ] = useState("");
  const [catalog, setCatalog] = useState<LegacyProduct[]>([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setCatalogLoaded(false);
    fetch("/api/products?limit=48")
      .then((r) => r.json())
      .then((body: { data?: unknown }) => {
        if (cancelled || !Array.isArray(body.data)) return;
        setCatalog((body.data as DbProduct[]).map(mapDbProductToLegacy));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCatalogLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return catalog.slice(0, 6);
    return catalog
      .filter(
        (p) =>
          p.name.toLowerCase().includes(t) ||
          (p.tagline ?? "").toLowerCase().includes(t) ||
          p.mainNotes.some((n) => n.toLowerCase().includes(t)),
      )
      .slice(0, 8);
  }, [catalog, q]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQ("");
      }}
    >
      <DialogContent className="max-w-xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b border-white/10 p-4 pb-3">
          <DialogTitle className="sr-only">Search fragrances</DialogTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Search by name, note, mood..."
              className="border-0 bg-transparent pl-10 text-base focus-visible:ring-0"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search fragrances"
            />
          </div>
        </DialogHeader>
        <ul className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {open && !catalogLoaded && (
            <li className="p-6 text-center text-sm text-muted-foreground">Loading catalog…</li>
          )}
          {results.map((p) => (
            <li key={p.id}>
              <Link
                href={`/products/${p.slug}`}
                className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                  <Image
                    src={p.images[0]}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="font-medium leading-tight">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {p.tagline}
                  </p>
                  <p className="mt-1 text-sm text-gold">
                    From {formatPKR(p.sizes[0]?.price ?? p.price)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
          {catalogLoaded && catalog.length === 0 && (
            <li className="p-6 text-center text-sm text-muted-foreground">
              Catalog unavailable. Check connection or try again later.
            </li>
          )}
          {catalogLoaded && catalog.length > 0 && results.length === 0 && q.trim() !== "" && (
            <li className="p-6 text-center text-sm text-muted-foreground">
              No matches. Try another note or name.
            </li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
