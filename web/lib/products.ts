import type { MainNoteCategory } from "./types";

// Legacy fragrance catalog — all `price` / `compareAtPrice` / variant prices are PKR (whole rupees).
// The live store uses the Supabase Product type from lib/types.ts
export type LegacyProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  gender: "men" | "women" | "unisex";
  images: string[];
  badge?: "bestseller" | "new" | "limited";
  notes: { top: string[]; heart: string[]; base: string[] };
  description: string;
  story: string;
  ingredients: string;
  longevity: number;
  sillage: number;
  mainNotes: MainNoteCategory[];
  sizes: { label: string; ml: number; price: number }[];
  concentration: string;
  collection: "signature" | "limited" | "atelier";
};

const img = (path: string) =>
  `https://images.unsplash.com/${path}?auto=format&fit=crop&w=1200&q=80`;

/** Curated perfume imagery — dramatic lighting, editorial style */
export const PRODUCTS: LegacyProduct[] = [
  {
    id: "p1",
    slug: "nocturne-oud",
    name: "Nocturne Oud",
    tagline: "Midnight resin wrapped in silk smoke.",
    price: 81250,
    compareAtPrice: 91200,
    rating: 4.9,
    reviewCount: 312,
    gender: "unisex",
    images: [
      img("photo-1541643600914-78b084683601"),
      img("photo-1594035910387-fea47794261f"),
      img("photo-1563170351-be82bc9200ba"),
    ],
    badge: "bestseller",
    notes: {
      top: ["Saffron", "Black Pepper", "Raspberry"],
      heart: ["Rose de Mai", "Olibanum", "Patchouli"],
      base: ["Agarwood", "Vanilla Absolute", "Birch Tar"],
    },
    description:
      "A commanding oud-forward composition that opens with luminous spice and settles into the deepest, silkiest wood accord LUMINA has ever crafted.",
    story:
      "Inspired by candlelit galleries after midnight, Nocturne Oud was composed as a single wearable sculpture—bold yet whisper-soft on skin.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Limonene, Linalool.",
    longevity: 5,
    sillage: 5,
    mainNotes: ["Woody", "Oriental", "Spicy"],
    sizes: [
      { label: "30 ml", ml: 30, price: 41350 },
      { label: "50 ml", ml: 50, price: 58450 },
      { label: "100 ml", ml: 100, price: 81250 },
    ],
    concentration: "Eau de Parfum",
    collection: "signature",
  },
  {
    id: "p2",
    slug: "celestial-vanilla",
    name: "Celestial Vanilla",
    tagline: "Cloud-soft gourmand radiance.",
    price: 69850,
    rating: 4.8,
    reviewCount: 198,
    gender: "women",
    images: [
      img("photo-1594035910387-fea47794261f"),
      img("photo-1541643600914-78b084683601"),
    ],
    badge: "new",
    notes: {
      top: ["Mandarin", "Pear Sorbet"],
      heart: ["Tahitian Vanilla", "Heliotrope", "Orange Blossom"],
      base: ["Sandalwood", "Tonka Bean", "White Musk"],
    },
    description:
      "An airy vanilla that refuses sweetness without restraint—creamy, luminous, and impossibly refined.",
    story:
      "Our perfumers layered three vanilla extractions to achieve a halo effect: close to skin it reads intimate; in motion, it glows.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Benzyl Salicylate.",
    longevity: 4,
    sillage: 3,
    mainNotes: ["Gourmand", "Floral", "Oriental"],
    sizes: [
      { label: "30 ml", ml: 30, price: 35650 },
      { label: "50 ml", ml: 50, price: 49900 },
      { label: "100 ml", ml: 100, price: 69850 },
    ],
    concentration: "Eau de Parfum",
    collection: "signature",
  },
  {
    id: "p3",
    slug: "emerald-iris",
    name: "Emerald Iris",
    tagline: "Green stems, velvet petals, cool stone.",
    price: 76400,
    rating: 4.7,
    reviewCount: 156,
    gender: "unisex",
    images: [
      img("photo-1563170351-be82bc9200ba"),
      img("photo-1541643600914-78b084683601"),
    ],
    notes: {
      top: ["Galbanum", "Violet Leaf", "Bergamot"],
      heart: ["Orris Butter", "Peony", "Mint"],
      base: ["Vetiver", "Moss", "Cedarwood"],
    },
    description:
      "The feeling of morning in a walled garden—crushed stems, chalky iris, and vetiver rooted in wet earth.",
    story:
      "Emerald Iris celebrates contraries: classical French iris pallida with a flash of cold Japanese mint.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Alpha-Isomethyl Ionone.",
    longevity: 4,
    sillage: 3,
    mainNotes: ["Floral", "Fresh", "Woody"],
    sizes: [
      { label: "30 ml", ml: 30, price: 39350 },
      { label: "50 ml", ml: 50, price: 56450 },
      { label: "100 ml", ml: 100, price: 76400 },
    ],
    concentration: "Eau de Parfum",
    collection: "atelier",
  },
  {
    id: "p4",
    slug: "midnight-santal",
    name: "Midnight Santal",
    tagline: "Warm skin, cold metal, sacred wood.",
    price: 72700,
    rating: 4.9,
    reviewCount: 421,
    gender: "men",
    images: [
      img("photo-1541643600914-78b084683601"),
      img("photo-1541643600914-78b084683601"),
    ],
    badge: "bestseller",
    notes: {
      top: ["Cardamom", "Pink Pepper", "Fig Leaf"],
      heart: ["Sandalwood", "Cashmere Woods", "Iris"],
      base: ["Leather Accord", "Amber", "Musk"],
    },
    description:
      "Santal elevated—creamy, contemplative, with a trace of urban mineral tension.",
    story:
      "Midnight Santal was worn for 18 months in private before release; every batch is macerated an additional 4 weeks.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Coumarin.",
    longevity: 5,
    sillage: 4,
    mainNotes: ["Woody", "Oriental", "Fresh"],
    sizes: [
      { label: "30 ml", ml: 30, price: 38500 },
      { label: "50 ml", ml: 50, price: 53850 },
      { label: "100 ml", ml: 100, price: 72700 },
    ],
    concentration: "Eau de Parfum",
    collection: "signature",
  },
  {
    id: "p5",
    slug: "golden-neroli",
    name: "Golden Neroli",
    tagline: "Sunlit citrus dipped in honeyed light.",
    price: 62700,
    rating: 4.6,
    reviewCount: 134,
    gender: "unisex",
    images: [
      img("photo-1594035910387-fea47794261f"),
      img("photo-1534528741775-53994a69daeb"),
    ],
    notes: {
      top: ["Bitter Orange", "Petitgrain", "Yuzu"],
      heart: ["Neroli", "Jasmine Sambac", "Honey"],
      base: ["Beeswax Absolute", "Ambrette", "Soft Musk"],
    },
    description:
      "Radiant and optimistic—golden hour distilled into a fragrance that clings like sunlight on linen.",
    story: "Composed around a single harvest of Tunisian neroli, Golden Neroli is limited each vintage.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Citral, Geraniol.",
    longevity: 3,
    sillage: 3,
    mainNotes: ["Citrus", "Floral", "Fresh"],
    sizes: [
      { label: "30 ml", ml: 30, price: 33650 },
      { label: "50 ml", ml: 50, price: 47050 },
      { label: "100 ml", ml: 100, price: 62700 },
    ],
    concentration: "Eau de Parfum",
    collection: "signature",
  },
  {
    id: "p6",
    slug: "velvet-rose-oud",
    name: "Velvet Rose Oud",
    tagline: "Jammy rose over smoldering coals.",
    price: 84100,
    compareAtPrice: 96900,
    rating: 4.8,
    reviewCount: 267,
    gender: "women",
    images: [
      img("photo-1534528741775-53994a69daeb"),
      img("photo-1594035910387-fea47794261f"),
    ],
    badge: "limited",
    notes: {
      top: ["Lychee", "Pink Pepper"],
      heart: ["Turkish Rose", "Geranium"],
      base: ["Laotian Oud", "Patchouli", "Suede"],
    },
    description:
      "Opulent rose refracted through precious oud—a limited composition for collectors.",
    story:
      "Velvet Rose Oud uses rose absolute from Isparta; each bottle is numbered by hand.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Eugenol.",
    longevity: 5,
    sillage: 5,
    mainNotes: ["Floral", "Oriental", "Woody"],
    sizes: [
      { label: "30 ml", ml: 30, price: 44200 },
      { label: "50 ml", ml: 50, price: 64150 },
      { label: "100 ml", ml: 100, price: 84100 },
    ],
    concentration: "Parfum",
    collection: "limited",
  },
  {
    id: "p7",
    slug: "silk-musk",
    name: "Silk Musk",
    tagline: "Second-skin musk, whisper clarity.",
    price: 56450,
    rating: 4.5,
    reviewCount: 89,
    gender: "unisex",
    images: [
      img("photo-1587017539504-67cfbddac569"),
      img("photo-1563170351-be82bc9200ba"),
    ],
    notes: {
      top: ["Aldehydes", "Bergamot"],
      heart: ["White Musk", "Lily of the Valley"],
      base: ["Ambroxan", "Sandalwood", "Skin Accord"],
    },
    description:
      "Minimalist architecture—a fragrance that feels like expensive fabric against warm skin.",
    story:
      "Silk Musk is our quiet bestseller among creatives who want presence without projection.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua.",
    longevity: 4,
    sillage: 2,
    mainNotes: ["Fresh", "Floral"],
    sizes: [
      { label: "30 ml", ml: 30, price: 30800 },
      { label: "50 ml", ml: 50, price: 42200 },
      { label: "100 ml", ml: 100, price: 56450 },
    ],
    concentration: "Eau de Parfum",
    collection: "atelier",
  },
  {
    id: "p8",
    slug: "amber-noir",
    name: "Amber Noir",
    tagline: "Molten amber, shadow spices.",
    price: 68400,
    rating: 4.7,
    reviewCount: 176,
    gender: "men",
    images: [
      img("photo-1608248597279-f99d160bfcbc"),
      img("photo-1594035910387-fea47794261f"),
    ],
    badge: "new",
    notes: {
      top: ["Cinnamon", "Nutmeg", "Bergamot"],
      heart: ["Amber Resin", "Labdanum", "Geranium"],
      base: ["Vanilla", "Musk", "Styrax"],
    },
    description:
      "Spiced amber with a couture silhouette—perfect for evening signatures.",
    story:
      "Amber Noir channels old-world parfumerie with modern transparency in the dry-down.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Cinnamal.",
    longevity: 5,
    sillage: 4,
    mainNotes: ["Amber", "Oriental", "Spicy"],
    sizes: [
      { label: "30 ml", ml: 30, price: 36500 },
      { label: "50 ml", ml: 50, price: 50750 },
      { label: "100 ml", ml: 100, price: 68400 },
    ],
    concentration: "Eau de Parfum",
    collection: "signature",
  },
  {
    id: "p9",
    slug: "crystal-vetiver",
    name: "Crystal Vetiver",
    tagline: "Frozen roots, bright grapefruit.",
    price: 61300,
    rating: 4.6,
    reviewCount: 112,
    gender: "unisex",
    images: [
      img("photo-1506794778202-cad84cf45f1d"),
      img("photo-1541643600914-78b084683601"),
    ],
    notes: {
      top: ["Grapefruit", "Mint", "Blackcurrant"],
      heart: ["Vetiver Heart", "Green Tea", "Nutmeg"],
      base: ["Cedar", "Iso E Super", "Musk"],
    },
    description:
      "Vetiver stripped to its essential brightness—crisp, contemporary, endlessly wearable.",
    story:
      "Crystal Vetiver was designed as an antidote to heavy woody trends.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Limonene.",
    longevity: 4,
    sillage: 3,
    mainNotes: ["Fresh", "Woody", "Citrus"],
    sizes: [
      { label: "30 ml", ml: 30, price: 32800 },
      { label: "50 ml", ml: 50, price: 46150 },
      { label: "100 ml", ml: 100, price: 61300 },
    ],
    concentration: "Eau de Parfum",
    collection: "atelier",
  },
  {
    id: "p10",
    slug: "lunar-jasmine",
    name: "Lunar Jasmine",
    tagline: "Night-blooming vines under silver.",
    price: 73550,
    rating: 4.8,
    reviewCount: 203,
    gender: "women",
    images: [
      img("photo-1586495777744-4413f21062fa"),
      img("photo-1594035910387-fea47794261f"),
    ],
    badge: "bestseller",
    notes: {
      top: ["Green Tea", "Pear"],
      heart: ["Sambac Jasmine", "Tuberose", "Spice"],
      base: ["Sandalwood", "White Amber", "Musk"],
    },
    description:
      "Heady jasmine restrained by cool tea—seductive yet disciplined.",
    story:
      "Hand-picked jasmine blossoms processed within hours for maximum fidelity.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Benzyl Alcohol.",
    longevity: 4,
    sillage: 4,
    mainNotes: ["Floral", "Oriental", "Fresh"],
    sizes: [
      { label: "30 ml", ml: 30, price: 37600 },
      { label: "50 ml", ml: 50, price: 53600 },
      { label: "100 ml", ml: 100, price: 73550 },
    ],
    concentration: "Eau de Parfum",
    collection: "signature",
  },
  {
    id: "p11",
    slug: "obsidian-smoke",
    name: "Obsidian Smoke",
    tagline: "Incense trails through mineral halls.",
    price: 78400,
    rating: 4.9,
    reviewCount: 144,
    gender: "unisex",
    images: [
      img("photo-1612817288484-6f916006741a"),
      img("photo-1541643600914-78b084683601"),
    ],
    badge: "limited",
    notes: {
      top: ["Elemi", "Cumin", "Lemon"],
      heart: ["Incense", "Cistus", "Rose"],
      base: ["Benzoin", "Oakmoss", "Leather"],
    },
    description:
      "Architectural incense—smoky, stony, with a lacquered finish.",
    story:
      "Limited to 2,000 bottles worldwide; each cap is cast from recycled obsidian dust.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua.",
    longevity: 5,
    sillage: 5,
    mainNotes: ["Oriental", "Woody", "Spicy"],
    sizes: [
      { label: "30 ml", ml: 30, price: 42200 },
      { label: "50 ml", ml: 50, price: 59300 },
      { label: "100 ml", ml: 100, price: 78400 },
    ],
    concentration: "Parfum",
    collection: "limited",
  },
  {
    id: "p12",
    slug: "pearl-gardenia",
    name: "Pearl Gardenia",
    tagline: "Creamy petals, salt air.",
    price: 66100,
    rating: 4.5,
    reviewCount: 98,
    gender: "women",
    images: [
      img("photo-1610945265064-0e34e5512bbe"),
      img("photo-1534528741775-53994a69daeb"),
    ],
    notes: {
      top: ["Sea Salt", "Muguet"],
      heart: ["Gardenia", "Frangipani", "Ylang"],
      base: ["Sandalwood", "Vanilla", "Musk"],
    },
    description:
      "Tropical white florals cooled by oceanic salt—a vacation in haute concentration.",
    story:
      "Pearl Gardenia captures the founder’s summers on the Amalfi coast.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Linalool.",
    longevity: 4,
    sillage: 3,
    mainNotes: ["Floral", "Fresh", "Gourmand"],
    sizes: [
      { label: "30 ml", ml: 30, price: 34750 },
      { label: "50 ml", ml: 50, price: 49000 },
      { label: "100 ml", ml: 100, price: 66100 },
    ],
    concentration: "Eau de Parfum",
    collection: "atelier",
  },
  {
    id: "p13",
    slug: "scarlet-saffron",
    name: "Scarlet Saffron",
    tagline: "Threads of gold on warm skin.",
    price: 82100,
    rating: 4.8,
    reviewCount: 167,
    gender: "unisex",
    images: [
      img("photo-1590736969955-71cc94901144"),
      img("photo-1563170351-be82bc9200ba"),
    ],
    notes: {
      top: ["Saffron", "Blood Orange"],
      heart: ["Rose", "Cinnamon Bark"],
      base: ["Agarwood", "Patchouli", "Ambrette"],
    },
    description:
      "Scarlet Saffron is spice-forward luxury—rich without obscuring clarity.",
    story:
      "Uses Kashmiri saffron sourced through our ethical growers collective.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua.",
    longevity: 5,
    sillage: 4,
    mainNotes: ["Spicy", "Oriental", "Woody"],
    sizes: [
      { label: "30 ml", ml: 30, price: 42200 },
      { label: "50 ml", ml: 50, price: 60400 },
      { label: "100 ml", ml: 100, price: 82100 },
    ],
    concentration: "Eau de Parfum",
    collection: "signature",
  },
  {
    id: "p14",
    slug: "alpine-frost",
    name: "Alpine Frost",
    tagline: "Ice pine, crushed juniper, alpine air.",
    price: 59300,
    rating: 4.6,
    reviewCount: 121,
    gender: "men",
    images: [
      img("photo-1519669011789-247155b987da"),
      img("photo-1506794778202-cad84cf45f1d"),
    ],
    badge: "new",
    notes: {
      top: ["Juniper", "Lime", "Peppermint"],
      heart: ["Pine Needle", "Lavender", "Artemisia"],
      base: ["Musk", "Cedar", "Ambroxan"],
    },
    description:
      "Crystalline freshness for the minimalist who still wants character.",
    story:
      "Alpine Frost was tested at altitude to ensure its ozonic notes bloom in cold air.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua.",
    longevity: 3,
    sillage: 3,
    mainNotes: ["Fresh", "Woody", "Citrus"],
    sizes: [
      { label: "30 ml", ml: 30, price: 31900 },
      { label: "50 ml", ml: 50, price: 44450 },
      { label: "100 ml", ml: 100, price: 59300 },
    ],
    concentration: "Eau de Parfum",
    collection: "atelier",
  },
  {
    id: "p15",
    slug: "velvet-tabac",
    name: "Velvet Tabac",
    tagline: "Pipe tobacco, dried plum, old libraries.",
    price: 70700,
    rating: 4.7,
    reviewCount: 154,
    gender: "men",
    images: [
      img("photo-1608571423902-eed4a5bdb810"),
      img("photo-1594035910387-fea47794261f"),
    ],
    notes: {
      top: ["Dried Plum", "Honey", "Spices"],
      heart: ["Tobacco Absolute", "Cocoa", "Clary Sage"],
      base: ["Vetiver", "Tonka", "Leather"],
    },
    description:
      "A bibliophile’s tobacco—smoky, plush, and infinitely comforting.",
    story:
      "Velvet Tabac layers three tobacco absolutes for depth without heaviness.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua.",
    longevity: 5,
    sillage: 4,
    mainNotes: ["Woody", "Oriental", "Gourmand"],
    sizes: [
      { label: "30 ml", ml: 30, price: 36500 },
      { label: "50 ml", ml: 50, price: 51850 },
      { label: "100 ml", ml: 100, price: 70700 },
    ],
    concentration: "Eau de Parfum",
    collection: "signature",
  },
  {
    id: "p16",
    slug: "rose-quartz",
    name: "Rose Quartz",
    tagline: "Powdery rose quartz light.",
    price: 64150,
    rating: 4.4,
    reviewCount: 76,
    gender: "women",
    images: [
      img("photo-1523293182080-0e433cb9416d"),
      img("photo-1586495777744-4413f21062fa"),
    ],
    notes: {
      top: ["Pink Pepper", "Lychee"],
      heart: ["Bulgarian Rose", "Peony", "Peach Skin"],
      base: ["Musk", "Sandalwood", "Heliotrope"],
    },
    description:
      "Romantic yet modern—rose refracted through pastel musks.",
    story: "Rose Quartz is our bridal collection cornerstone.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua.",
    longevity: 4,
    sillage: 3,
    mainNotes: ["Floral", "Fresh", "Gourmand"],
    sizes: [
      { label: "30 ml", ml: 30, price: 33650 },
      { label: "50 ml", ml: 50, price: 47900 },
      { label: "100 ml", ml: 100, price: 64150 },
    ],
    concentration: "Eau de Parfum",
    collection: "atelier",
  },
  {
    id: "p17",
    slug: "imperial-leather",
    name: "Imperial Leather",
    tagline: "Regal suede, citrus crown.",
    price: 74650,
    rating: 4.8,
    reviewCount: 189,
    gender: "unisex",
    images: [
      img("photo-1530639836277-dbb23cdc41f2"),
      img("photo-1541643600914-78b084683601"),
    ],
    badge: "bestseller",
    notes: {
      top: ["Bergamot", "Tangerine", "Pimento"],
      heart: ["Suede Accord", "Orris", "Carnation"],
      base: ["Vetiver", "Patchouli", "Oak"],
    },
    description:
      "Citrus collides with supple leather—powerful yet impeccably tailored.",
    story:
      "Imperial Leather was composed for a private ceremony; public demand led to its release.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua.",
    longevity: 5,
    sillage: 4,
    mainNotes: ["Woody", "Citrus", "Oriental"],
    sizes: [
      { label: "30 ml", ml: 30, price: 38500 },
      { label: "50 ml", ml: 50, price: 55600 },
      { label: "100 ml", ml: 100, price: 74650 },
    ],
    concentration: "Eau de Parfum",
    collection: "signature",
  },
  {
    id: "p18",
    slug: "dawn-yuzu",
    name: "Dawn Yuzu",
    tagline: "First light over citrus groves.",
    price: 55600,
    rating: 4.5,
    reviewCount: 91,
    gender: "unisex",
    images: [
      img("photo-1608571423902-eed4a5bdb810"),
      img("photo-1594035910387-fea47794261f"),
    ],
    notes: {
      top: ["Yuzu", "Sudachi", "Green Mandarin"],
      heart: ["Neroli", "Matcha", "Black Tea"],
      base: ["White Woods", "Musk"],
    },
    description:
      "Effervescent yuzu with a tea heart—your everyday luxury wake-up.",
    story:
      "Dawn Yuzu supports regenerative farming partnerships in Shikoku.",
    ingredients: "Alcohol Denat., Parfum (Fragrance), Aqua, Citral.",
    longevity: 3,
    sillage: 2,
    mainNotes: ["Citrus", "Fresh"],
    sizes: [
      { label: "30 ml", ml: 30, price: 29950 },
      { label: "50 ml", ml: 50, price: 42200 },
      { label: "100 ml", ml: 100, price: 55600 },
    ],
    concentration: "Eau de Toilette",
    collection: "atelier",
  },
];

