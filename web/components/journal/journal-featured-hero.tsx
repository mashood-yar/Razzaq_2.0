"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Article } from "@/lib/types";
import { formatArticleDate } from "@/lib/articles";
import { JOURNAL_CARD_CLASS } from "@/components/journal/journal-utils";

type JournalFeaturedHeroProps = {
  article: Article;
};

export function JournalFeaturedHero({ article }: JournalFeaturedHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="mt-12 lg:mt-16"
    >
      <Link
        href={`/journal/${article.slug}`}
        className={`group grid gap-0 overflow-hidden lg:grid-cols-5 ${JOURNAL_CARD_CLASS}`}
      >
        <div className="relative aspect-[4/3] lg:col-span-3 lg:aspect-auto lg:min-h-[420px]">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            sizes="(max-width: 1024px) 100vw, 60vw"
            priority
          />
        </div>

        <div className="flex flex-col justify-center border-t border-border p-6 sm:p-8 lg:col-span-2 lg:border-l lg:border-t-0">
          <span className="inline-block w-fit rounded-full bg-gold px-3 py-1 font-body text-[10px] font-medium uppercase tracking-[0.15em] text-noir">
            Featured · {article.category}
          </span>
          <h2 className="mt-4 font-display text-3xl font-semibold leading-tight text-foreground transition-colors group-hover:text-gold-bright sm:text-4xl">
            {article.title}
          </h2>
          <p className="mt-4 line-clamp-3 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
            {article.excerpt}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{article.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{article.readTime}</span>
          </div>
          <span className="mt-6 inline-flex items-center gap-2 font-body text-[11px] font-medium uppercase tracking-[0.15em] text-gold-bright transition-transform group-hover:translate-x-1">
            Read story
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </motion.section>
  );
}
