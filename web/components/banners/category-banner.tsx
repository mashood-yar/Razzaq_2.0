"use client";

import { motion } from "framer-motion";

export type CategoryBannerConfig = {
  slug: string;
  name: string;
  description: string;
  bgClass: string;
  blobClass: string;
};

const CATEGORY_MAP: Record<string, Omit<CategoryBannerConfig, "slug">> = {
  accessories: {
    name: "Accessories",
    description: "Finishing touches — bags, scarves, and refined accents.",
    bgClass: "bg-[#0F4C75] text-[#F3F4F1]",
    blobClass: "bg-white/15",
  },
  clothing: {
    name: "Clothing",
    description: "Tailored silhouettes and everyday elegance.",
    bgClass: "bg-[#3282B8] text-white",
    blobClass: "bg-white/20",
  },
  formal: {
    name: "Formal",
    description: "Occasion-ready pieces with impeccable drape.",
    bgClass: "bg-[#3282B8] text-white",
    blobClass: "bg-white/20",
  },
  lawn: {
    name: "Lawn",
    description: "Breathable prints and seasonal colour stories.",
    bgClass: "bg-[#3282B8] text-white",
    blobClass: "bg-white/20",
  },
  home: {
    name: "Home",
    description: "Textures and scents for spaces that feel lived-in.",
    bgClass: "bg-[#1B3A4B] text-foreground",
    blobClass: "bg-[#0F4C75]/10",
  },
  fragrances: {
    name: "Fragrances",
    description: "Signature compositions from our Quetta atelier.",
    bgClass: "bg-[#0F4C75] text-[#F3F4F1]",
    blobClass: "bg-white/15",
  },
};

const DEFAULT_CONFIG: Omit<CategoryBannerConfig, "slug"> = {
  name: "Shop",
  description: "Explore our curated collection of luxury lifestyle pieces.",
  bgClass: "bg-[#16213E] text-foreground",
  blobClass: "bg-[#0F4C75]/10",
};

function slugToTitle(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function getCategoryBannerConfig(slug: string | null): CategoryBannerConfig | null {
  if (!slug?.trim()) return null;
  const key = slug.trim().toLowerCase();
  const mapped = CATEGORY_MAP[key];
  if (mapped) return { slug: key, ...mapped };
  return {
    slug: key,
    ...DEFAULT_CONFIG,
    name: slugToTitle(key),
  };
}

type CategoryBannerProps = {
  categorySlug: string;
  productCount: number;
};

export function CategoryBanner({ categorySlug, productCount }: CategoryBannerProps) {
  const config = getCategoryBannerConfig(categorySlug);
  if (!config) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`relative mb-10 overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 ${config.bgClass}`}
    >
      <motion.div
        aria-hidden
        className={`pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full blur-3xl ${config.blobClass}`}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className={`pointer-events-none absolute -bottom-12 -left-6 h-32 w-32 rounded-full blur-2xl ${config.blobClass}`}
        animate={{ x: [0, 16, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="relative z-10">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] opacity-80">
          Collection
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">{config.name}</h1>
        <p className="mt-3 max-w-xl text-sm opacity-90 sm:text-base">{config.description}</p>
        <p className="mt-4 text-xs font-medium uppercase tracking-widest opacity-75">
          {productCount} {productCount === 1 ? "piece" : "pieces"}
        </p>
      </motion.div>
    </motion.section>
  );
}
