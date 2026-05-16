import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ARTICLES, getArticleBySlug } from "@/lib/articles";

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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
      <Link
        href="/journal"
        className="text-xs uppercase tracking-[0.2em] text-gold hover:underline"
      >
        ← Journal
      </Link>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
        {article.category}
      </p>
      <h1 className="mt-4 font-serif text-4xl sm:text-5xl">{article.title}</h1>
      <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
        <time dateTime={article.date}>{article.date}</time>
        <span>{article.readTime}</span>
      </div>

      <div className="relative mt-12 aspect-[16/9] overflow-hidden rounded-2xl bg-muted">
        <Image
          src={article.image}
          alt={article.title}
          fill
          className="object-cover"
          priority
          sizes="(max-width: 768px) 100vw, min(100vw, 48rem)"
        />
      </div>

      <div className="mt-12 space-y-6 leading-relaxed text-muted-foreground">
        {article.body.map((p, i) => (
          <p key={i} className="leading-relaxed">
            {p}
          </p>
        ))}
        <p>
          LUMINA compositions reward patience — wear this article’s ideas on skin, not only on
          screen. Visit our shop to discover fragrances that embody these principles.
        </p>
      </div>
    </article>
  );
}
