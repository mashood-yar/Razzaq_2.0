import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ARTICLES } from "@/lib/articles";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Perfume guides, scent stories, and behind-the-scenes notes from LUMINA.",
};

export default function JournalPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-serif text-4xl sm:text-5xl">Journal</h1>
        <p className="mt-4 text-muted-foreground">
          Guides, essays, and glimpses inside our atelier.
        </p>
      </header>

      <div className="mt-16 grid gap-12 md:grid-cols-2">
        {ARTICLES.map((a) => (
          <article
            key={a.slug}
            className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/40 backdrop-blur-md transition-colors hover:border-gold/30"
          >
            <Link href={`/journal/${a.slug}`} className="relative aspect-[16/10] bg-muted">
              <Image
                src={a.image}
                alt=""
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width:768px) 100vw, 50vw"
              />
            </Link>
            <div className="flex flex-1 flex-col p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                {a.category}
              </p>
              <h2 className="mt-3 font-serif text-2xl">
                <Link href={`/journal/${a.slug}`} className="hover:text-gold">
                  {a.title}
                </Link>
              </h2>
              <p className="mt-3 flex-1 text-sm text-muted-foreground">{a.excerpt}</p>
              <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                <span>{a.date}</span>
                <span>{a.readTime}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
