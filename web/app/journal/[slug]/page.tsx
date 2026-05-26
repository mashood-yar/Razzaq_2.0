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
  const ogImage =
    a.image.startsWith("http://") || a.image.startsWith("https://")
      ? a.image
      : `${(process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "") || ""}${a.image.startsWith("/") ? a.image : `/${a.image}`}`;
  return {
    title: a.title,
    description: a.excerpt,
    openGraph: {
      title: a.title,
      description: a.excerpt,
      images: ogImage ? [{ url: ogImage, alt: a.title }] : undefined,
    },
  };
}

function PullQuote({ text }: { text: string }) {
  return (
    <blockquote className="my-10 border-l-[2px] border-[var(--gold-warm)] py-2 pl-6 font-display text-[1.5rem] italic leading-snug text-[var(--gold-warm)] sm:text-[2rem]">
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

      <article className="relative min-h-screen bg-[var(--bg-obsidian)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[url('/arabesque.svg')] bg-repeat opacity-[0.02]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <Link
            href="/journal"
            className="inline-flex items-center gap-1 font-body text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--gold-warm)] transition-colors hover:text-[var(--gold-warm)]/80"
          >
            ← Back to Journal
          </Link>

          <header className="mx-auto mt-16 max-w-2xl text-center">
            <span className="inline-block rounded-[2px] bg-[var(--gold-warm)] px-3 py-1 font-body text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--bg-void)]">
              {article.category}
            </span>
            <h1 className="mt-6 font-display italic font-light text-[2.5rem] leading-tight text-[var(--cream-bone)] sm:text-[3.5rem] lg:text-[4.5rem]">
              {article.title}
            </h1>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 font-body text-[13px] text-[var(--cream-ghost)]">
              <span className="inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--gold-warm)]/15 font-body text-[10px] tracking-wider font-bold text-[var(--gold-warm)]">
                  {authorInitials(article.author)}
                </span>
                <span className="font-medium text-[var(--cream-bone)]">
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

          <div className="relative mx-auto mt-16 max-w-3xl">
            <div
              className="relative aspect-[16/9] overflow-hidden border border-[var(--border-fine)] shadow-2xl rounded-[2px]"
            >
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

          <div className="mx-auto mt-16 max-w-2xl space-y-8 font-body font-light text-[16px] leading-[1.8] text-[var(--cream-bone)]">
            {article.body.map((paragraph, i) => (
              <div key={i}>
                <p>{paragraph}</p>
                {pullQuotes[0] && i === pullAfterIndex && (
                  <PullQuote text={pullQuotes[0]} />
                )}
              </div>
            ))}
          </div>

          <div className="mx-auto mt-16 max-w-2xl">
            <ArticleShareButtons title={article.title} slug={article.slug} />
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <ArticleRelated articles={related} />
          </div>
        </div>
      </article>
    </>
  );
}
