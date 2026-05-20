import type { Article } from "./types";

export const JOURNAL_CATEGORIES = [
  "All",
  "Fragrance",
  "Culture",
  "Lifestyle",
  "Behind the Scenes",
  "Travel",
] as const;

export type JournalCategory = (typeof JOURNAL_CATEGORIES)[number];

export const ARTICLES: Article[] = [
  {
    slug: "layering-fragrance-like-a-perfumer",
    title: "Layering Fragrance Like a Perfumer",
    excerpt:
      "How to build depth without chaos—base rules, timing, and pairings that honor each composition.",
    date: "2026-03-12",
    readTime: "8 min read",
    image: "/images/layering-fragrance.png",
    category: "Fragrance",
    author: "Sana Razzaq",
    body: [
      "Layering is not about spraying more—it is about choreography. Start with the quietest molecular textures and finish with the loudest resins or woods.",
      "At Razzaq Luxe, we recommend pairing shared DNA: if your skin pulls citrus forward, anchor with a sandalwood veil rather than another citrus blast.",
      "Time matters: allow each layer ninety seconds to settle before judging the silhouette. What reads sharp at first spray often melts into something luminous within minutes.",
      "For evening wear, try a skin-scent base with a single bold accent on pulse points—not everywhere. Restraint is the mark of someone who understands perfume.",
    ],
    pullQuotes: [
      "Layering is not about spraying more—it is about choreography.",
    ],
  },
  {
    slug: "oud-without-intimidation",
    title: "Oud Without Intimidation",
    excerpt:
      "Understanding barnyard versus noble oud—and why modern compositions invite newcomers.",
    date: "2026-02-28",
    readTime: "6 min read",
    image: "/images/habibi.png",
    category: "Fragrance",
    author: "Imran Khattak",
    body: [
      "Traditional oud can read fierce on first encounter. Our niche blends temper resin with florals or citrus so the journey feels cinematic rather than aggressive.",
      "Look for maceration notes in our journals—each batch rests longer than industry standard so sharp edges round naturally.",
      "Pakistani oud culture runs deep: from Multan's bazaars to quiet family distilleries, the resin carries centuries of ritual. Modern wearers need not fear it—they need only find their entry point.",
    ],
    pullQuotes: [
      "Modern wearers need not fear oud—they need only find their entry point.",
    ],
  },
  {
    slug: "behind-the-blending-room-door",
    title: "Behind the Blending Room Door",
    excerpt:
      "A night inside our Quetta atelier—pipettes, silence, and the moment a formula locks.",
    date: "2026-01-14",
    readTime: "10 min read",
    image: "/images/girl.png",
    category: "Behind the Scenes",
    author: "Sana Razzaq",
    body: [
      "Visitors describe our blending room as a temple of glass—every raw material labeled by harvest year.",
      "When a trial reaches 'lock' status, three perfumers must agree independently—a ritual that slows us down and protects quality.",
      "The room stays unheated through winter. Heat alters how molecules volatilize; we want truth, not convenience.",
    ],
    pullQuotes: [
      "When a trial reaches lock status, three perfumers must agree independently.",
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
    category: "Lifestyle",
    author: "Ayesha Malik",
    body: [
      "Fragrance should invite someone closer—not announce you three corridors away.",
      "For enclosed spaces, favor skin scents or atomizer half-pumps; refresh outdoors.",
      "In Pakistani gatherings, scent is hospitality. The difference between generous and overwhelming is often one spray fewer than you think.",
    ],
  },
  {
    slug: "art-of-oud-pakistan-finest-tradition",
    title: "The Art of Oud: Pakistan's Finest Fragrance Tradition",
    excerpt:
      "From ancient trade routes to modern ateliers—how Pakistan became a guardian of noble oud.",
    date: "2026-04-01",
    readTime: "7 min read",
    image: "/images/khan.png",
    category: "Fragrance",
    author: "Imran Khattak",
    body: [
      "Long before oud became a global luxury signifier, the forests and distilleries of Pakistan's north and south were already shaping how the world understood resin.",
      "The difference between mass-market oud and artisan batches lies in patience: our partners macerate for months, sometimes years, allowing the animalic edges to soften into something wearable and profound.",
      "When you wear Pakistani oud, you wear geography—heat, altitude, and the hands that harvested it.",
    ],
    pullQuotes: [
      "When you wear Pakistani oud, you wear geography.",
    ],
  },
  {
    slug: "lahore-to-london-pakistani-craft",
    title: "From Lahore to London: How Pakistani Craft Conquered the World",
    excerpt:
      "The diaspora, the ateliers, and the quiet revolution of Pakistani luxury on global shelves.",
    date: "2026-03-20",
    readTime: "9 min read",
    image: "/images/baji.png",
    category: "Culture",
    author: "Fatima Noor",
    body: [
      "Pakistani craft was never meant to stay local. Embroidery houses in Lahore now supply Parisian couture; perfumers in Quetta export compositions to Mayfair.",
      "What changed was narrative. We stopped apologizing for our aesthetic and started telling stories rooted in place—stories that resonate from Karachi to Knightsbridge.",
      "Razzaq Luxe sits in that lineage: heritage technique, contemporary restraint, global ambition.",
    ],
  },
  {
    slug: "wabi-sabi-pakistani-aesthetic",
    title: "Wabi-Sabi and the Pakistani Aesthetic",
    excerpt:
      "Imperfection as beauty—why cracked terracotta and faded silk feel more honest than polish.",
    date: "2026-02-15",
    readTime: "6 min read",
    image: "/images/flourine.png",
    category: "Culture",
    author: "Ayesha Malik",
    body: [
      "Wabi-sabi finds beauty in transience and imperfection. Pakistani homes have practiced this for generations—hand-thrown ceramics, sun-bleached linens, brass darkened by use.",
      "Luxury does not require flawlessness. It requires intention. A worn prayer rug carries more soul than a showroom replica.",
      "Our packaging echoes this philosophy: rice paper textures, organic edges, nothing overly glossy.",
    ],
    pullQuotes: [
      "Luxury does not require flawlessness. It requires intention.",
    ],
  },
  {
    slug: "perfumers-garden-notes-multan",
    title: "The Perfumer's Garden: Notes from Multan",
    excerpt:
      "Jasmine at dawn, roses after rain—a field diary from southern Punjab's fragrant heartland.",
    date: "2026-01-28",
    readTime: "8 min read",
    image: "/images/bacha.png",
    category: "Travel",
    author: "Sana Razzaq",
    body: [
      "Multan wakes up smelling of jasmine. By mid-morning the heat lifts rose absolute from walled gardens that have supplied perfumers for centuries.",
      "We spent a week with local growers documenting harvest windows—the difference of a single day can shift an entire batch's character.",
      "Travel, for a perfumer, is research. Every city leaves a note on the blotter.",
    ],
  },
  {
    slug: "dressing-for-eid-pakistani-luxury",
    title: "Dressing for Eid: A Modern Guide to Pakistani Luxury",
    excerpt:
      "Fabric, fragrance, and the art of showing up—contemporary elegance for the year's finest gatherings.",
    date: "2025-11-18",
    readTime: "5 min read",
    image: "/images/areeb.png",
    category: "Lifestyle",
    author: "Fatima Noor",
    body: [
      "Eid dressing is theatre. The fabric should breathe; the scent should whisper at the door and bloom in embrace.",
      "We recommend one statement piece—embroidered cuff, bold attar, heirloom brooch—and everything else quiet.",
      "Fragrance layering for Eid: a clean musk base, a floral heart, and a single oud accent on the wrists. Enough to be remembered, not enough to dominate the room.",
    ],
  },
  {
    slug: "story-behind-habibi-beloved-scent",
    title: "The Story Behind Habibi — Our Most Beloved Scent",
    excerpt:
      "Fourteen iterations, one word from a grandmother, and the formula that finally felt like home.",
    date: "2025-10-05",
    readTime: "7 min read",
    image: "/images/habibi-promo.png",
    category: "Behind the Scenes",
    author: "Imran Khattak",
    body: [
      "Habibi began as a brief: warm, unisex, instantly recognizable but impossible to copy. Thirteen versions failed the test of wearing it for a full day.",
      "Version fourteen opened with saffron and settled into sandalwood and soft amber—the moment our founder said it smelled like her grandmother's drawing room in Quetta.",
      "We locked the formula that week. Some scents find you; Habibi found us.",
    ],
    pullQuotes: [
      "Some scents find you; Habibi found us.",
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getRelatedArticles(
  slug: string,
  limit = 3,
): Article[] {
  const current = getArticleBySlug(slug);
  if (!current) return ARTICLES.slice(0, limit);

  const sameCategory = ARTICLES.filter(
    (a) => a.slug !== slug && a.category === current.category,
  );
  const rest = ARTICLES.filter(
    (a) => a.slug !== slug && a.category !== current.category,
  );

  return [...sameCategory, ...rest].slice(0, limit);
}

export function formatArticleDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function authorInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
