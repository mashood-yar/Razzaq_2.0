"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import type { LegacyProduct as Product } from "@/lib/products";
import type { MainNoteCategory } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductCard } from "@/components/product/product-card";
import {
  FilterSidebar,
  type ShopFiltersState,
} from "@/components/shop/filter-sidebar";
import { CategoryBanner } from "@/components/banners/category-banner";
import { isLegacyProductOnSale } from "@/lib/product-highlights";

const PAGE_SIZE = 8;

type QuickFilterId = "all" | "oud" | "oriental" | "floral" | "fresh";

const QUICK_FILTERS: {
  id: QuickFilterId;
  label: string;
  notes: MainNoteCategory[];
}[] = [
  { id: "all", label: "All", notes: [] },
  { id: "oud", label: "Oud", notes: ["Woody", "Amber"] },
  { id: "oriental", label: "Oriental", notes: ["Oriental"] },
  { id: "floral", label: "Floral", notes: ["Floral"] },
  { id: "fresh", label: "Fresh", notes: ["Fresh", "Citrus"] },
];

type SortKey = "featured" | "price-asc" | "price-desc" | "bestselling" | "newest";

function applyFilters(
  products: Product[],
  q: string,
  f: ShopFiltersState,
  categorySlug: string | null,
  saleOnly: boolean,
): Product[] {
  const term = q.trim().toLowerCase();
  return products.filter((p) => {
    if (categorySlug && p.categorySlug !== categorySlug) return false;
    if (saleOnly && !isLegacyProductOnSale(p)) return false;
    if (term) {
      const hit =
        p.name.toLowerCase().includes(term) ||
        p.tagline.toLowerCase().includes(term) ||
        p.mainNotes.some((n) => n.toLowerCase().includes(term));
      if (!hit) return false;
    }
    if (p.price < f.priceRange[0] || p.price > f.priceRange[1]) return false;
    if (f.gender !== "all" && p.gender !== f.gender) return false;
    if (f.notes.length > 0) {
      const ok = f.notes.some((n) => p.mainNotes.includes(n));
      if (!ok) return false;
    }
    if (p.longevity < f.longevityMin) return false;
    if (p.sillage < f.sillageMin) return false;
    const sizeOk = p.sizes.some(
      (s) => s.ml >= f.sizeMlRange[0] && s.ml <= f.sizeMlRange[1],
    );
    if (!sizeOk) return false;
    return true;
  });
}

function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "bestselling":
      return copy.sort((a, b) => {
        if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount;
        const bb = b.badge === "bestseller" ? 1 : 0;
        const ab = a.badge === "bestseller" ? 1 : 0;
        if (bb !== ab) return bb - ab;
        return b.price - a.price;
      });
    case "newest":
      return copy.sort((a, b) => {
        const ta = a.created_at ? Date.parse(a.created_at) : 0;
        const tb = b.created_at ? Date.parse(b.created_at) : 0;
        return tb - ta;
      });
    default:
      return copy.sort((a, b) => {
        const bb = b.badge === "bestseller" ? 1 : 0;
        const ab = a.badge === "bestseller" ? 1 : 0;
        if (bb !== ab) return bb - ab;
        return 0;
      });
  }
}

const defaultFilters = (): ShopFiltersState => ({
  priceRange: [0, 100_000],
  gender: "all",
  notes: [],
  longevityMin: 1,
  sillageMin: 1,
  sizeMlRange: [30, 100],
});

export function ShopContent({ initialProducts }: { initialProducts: Product[] }) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [filters, setFilters] = useState<ShopFiltersState>(defaultFilters);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [quickFilter, setQuickFilter] = useState<QuickFilterId>("all");

  const categorySlug = searchParams.get("category");
  const saleOnly = searchParams.get("sale") === "true";

  useEffect(() => {
    const g = searchParams.get("gender");
    if (g === "men" || g === "women" || g === "unisex") {
      setFilters((f) => ({ ...f, gender: g }));
    }
    const s = searchParams.get("sort");
    if (s === "new") setSort("newest");
  }, [searchParams]);

  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [filters, query, sort]);

  const filtered = useMemo(() => {
    const f = applyFilters(initialProducts, query, filters, categorySlug, saleOnly);
    return sortProducts(f, sort);
  }, [initialProducts, query, filters, sort, categorySlug, saleOnly]);

  const slice = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  function applyQuickFilter(id: QuickFilterId) {
    setQuickFilter(id);
    const match = QUICK_FILTERS.find((f) => f.id === id);
    setFilters((current) => ({
      ...current,
      notes: match?.notes ?? [],
    }));
    setVisible(PAGE_SIZE);
  }

  return (
    <>
      <section
        className="relative flex min-h-[45svh] items-end overflow-hidden bg-noir pt-[100px]"
        aria-label="Fragrances collection"
      >
        <div className="absolute inset-0" aria-hidden>
          <div className="relative h-full w-full">
            <Image
              src="/images/fragrances-hero.png"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-55"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0A0A08] via-[#0A0A08]/65 to-[#0A0A08]/15"
              aria-hidden
            />
          </div>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-4xl px-5 pb-16 pt-8 sm:px-6">
          <span className="mb-5 block font-body text-[11px] font-medium uppercase tracking-[0.3em] text-gold-bright opacity-85">
            The Collection
          </span>
          <h1 className="font-display text-[clamp(2.8rem,8vw,6rem)] font-light leading-[0.95] tracking-tight text-foreground">
            All <em className="text-gold-bright">Fragrances</em>
          </h1>
          <p className="mt-5 max-w-md text-[15px] font-light leading-relaxed text-text-secondary">
            Seven signatures. Each one a world. Discover the scent that speaks for you.
          </p>
        </div>
      </section>

      <div
        className="sticky top-[100px] z-40 border-y border-border bg-noir-surface px-5 py-5 sm:px-6"
        role="navigation"
        aria-label="Filter fragrances"
      >
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
          <span className="mr-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Filter:
          </span>
          {QUICK_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={quickFilter === f.id}
              className={cn("filter-btn", quickFilter === f.id && "filter-btn-active")}
              onClick={() => applyQuickFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] tracking-wider text-[#4A4640]" aria-live="polite">
            {filtered.length} Fragrance{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:flex lg:gap-12 lg:px-8 lg:py-14">
      {/* Desktop filters */}
      <div className="hidden w-64 shrink-0 lg:block">
        <FilterSidebar value={filters} onChange={setFilters} />
      </div>

      <div className="min-w-0 flex-1">
        {categorySlug && (
          <CategoryBanner categorySlug={categorySlug} productCount={filtered.length} />
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search fragrances..."
              className="pl-10"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setVisible(PAGE_SIZE);
              }}
              aria-label="Search shop"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full overflow-y-auto sm:max-w-md">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-8">
                  <FilterSidebar value={filters} onChange={setFilters} />
                </div>
              </SheetContent>
            </Sheet>

            <Select
              value={sort}
              onValueChange={(v) => setSort(v as SortKey)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: low to high</SelectItem>
                <SelectItem value="price-desc">Price: high to low</SelectItem>
                <SelectItem value="bestselling">Best selling</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="mt-6 text-sm text-muted-foreground lg:hidden">
          {filtered.length} fragrance{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="mt-10 grid gap-10 sm:grid-cols-2 sm:gap-14 lg:grid-cols-3 lg:gap-16 xl:grid-cols-3">
          {slice.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-16 text-center text-muted-foreground">
            No fragrances match — soften filters or search another note.
          </p>
        )}

        {hasMore && (
          <div className="mt-14 flex justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
            >
              Load more
            </Button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