export function getProductBySlug(slug: string): LegacyProduct | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getRelatedProducts(slug: string, limit = 4): LegacyProduct[] {
  const p = getProductBySlug(slug);
  if (!p) return PRODUCTS.slice(0, limit);
  return PRODUCTS.filter((x) => x.slug !== slug && x.gender === p.gender).slice(
    0,
    limit,
  );
}

/** Quiz recommendation: score products by user's preferred note families */
export function scoreProductsForQuiz(preferences: {
  mood: string;
  intensity: string;
  season: string;
  signature: string;
}): LegacyProduct[] {
  const weights: Record<string, MainNoteCategory[]> = {
    bold: ["Woody", "Oriental", "Spicy"],
    soft: ["Floral", "Fresh", "Gourmand"],
    bright: ["Citrus", "Fresh"],
    deep: ["Oriental", "Woody", "Amber"],
    clean: ["Fresh", "Floral"],
    sensual: ["Oriental", "Floral", "Gourmand"],
    spring: ["Floral", "Fresh", "Citrus"],
    summer: ["Citrus", "Fresh"],
    fall: ["Woody", "Spicy", "Oriental"],
    winter: ["Oriental", "Amber", "Woody"],
  };
  const preferred = new Set<MainNoteCategory>();
  [preferences.mood, preferences.intensity, preferences.season, preferences.signature].forEach(
    (key) => {
      const arr = weights[key];
      if (arr) arr.forEach((n) => preferred.add(n));
    },
  );
  const scored = PRODUCTS.map((product) => {
    let score = 0;
    for (const mn of product.mainNotes) {
      if (preferred.has(mn)) score += 2;
    }
    if (product.badge === "bestseller") score += 1;
    return { product, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map((s) => s.product);
}
