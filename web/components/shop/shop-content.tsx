"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import type { LegacyProduct as Product } from "@/lib/products";
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

const PAGE_SIZE = 8;

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
    if (saleOnly && !(p.compareAtPrice && p.compareAtPrice > p.price)) return false;
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

  return (
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

        <p className="mt-6 text-sm text-muted-foreground">
          {filtered.length} fragrance{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
  );
}
