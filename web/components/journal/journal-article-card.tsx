"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Article } from "@/lib/types";
import { formatArticleDate } from "@/lib/articles";
import { JOURNAL_CARD_CLASS } from "@/components/journal/journal-utils";

type JournalArticleCardProps = {
  article: Article;
  index: number;
  compact?: boolean;
};

export function JournalArticleCard({
  article,
  index,
  compact = false,
}: JournalArticleCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.08 }}
      viewport={{ once: true }}
      className={`group relative flex h-full flex-col ${JOURNAL_CARD_CLASS}`}
    >
      <Link
        href={`/journal/${article.slug}`}
        className={`relative block overflow-hidden ${compact ? "aspect-[4/3]" : "aspect-[16/10]"}`}
      >
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </Link>

      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-6 sm:p-7"}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-block rounded-full bg-gold px-3 py-0.5 font-body text-[10px] font-medium uppercase tracking-[0.15em] text-noir">
            {article.category}
          </span>
          <span className="text-xs text-muted-foreground">{article.readTime}</span>
        </div>

        <h2
          className={`mt-3 font-display font-semibold leading-snug text-foreground ${compact ? "text-lg" : "text-xl sm:text-2xl"}`}
        >
          <Link href={`/journal/${article.slug}`} className="hover:text-gold-bright">
            {article.title}
          </Link>
        </h2>

        <p
          className={`mt-2 flex-1 font-body text-muted-foreground ${compact ? "line-clamp-2 text-sm" : "line-clamp-2 text-sm sm:text-base"}`}
        >
          {article.excerpt}
        </p>

        <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-subtle font-display text-xs font-bold text-gold-bright">
            {article.author
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {article.author}
            </p>
            <time
              dateTime={article.date}
              className="text-xs text-muted-foreground"
            >
              {formatArticleDate(article.date)}
            </time>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
