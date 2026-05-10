import type { Metadata } from "next";
import Link from "next/link";
import { PortableText } from "@portabletext/react";
import { notFound } from "next/navigation";
import { getSanityReadClient } from "@/lib/sanity/client";
import { BLOG_POST_QUERY } from "@/lib/sanity/queries";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const client = getSanityReadClient();
  if (!client) return { title: "Blog" };
  const post = await client.fetch(BLOG_POST_QUERY, { slug });
  return {
    title: post?.seoTitle || post?.title || "Post",
    description: post?.seoDescription || post?.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const client = getSanityReadClient();
  if (!client) notFound();

  const post = await client.fetch(BLOG_POST_QUERY, { slug });
  if (!post) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/blog" className="text-xs uppercase tracking-widest text-gold hover:underline">
        ← Blog
      </Link>
      <h1 className="mt-6 font-serif text-4xl">{post.title}</h1>
      {post.publishedAt ? (
        <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
          {new Date(post.publishedAt).toLocaleDateString()}
        </p>
      ) : null}
      <div className="prose prose-invert mt-10 max-w-none prose-headings:font-serif prose-a:text-gold">
        {post.body ? <PortableText value={post.body} /> : null}
      </div>
    </article>
  );
}
