"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronDown, Check } from "lucide-react";
import Image from "next/image";
import type { LegacyProduct as Product } from "@/lib/products";
import { ProductCard } from "@/components/product/product-card";
import { motion, AnimatePresence } from "framer-motion";

const PAGE_SIZE = 12;
type SortKey = "featured" | "price-asc" | "price-desc" | "bestselling" | "newest";

function applyFilters(products: Product[], q: string, filterVal: string): Product[] {
  const term = q.trim().toLowerCase();
  return products.filter((p) => {

    if (term) {
      const hit = p.name.toLowerCase().includes(term) || p.tagline.toLowerCase().includes(term);
      if (!hit) return false;
    }
    if (filterVal !== "all" && filterVal !== "limited") {
      if (p.gender !== filterVal) return false;
    }
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
    case "newest":
      return copy.sort((a, b) => (b.created_at ? Date.parse(b.created_at) : 0) - (a.created_at ? Date.parse(a.created_at) : 0));
    default:
      return copy;
  }
}

export function ShopContent({ initialProducts }: { initialProducts: Product[] }) {
  const searchParams = useSearchParams();
  const [query] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [activeFilter, setActiveFilter] = useState("all");
  const [visible, setVisible] = useState(PAGE_SIZE);
  
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  useEffect(() => {
    const g = searchParams.get("category");
    if (g && ["men", "women", "unisex"].includes(g)) {
      setActiveFilter(g);
    }
  }, [searchParams]);

  const filtered = useMemo(() => {
    const f = applyFilters(initialProducts, query, activeFilter);
    return sortProducts(f, sort);
  }, [initialProducts, query, activeFilter, sort]);

  const slice = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const filters = [
    { id: "all", label: "ALL" },
    { id: "men", label: "MEN" },
    { id: "women", label: "WOMEN" },
    { id: "unisex", label: "UNISEX" },
    { id: "limited", label: "LIMITED" },
  ];

  const sortOptions = [
    { id: "newest", label: "Newest" },
    { id: "price-asc", label: "Price: Low to High" },
    { id: "price-desc", label: "Price: High to Low" },
    { id: "bestselling", label: "Best Selling" },
  ];

  return (
    <div className="bg-[var(--bg-obsidian)] min-h-screen text-[var(--cream-bone)] pb-32">
      
      {/* 1. Collection Banner Hero */}
      <div className="relative w-full aspect-[16/9] lg:aspect-[21/9] bg-[var(--bg-void)] overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <Image src="/shop-hero.png" alt="Collection" fill className="object-cover grayscale" priority sizes="100vw" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-obsidian)] to-transparent via-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col items-center justify-end h-full">
          <h1 className="font-display italic font-light text-[3rem] lg:text-[4rem] text-[var(--cream-bone)] text-center max-w-2xl leading-tight">
            The Complete Collection
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-5 lg:px-12 mt-8">
        
        {/* 2. Filter Bar (Mobile Horizontal Scroll) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12 relative z-20">
          <div className="flex items-center justify-between w-full lg:w-auto">
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pr-4 w-full lg:w-auto">
              {filters.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`shrink-0 h-[38px] px-5 rounded-full font-body font-medium text-[12px] tracking-[0.1em] transition-colors border ${
                    activeFilter === f.id 
                      ? "bg-[var(--gold-warm)] border-[var(--gold-warm)] text-[var(--bg-void)]" 
                      : "bg-[var(--bg-dusk)] border-[var(--border-mid)] text-[var(--cream-warm)]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            
            {/* Filter Toggle for Bottom Sheet (Mobile) */}
            <button 
              className="lg:hidden shrink-0 h-[38px] px-4 rounded-full border border-[var(--border-mid)] bg-[var(--bg-dusk)] font-body font-medium text-[12px] tracking-[0.1em] text-[var(--cream-warm)] flex items-center gap-2 ml-4"
              onClick={() => setFilterSheetOpen(true)}
            >
              FILTER ▼
            </button>
          </div>

          <div className="flex gap-4 items-center">
            {/* Custom Sort Dropdown */}
            <div className="relative">
              <button 
                className="h-[38px] px-5 bg-[var(--bg-dusk)] border border-[var(--border-fine)] rounded-[4px] font-body font-light text-[14px] text-[var(--cream-warm)] flex items-center gap-3 w-full lg:w-[220px] justify-between"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              >
                {sortOptions.find(o => o.id === sort)?.label || "Sort"}
                <ChevronDown className={`w-4 h-4 transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              
              <AnimatePresence>
                {sortDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-[calc(100%+8px)] right-0 w-full lg:w-[220px] bg-[var(--bg-dusk)] border border-[var(--border-fine)] rounded-[4px] shadow-2xl py-2 z-30 flex flex-col"
                  >
                    {sortOptions.map(opt => (
                      <button 
                        key={opt.id}
                        className="text-left px-5 py-3 font-body font-light text-[14px] text-[var(--cream-warm)] hover:bg-[var(--bg-obsidian)] hover:text-[var(--gold-warm)] transition-colors flex items-center justify-between"
                        onClick={() => { setSort(opt.id as SortKey); setSortDropdownOpen(false); }}
                      >
                        {opt.label}
                        {sort === opt.id && <Check className="w-4 h-4 text-[var(--gold-warm)]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* 3. Product Grid */}
        <p className="font-body font-light text-[13px] text-[var(--cream-muted)] mb-6">
          Showing {filtered.length} fragrance{filtered.length !== 1 ? "s" : ""}
        </p>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-4 lg:gap-6">
          {slice.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="w-full py-32 flex flex-col items-center justify-center text-center px-4 border border-[var(--border-fine)] border-dashed rounded-[4px] mt-12">
            <p className="font-display italic text-[2rem] text-[var(--cream-bone)] mb-4">No compositions found.</p>
            <p className="font-body text-[14px] text-[var(--cream-muted)]">Soften filters or search another note to reveal the collection.</p>
          </div>
        )}

        {hasMore && (
          <div className="mt-16 flex justify-center">
            <button
              className="h-[52px] px-10 border border-[var(--border-mid)] text-[var(--cream-bone)] font-body font-semibold text-[11px] tracking-[0.25em] rounded-[2px] transition-colors hover:border-[var(--gold-warm)] hover:text-[var(--gold-warm)]"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
            >
              EXPLORE MORE →
            </button>
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet (Mobile) */}
      <AnimatePresence>
        {filterSheetOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--bg-void)]/80 backdrop-blur-sm"
              onClick={() => setFilterSheetOpen(false)}
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 300 }}
              className="relative w-full max-h-[75vh] bg-[var(--bg-obsidian)] border-t border-[var(--border-fine)] rounded-t-[16px] flex flex-col"
            >
              <div className="w-full h-[24px] flex items-center justify-center cursor-grab shrink-0" onClick={() => setFilterSheetOpen(false)}>
                <div className="w-[36px] h-[4px] bg-[var(--bg-ash)] rounded-full" />
              </div>
              <div className="p-6 overflow-y-auto pb-32">
                <h3 className="font-display text-[1.5rem] text-[var(--cream-bone)] mb-6">Refine By</h3>
                
                {/* Simulated Filter Accords */}
                <div className="border-t border-[var(--border-fine)] py-5">
                  <p className="font-body font-medium text-[14px] text-[var(--cream-bone)] mb-4">Price Range</p>
                  <input type="range" className="w-full accent-[var(--gold-warm)]" />
                </div>
                <div className="border-t border-[var(--border-fine)] py-5">
                  <p className="font-body font-medium text-[14px] text-[var(--cream-bone)] mb-4">Notes</p>
                  <div className="flex flex-wrap gap-2">
                    {["Oud", "Rose", "Bergamot", "Amber"].map(n => (
                      <span key={n} className="px-4 py-2 border border-[var(--border-mid)] rounded-full font-body font-light text-[13px] text-[var(--cream-warm)]">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full p-5 bg-[var(--bg-obsidian)] border-t border-[var(--border-fine)]">
                <button 
                  className="w-full h-[52px] bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-semibold text-[11px] tracking-[0.25em] rounded-[2px]"
                  onClick={() => setFilterSheetOpen(false)}
                >
                  APPLY FILTERS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
