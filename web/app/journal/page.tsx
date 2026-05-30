import type { Metadata } from "next";
import { ARTICLES } from "@/lib/articles";
import { JournalScroll } from "@/components/journal/journal-scroll";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "The RazzaqLuxe Journal",
  description:
    "Stories of craft, culture, and the art of living well — fragrance guides, culture essays, and behind-the-scenes notes from RazzaqLuxe.",
  path: "/journal",
});

export default function JournalPage() {
  const featuredSlug = ARTICLES[0]?.slug ?? "";

  return (
    <JournalScroll articles={ARTICLES} featuredSlug={featuredSlug} />
  );
}
