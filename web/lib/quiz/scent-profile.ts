import { HOUSE_PRODUCTS } from "@/lib/house-products";
import { PRODUCT_PLACEHOLDER_SRC } from "@/lib/product-image";
import type { MainNoteCategory } from "@/lib/types";
import type { LegacyProduct } from "@/lib/products";

export type WearAnswer = "day" | "evening" | "both" | "special";
export type MoodAnswer = "bold" | "soft" | "fresh" | "mysterious";
export type FamilyAnswer = "oud" | "floral" | "citrus" | "amber";
export type IntensityAnswer = "subtle" | "moderate" | "bold" | "statement";

export type ScentQuizAnswers = {
  wear: WearAnswer;
  mood: MoodAnswer;
  family: FamilyAnswer;
  intensity: IntensityAnswer;
};

export type ScentQuizRecommendation = {
  slug: string;
  name: string;
  image: string;
  tagline?: string;
};

export type ScentProfile = {
  label: string;
  answers: ScentQuizAnswers;
  recommendedSlugs: string[];
  recommendations: ScentQuizRecommendation[];
  completedAt: string;
};

export const SCENT_PROFILE_STORAGE_KEY = "razzaq-luxe-scent-profile";

export const QUIZ_QUESTIONS = [
  {
    id: "wear" as const,
    title: "When do you wear fragrance?",
    subtitle: "Choose the moment that feels most like you.",
    options: [
      { value: "day" as const, label: "Day", hint: "Morning meetings, errands, sunshine" },
      { value: "evening" as const, label: "Evening", hint: "Dinners, dates, after dark" },
      { value: "both" as const, label: "Both", hint: "From desk to dinner without switching" },
      {
        value: "special" as const,
        label: "Special occasions",
        hint: "Weddings, celebrations, rare nights out",
      },
    ],
  },
  {
    id: "mood" as const,
    title: "What mood are you going for?",
    subtitle: "The feeling you want others to sense before you speak.",
    options: [
      { value: "bold" as const, label: "Bold & confident", hint: "Command the room" },
      { value: "soft" as const, label: "Soft & romantic", hint: "Warm, intimate, inviting" },
      { value: "fresh" as const, label: "Fresh & clean", hint: "Crisp, effortless, airy" },
      { value: "mysterious" as const, label: "Mysterious & deep", hint: "Magnetic, layered, unforgettable" },
    ],
  },
  {
    id: "family" as const,
    title: "Preferred scent family?",
    subtitle: "The note families that pull you in.",
    options: [
      { value: "oud" as const, label: "Oud & woody", hint: "Resinous depth, sandalwood, cedar" },
      { value: "floral" as const, label: "Floral & rose", hint: "Petals, jasmine, soft bloom" },
      { value: "citrus" as const, label: "Citrus & fresh", hint: "Bergamot, zest, green lift" },
      { value: "amber" as const, label: "Amber & warm", hint: "Vanilla, balsam, golden glow" },
    ],
  },
  {
    id: "intensity" as const,
    title: "How strong do you like your scent?",
    subtitle: "Your ideal projection and longevity.",
    options: [
      { value: "subtle" as const, label: "Subtle", hint: "Skin-close, whispered elegance" },
      { value: "moderate" as const, label: "Moderate", hint: "Present but never overwhelming" },
      { value: "bold" as const, label: "Bold", hint: "Confident trail that lingers" },
      { value: "statement" as const, label: "Statement", hint: "Maximum presence, unforgettable sillage" },
    ],
  },
] as const;

const MOOD_NOTES: Record<MoodAnswer, MainNoteCategory[]> = {
  bold: ["Woody", "Oriental", "Spicy"],
  soft: ["Floral", "Gourmand", "Fresh"],
  fresh: ["Citrus", "Fresh"],
  mysterious: ["Oriental", "Woody", "Amber"],
};

const FAMILY_NOTES: Record<FamilyAnswer, MainNoteCategory[]> = {
  oud: ["Woody", "Oriental", "Spicy"],
  floral: ["Floral", "Fresh"],
  citrus: ["Citrus", "Fresh"],
  amber: ["Amber", "Oriental", "Gourmand"],
};

const WEAR_SIALLAGE: Record<WearAnswer, number> = {
  day: 2,
  evening: 4,
  both: 3,
  special: 4,
};

const INTENSITY_SIALLAGE: Record<IntensityAnswer, number> = {
  subtle: 2,
  moderate: 3,
  bold: 4,
  statement: 5,
};

/** Fallback slugs when catalog is thin — house fragrances. */
export const QUIZ_FALLBACK_SLUGS = ["habibi", "sporty", "flourine", "khans-aura"] as const;

const WEAR_LABEL: Record<WearAnswer, string> = {
  day: "Day",
  evening: "Evening",
  both: "All-Day",
  special: "Occasion",
};

const FAMILY_LABEL: Record<FamilyAnswer, string> = {
  oud: "Oud",
  floral: "Floral",
  citrus: "Fresh",
  amber: "Amber",
};

const MOOD_LABEL: Record<MoodAnswer, string> = {
  bold: "Bold",
  soft: "Romantic",
  fresh: "Fresh",
  mysterious: "Mysterious",
};

