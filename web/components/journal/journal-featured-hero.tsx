"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Article } from "@/lib/types";
import { formatArticleDate } from "@/lib/articles";

type JournalFeaturedHeroProps = {
  article: Article;
};

export function JournalFeaturedHero({ article }: JournalFeaturedHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mt-12 lg:mt-16"
    >
      <Link
        href={`/journal/${article.slug}`}
        className="group grid gap-8 overflow-hidden rounded-sm lg:grid-cols-5 lg:gap-10"
      >
        <div className="relative aspect-[4/3] lg:col-span-3 lg:aspect-auto lg:min-h-[420px]">
          <div
            className="relative h-full w-full overflow-hidden shadow-[4px_12px_32px_rgba(44,44,36,0.18)]"
            style={{ transform: "rotate(-2deg)" }}
          >
            <Image
              src={article.image}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
            />
          </div>
        </div>

        <div className="flex flex-col justify-center lg:col-span-2">
          <span className="inline-block w-fit -rotate-1 rounded-full bg-gold px-3 py-1 text-xs font-semibold uppercase tracking-wide text-noir">
            Featured · {article.category}
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-foreground transition-colors group-hover:text-gold-bright sm:text-4xl">
            {article.title}
          </h2>
          <p className="mt-4 line-clamp-3 font-body font-light text-[15px] leading-[1.8] text-[var(--cream-muted)]">
            {article.excerpt}
          </p>
          <div className="mt-6 flex items-center gap-3 font-body text-[13px] font-normal text-[var(--cream-ghost)]">
            <span className="text-[var(--cream-bone)]">{article.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{article.readTime}</span>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 font-semibold text-gold transition-transform group-hover:translate-x-1">
            Read story
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </motion.section>
  );
}
