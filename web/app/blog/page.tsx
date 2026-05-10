import type { Metadata } from "next";
import Link from "next/link";
import { getSanityReadClient } from "@/lib/sanity/client";
import { BLOG_POSTS_QUERY } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Journal / Blog",
};

export default async function BlogPage() {
  const client = getSanityReadClient();
  if (!client) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted-foreground">
          CMS not configured. See <code className="text-xs">NEXT_PUBLIC_SANITY_PROJECT_ID</code>.
        </p>
        <Link href="/journal" className="mt-6 inline-block text-gold hover:underline">
          Read our journal →
        </Link>
      </div>
    );
  }

  const posts = await client.fetch<
    {
      _id: string;
      title: string;
      slug: string;
      publishedAt?: string;
      excerpt?: string;
    }[]
  >(BLOG_POSTS_QUERY);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-4xl">Blog</h1>
      <p className="mt-2 text-muted-foreground">
        Stories from the studio — powered by Sanity.
      </p>
      <ul className="mt-12 space-y-8">
        {(posts ?? []).map((p) => (
          <li key={p._id}>
            <Link href={`/blog/${p.slug}`} className="group block">
              <h2 className="font-serif text-2xl group-hover:text-gold">
                {p.title}
              </h2>
              {p.excerpt ? (
                <p className="mt-2 text-muted-foreground">{p.excerpt}</p>
              ) : null}
              {p.publishedAt ? (
                <p className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">
                  {new Date(p.publishedAt).toLocaleDateString()}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
