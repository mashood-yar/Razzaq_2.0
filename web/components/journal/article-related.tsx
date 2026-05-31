import type { Article } from "@/lib/types";
import { JournalArticleCard } from "@/components/journal/journal-article-card";

type ArticleRelatedProps = {
  articles: Article[];
};

export function ArticleRelated({ articles }: ArticleRelatedProps) {
  if (articles.length === 0) return null;

  return (
    <section className="mt-20 border-t border-border pt-16">
      <div className="text-center">
        <span className="eyebrow">Continue Reading</span>
        <h2 className="text-display mt-3">More from the Journal</h2>
      </div>
      <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, index) => (
          <JournalArticleCard
            key={article.slug}
            article={article}
            index={index}
            compact
          />
        ))}
      </div>
    </section>
  );
}