export function generateScentProfileLabel(answers: ScentQuizAnswers): string {
  const wear = WEAR_LABEL[answers.wear];
  const family = FAMILY_LABEL[answers.family];
  const mood = MOOD_LABEL[answers.mood];

  if (answers.wear === "evening" && answers.family === "oud") {
    return "The Evening Oud Connoisseur";
  }
  if (answers.wear === "day" && (answers.family === "citrus" || answers.mood === "fresh")) {
    return "The Fresh Day Walker";
  }
  if (answers.mood === "mysterious" && answers.family === "oud") {
    return "The Midnight Oud Mystic";
  }
  if (answers.mood === "soft" && answers.family === "floral") {
    return "The Romantic Bloom";
  }
  if (answers.intensity === "statement") {
    return `The ${wear} ${family} Icon`;
  }
  if (answers.wear === "special") {
    return `The ${mood} Occasion Muse`;
  }
  if (answers.wear === "both") {
    return `The Versatile ${family} Soul`;
  }
  return `The ${wear} ${mood} ${family} Curator`;
}

export function scoreProductsForScentQuiz(
  catalog: LegacyProduct[],
  answers: ScentQuizAnswers,
): LegacyProduct[] {
  const preferred = new Set<MainNoteCategory>();
  for (const n of MOOD_NOTES[answers.mood]) preferred.add(n);
  for (const n of FAMILY_NOTES[answers.family]) preferred.add(n);

  const targetSillage =
    (WEAR_SIALLAGE[answers.wear] + INTENSITY_SIALLAGE[answers.intensity]) / 2;

  const scored = catalog.map((product) => {
    let score = 0;
    for (const note of product.mainNotes) {
      if (preferred.has(note)) score += 3;
    }
    const sillageDelta = Math.abs(product.sillage - targetSillage);
    score += Math.max(0, 4 - sillageDelta * 1.5);
    if (answers.intensity === "statement" && product.sillage >= 4) score += 2;
    if (answers.intensity === "subtle" && product.sillage <= 3) score += 2;
    if (product.badge === "bestseller") score += 1;
    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const top = scored.filter((s) => s.score > 0).slice(0, 3);
  if (top.length >= 3) return top.map((s) => s.product);

  const seen = new Set(top.map((s) => s.product.slug));
  const fillers = catalog.filter((p) => !seen.has(p.slug));
  const merged = [...top.map((s) => s.product), ...fillers].slice(0, 3);
  return merged.length >= 3 ? merged : catalog.slice(0, 3);
}

const FALLBACK_NOTE_MAP: Record<string, MainNoteCategory[]> = {
  sporty: ["Citrus", "Fresh"],
  habibi: ["Oriental", "Woody", "Amber"],
  flourine: ["Fresh", "Floral"],
  "khans-aura": ["Woody", "Oriental", "Spicy"],
};

function fallbackQuizCatalog(): LegacyProduct[] {
  return HOUSE_PRODUCTS.map((h) => ({
    id: h.slug,
    slug: h.slug,
    name: h.name,
    tagline: h.tagline,
    price: 0,
    rating: 0,
    reviewCount: 0,
    gender: "unisex" as const,
    images: [PRODUCT_PLACEHOLDER_SRC],
    notes: { top: [], heart: [], base: [] },
    description: h.tagline,
    story: h.tagline,
    ingredients: "",
    longevity: 3,
    sillage: 3,
    mainNotes: FALLBACK_NOTE_MAP[h.slug] ?? ["Fresh"],
    sizes: [{ label: "50ml", ml: 50, price: 0 }],
    concentration: "Eau de Parfum",
    collection: "signature" as const,
  }));
}

export function buildScentProfile(
  answers: ScentQuizAnswers,
  products: LegacyProduct[],
): ScentProfile {
  const catalog = products.length > 0 ? products : fallbackQuizCatalog();
  const picks = scoreProductsForScentQuiz(catalog, answers);
  const recommendations: ScentQuizRecommendation[] = picks.map((p) => ({
    slug: p.slug,
    name: p.name,
    image: p.images[0] ?? "",
    tagline: p.tagline,
  }));

  return {
    label: generateScentProfileLabel(answers),
    answers,
    recommendedSlugs: recommendations.map((r) => r.slug),
    recommendations,
    completedAt: new Date().toISOString(),
  };
}

export function parseScentProfile(raw: unknown): ScentProfile | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.label !== "string" || !o.label.trim()) return null;
  if (!o.answers || typeof o.answers !== "object") return null;
  const a = o.answers as Record<string, unknown>;
  const wear = a.wear;
  const mood = a.mood;
  const family = a.family;
  const intensity = a.intensity;
  if (
    typeof wear !== "string" ||
    typeof mood !== "string" ||
    typeof family !== "string" ||
    typeof intensity !== "string"
  ) {
    return null;
  }
  const answers: ScentQuizAnswers = {
    wear: wear as WearAnswer,
    mood: mood as MoodAnswer,
    family: family as FamilyAnswer,
    intensity: intensity as IntensityAnswer,
  };
  const recommendations = Array.isArray(o.recommendations)
    ? (o.recommendations as ScentQuizRecommendation[]).filter(
        (r) => r && typeof r.slug === "string" && typeof r.name === "string",
      )
    : [];
  const recommendedSlugs = Array.isArray(o.recommendedSlugs)
    ? (o.recommendedSlugs as string[]).filter((s) => typeof s === "string")
    : recommendations.map((r) => r.slug);

  return {
    label: o.label,
    answers,
    recommendedSlugs,
    recommendations,
    completedAt:
      typeof o.completedAt === "string" ? o.completedAt : new Date().toISOString(),
  };
}

export function readScentProfileFromStorage(): ScentProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SCENT_PROFILE_STORAGE_KEY);
    if (!raw) return null;
    return parseScentProfile(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeScentProfileToStorage(profile: ScentProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SCENT_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function clearScentProfileStorage(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SCENT_PROFILE_STORAGE_KEY);
}
