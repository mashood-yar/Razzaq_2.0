/**
 * Single source of truth for shop products — used by fragrances carousel & product.html
 * @typedef {{ slug: string, name: string, price: string, img: string, description: string }} CatalogProduct
 */
window.RAZZAQ_CATALOG = [
  {
    slug: 'noir-essence',
    name: 'Noir Essence',
    price: 'Rs.2,300',
    img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=500&auto=format&fit=crop',
    description: 'Deep woody notes with a modern amber base — confident day-to-night wear.',
  },
  {
    slug: 'royal-oud',
    name: 'Royal Oud',
    price: 'Rs.4,200',
    img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=500&auto=format&fit=crop',
    description: 'Rich oud balanced with soft spice — crafted for statement evenings.',
  },
  {
    slug: 'elite-gold',
    name: 'Elite Gold',
    price: 'Rs.4,900',
    img: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?q=80&w=500&auto=format&fit=crop',
    description: 'Bright citrus opening into warm resinous depth — luxury without heaviness.',
  },
  {
    slug: 'velvet-mist',
    name: 'Velvet Mist',
    price: 'Rs.3,600',
    img: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=500&auto=format&fit=crop',
    description: 'Soft florals wrapped in musk — effortless elegance.',
  },
  {
    slug: 'shadow-ice',
    name: 'Shadow Ice',
    price: 'Rs.2,950',
    img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=500&auto=format&fit=crop',
    description: 'Crisp aquatic freshness with a cool herbal lift.',
  },
  {
    slug: 'midnight-rose',
    name: 'Midnight Rose',
    price: 'Rs.3,200',
    img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=500&auto=format&fit=crop',
    description: 'Rose and dark plum with a satin dry-down — romantic and bold.',
  },
  {
    slug: 'amber-dream',
    name: 'Amber Dream',
    price: 'Rs.4,100',
    img: 'https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=500&auto=format&fit=crop',
    description: 'Honeyed amber with soft vanilla — comforting signature scent.',
  },
  {
    slug: 'ocean-breeze',
    name: 'Ocean Breeze',
    price: 'Rs.3,450',
    img: 'https://images.unsplash.com/photo-1595991209266-5e0428bfb0c4?w=800&q=82&fm=webp&fit=crop&crop=center',
    description: 'Clean marine notes with a hint of citrus — everyday freshness.',
  },
  {
    slug: 'jasmine-joy',
    name: 'Jasmine Joy',
    price: 'Rs.2,800',
    img: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?q=80&w=500&auto=format&fit=crop',
    description: 'White florals with green undertones — light and uplifting.',
  },
  {
    slug: 'vanilla-musk',
    name: 'Vanilla Musk',
    price: 'Rs.2,650',
    img: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=500&auto=format&fit=crop',
    description: 'Creamy vanilla layered over soft musk — cozy all-season warmth.',
  },
  {
    slug: 'maaz-only-yours',
    name: 'Maaz Safder Only Yours for Men 35ml',
    price: 'Rs.2,300',
    img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80',
    description:
      'Crisp, confident everyday signature with lasting projection — part of the featured Maaz Safder line.',
  },
];

window.RAZZAQ_getProductBySlug = function (slug) {
  const s = String(slug || '')
    .toLowerCase()
    .trim();
  return window.RAZZAQ_CATALOG.find((p) => p.slug === s) || null;
};
