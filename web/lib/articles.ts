import type { Article } from "./types";

export const ARTICLES: Article[] = [
  {
    slug: "layering-fragrance-like-a-perfumer",
    title: "Layering Fragrance Like a Perfumer",
    excerpt:
      "How to build depth without chaos—base rules, timing, and pairings that honor each composition.",
    date: "2026-03-12",
    readTime: "8 min read",
    image: "/images/areeb.png",
    category: "Guides",
    body: [
      "Layering is not about spraying more—it is about choreography. Start with the quietest molecular textures and finish with the loudest resins or woods.",
      "At LUMINA, we recommend pairing shared DNA: if your skin pulls citrus forward, anchor with a sandalwood veil rather than another citrus blast.",
      "Time matters: allow each layer ninety seconds to settle before judging the silhouette.",
    ],
  },
  {
    slug: "oud-without-intimidation",
    title: "Oud Without Intimidation",
    excerpt:
      "Understanding barnyard versus noble oud—and why modern compositions invite newcomers.",
    date: "2026-02-28",
    readTime: "6 min read",
    image: "/images/oud-without-intimidation.png",
    category: "Stories",
    body: [
      "Traditional oud can read fierce on first encounter. Our niche blends temper resin with florals or citrus so the journey feels cinematic rather than aggressive.",
      "Look for maceration notes in our journals—each batch rests longer than industry standard so sharp edges round naturally.",
    ],
  },
  {
    slug: "behind-the-blending-room-door",
    title: "Behind the Blending Room Door",
    excerpt:
      "A night inside our Paris atelier—pipettes, silence, and the moment a formula locks.",
    date: "2026-01-14",
    readTime: "10 min read",
    image: "/images/behind-blending-room.png",
    category: "Behind the Scenes",
    body: [
      "Visitors describe our blending room as a temple of glass—every raw material labeled by harvest year.",
      "When a trial reaches ‘lock’ status, three perfumers must agree independently—a ritual that slows us down and protects quality.",
    ],
  },
  {
    slug: "sillage-etiquette-modern-world",
    title: "Sillage Etiquette in the Modern World",
    excerpt:
      "Projection as generosity versus intrusion—a concise etiquette guide for offices, transit, and intimacy.",
    date: "2025-12-02",
    readTime: "5 min read",
    image: "/images/habibi-promo.png",
    category: "Journal",
    body: [
      "Fragrance should invite someone closer—not announce you three corridors away.",
      "For enclosed spaces, favor skin scents or atomizer half-pumps; refresh outdoors.",
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}
