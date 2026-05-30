import type { Article } from "@/lib/types";
import { JournalArticleCard } from "@/components/journal/journal-article-card";
import { getCardBackground } from "@/components/journal/journal-utils";

type ArticleRelatedProps = {
  articles: Article[];
};

export function ArticleRelated({ articles }: ArticleRelatedProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-20 border-t border-border/60 pt-16">
      <h2 className="text-center font-display text-2xl font-bold text-foreground sm:text-3xl">
        More from the Journal
      </h2>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        Continue unfolding the scroll
      </p>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, index) => (
          <JournalArticleCard
            key={article.slug}
            article={article}
            index={index}
            background={getCardBackground(index)}
            compact
          />
        ))}
      </div>
    </section>
  );
}
