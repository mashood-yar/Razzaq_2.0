import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ARTICLES,
  getArticleBySlug,
  getRelatedArticles,
  formatArticleDate,
  authorInitials,
} from "@/lib/articles";
import { ArticleReadingProgress } from "@/components/journal/article-reading-progress";
import { ArticleShareButtons } from "@/components/journal/article-share-buttons";
import { ArticleRelated } from "@/components/journal/article-related";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = getArticleBySlug(slug);
  if (!a) return {};
  return buildPageMetadata({
    title: a.title,
    description: a.excerpt,
    path: `/journal/${slug}`,
    image: a.image,
    openGraphType: "article",
  });
}

function PullQuote({ text }: { text: string }) {
  return (
    <blockquote className="my-10 border-l-2 border-gold-warm py-1 pl-6 font-display text-xl italic leading-snug text-gold-bright sm:text-2xl">
      &ldquo;{text}&rdquo;
    </blockquote>
  );
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = getRelatedArticles(slug, 3);
  const pullQuotes = article.pullQuotes ?? [];
  const pullAfterIndex =
    article.body.length > 1 ? 1 : 0;

  return (
    <>
      <ArticleReadingProgress />

      <article className="relative min-h-screen bg-noir">
        <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link
            href="/journal"
            className="inline-flex items-center gap-1 font-body text-[11px] font-medium uppercase tracking-[0.15em] text-gold-bright transition-colors hover:text-gold"
          >
            ← Back to Journal
          </Link>

          <header className="mx-auto mt-10 max-w-2xl text-center">
            <span className="inline-block rounded-full bg-gold px-3 py-1 font-body text-[10px] font-medium uppercase tracking-[0.15em] text-noir">
              {article.category}
            </span>
            <h1 className="mt-5 font-display text-3xl font-light leading-tight text-foreground sm:text-4xl lg:text-5xl">
              {article.title}
            </h1>
            <div className="mx-auto mt-5 h-px w-16 bg-gold-warm" aria-hidden="true" />
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 font-display text-xs font-bold text-gold">
                  {authorInitials(article.author)}
                </span>
                <span className="font-medium text-foreground">
                  {article.author}
                </span>
              </span>
              <span aria-hidden="true">·</span>
              <time dateTime={article.date}>
                {formatArticleDate(article.date)}
              </time>
              <span aria-hidden="true">·</span>
              <span>{article.readTime}</span>
            </div>
          </header>

          <div className="relative mx-auto mt-12 max-w-3xl">
            <div className="relative aspect-[16/9] overflow-hidden border border-border bg-noir-surface">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, min(100vw, 48rem)"
              />
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-2xl space-y-6 font-body text-lg leading-relaxed text-text-secondary">
            {article.body.map((paragraph, i) => (
              <div key={i}>
                <p>{paragraph}</p>
                {pullQuotes[0] && i === pullAfterIndex && (
                  <PullQuote text={pullQuotes[0]} />
                )}
              </div>
            ))}
          </div>

          <div className="mx-auto mt-12 max-w-2xl">
            <ArticleShareButtons title={article.title} slug={article.slug} />
          </div>

          <div className="mx-auto max-w-5xl">
            <ArticleRelated articles={related} />
          </div>
        </div>
      </article>
    </>
  );
}
