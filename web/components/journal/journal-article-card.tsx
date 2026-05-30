"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Article } from "@/lib/types";
import { formatArticleDate } from "@/lib/articles";
import {
  getCardRotation,
  getTornClipPath,
} from "@/components/journal/journal-utils";

type JournalArticleCardProps = {
  article: Article;
  index: number;
  background: string;
  compact?: boolean;
};

export function JournalArticleCard({
  article,
  index,
  background,
  compact = false,
}: JournalArticleCardProps) {
  const rotation = getCardRotation(index);
  const clipPath = getTornClipPath();

  return (
    <motion.article
      initial={{ opacity: 0, rotateX: -15, y: 40 }}
      whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.1 }}
      viewport={{ once: true }}
      style={{
        clipPath,
        backgroundColor: background,
        rotate: `${rotation}deg`,
      }}
      className="group relative flex flex-col shadow-[4px_8px_24px_rgba(44,44,36,0.15)] transition-all duration-300 hover:-translate-y-2 hover:rotate-0 hover:shadow-[6px_14px_32px_rgba(44,44,36,0.22)]"
    >
      {/* Pushpin */}
      <span
        className="absolute left-1/2 top-0 z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_2px_4px_rgba(44,44,36,0.25)] ring-2 ring-gold/30"
        aria-hidden="true"
      />

      <Link
        href={`/journal/${article.slug}`}
        className={`relative block overflow-hidden ${compact ? "aspect-[4/3]" : "aspect-[16/10]"}`}
      >
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </Link>

      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-6 sm:p-7"}`}>
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-block -rotate-1 rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-noir"
          >
            {article.category}
          </span>
          <span className="text-xs text-muted-foreground">{article.readTime}</span>
        </div>

        <h2
          className={`mt-3 font-display font-bold leading-snug text-foreground ${compact ? "text-lg" : "text-xl sm:text-2xl"}`}
        >
          <Link href={`/journal/${article.slug}`} className="hover:text-gold-bright">
            {article.title}
          </Link>
        </h2>

        <p
          className={`mt-2 flex-1 text-muted-foreground ${compact ? "line-clamp-2 text-sm" : "line-clamp-2 text-sm sm:text-base"}`}
        >
          {article.excerpt}
        </p>

        <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 font-display text-xs font-bold text-gold">
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
