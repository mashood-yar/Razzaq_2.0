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
      className="group relative flex flex-col transition-all duration-300 hover:-translate-y-2 border border-[var(--border-fine)]"
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

      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-6 sm:p-7"} bg-[var(--bg-dusk)]`}>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span
            className="inline-block -rotate-1 rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-noir"
          >
            {article.category}
          </span>
          <span className="text-[12px] font-body text-[var(--cream-ghost)]">{article.readTime}</span>
        </div>

        <h2
          className={`font-display italic font-light leading-snug text-[var(--cream-bone)] ${compact ? "text-xl" : "text-[1.75rem]"}`}
        >
          <Link href={`/journal/${article.slug}`} className="hover:text-gold-bright">
            {article.title}
          </Link>
        </h2>

        <p
          className={`mt-3 flex-1 font-body font-light text-[var(--cream-muted)] leading-[1.6] ${compact ? "line-clamp-2 text-[13px]" : "line-clamp-3 text-[14px]"}`}
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
            <p className="truncate text-[13px] font-body text-[var(--cream-bone)]">
              {article.author}
            </p>
            <time
              dateTime={article.date}
              className="text-[11px] font-body text-[var(--cream-ghost)]"
            >
              {formatArticleDate(article.date)}
            </time>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
