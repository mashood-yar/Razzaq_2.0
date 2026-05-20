"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Article } from "@/lib/types";
import type { JournalCategory } from "@/lib/articles";
import { JournalHeader } from "@/components/journal/journal-header";
import { JournalFeaturedHero } from "@/components/journal/journal-featured-hero";
import { JournalSearchBar } from "@/components/journal/journal-search-bar";
import { JournalCategoryFilter } from "@/components/journal/journal-category-filter";
import { JournalArticleCard } from "@/components/journal/journal-article-card";
import { JournalEmptyState } from "@/components/journal/journal-empty-state";
import {
  getCardBackground,
  getGridPlacement,
} from "@/components/journal/journal-utils";

type JournalScrollProps = {
  articles: Article[];
  featuredSlug: string;
};

function filterArticles(
  articles: Article[],
  category: JournalCategory,
  query: string,
): Article[] {
  const q = query.trim().toLowerCase();
  return articles.filter((a) => {
    const matchesCategory =
      category === "All" || a.category === category;
    const matchesQuery =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });
}

export function JournalScroll({ articles, featuredSlug }: JournalScrollProps) {
  const [category, setCategory] = useState<JournalCategory>("All");
  const [search, setSearch] = useState("");

  const featured = useMemo(
    () => articles.find((a) => a.slug === featuredSlug) ?? articles[0],
    [articles, featuredSlug],
  );

  const filtered = useMemo(
    () => filterArticles(articles, category, search),
    [articles, category, search],
  );

  const gridArticles = useMemo(
    () => filtered.filter((a) => a.slug !== featured?.slug),
    [filtered, featured?.slug],
  );

  const showFeatured =
    featured &&
    filtered.some((a) => a.slug === featured.slug) &&
    category === "All" &&
    !search.trim();

  return (
    <div className="relative min-h-screen bg-[#1B262C]">
      {/* Stronger grain overlay — page-specific */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-grain opacity-[0.06] mix-blend-multiply"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <JournalHeader />

        <JournalSearchBar value={search} onChange={setSearch} />
        <JournalCategoryFilter active={category} onChange={setCategory} />

        {showFeatured && <JournalFeaturedHero article={featured} />}

        <AnimatePresence mode="wait">
          {gridArticles.length === 0 && !showFeatured ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <JournalEmptyState />
            </motion.div>
          ) : (
            <motion.div
              key={`${category}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className={`grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 ${showFeatured ? "mt-16" : "mt-12"}`}
            >
              {gridArticles.map((article, index) => {
                const placement = getGridPlacement(index);
                return (
                  <div
                    key={article.slug}
                    className={placement.className}
                    style={placement.style}
                  >
                    <JournalArticleCard
                      article={article}
                      index={index}
                      background={getCardBackground(index)}
                    />
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
