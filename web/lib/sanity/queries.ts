export const HOMEPAGE_QUERY = `*[_type == "homepage"][0] {
  heroEyebrow, heroHeadline, heroSubline,
  heroCtaLabel, heroCtaHref,
  heroImage,
  heroVideo,
  brandStatement,
  seoTitle, seoDescription
}`;

export const LEGAL_PAGE_QUERY = `*[_type == "legalPage" && slug.current == $slug][0] {
  title, lastUpdated,
  sections[]{ heading, content },
  seoTitle
}`;

export const ALL_LEGAL_PAGES_QUERY = `
  *[_type == "legalPage"] { title, "slug": slug.current, lastUpdated } | order(title asc)
`;

export const PRODUCTS_QUERY = `*[_type == "product" && status == "active"] {
  _id, name, "slug": slug.current, price, compareAtPrice, category, tags,
  images[]{ asset->{url}, alt },
  shortDescription
} | order(_createdAt desc)`;

export const PRODUCT_BY_SLUG_QUERY = `*[_type == "product" && slug.current == $slug][0] {
  _id, name, "slug": slug.current, price, compareAtPrice,
  category, tags, shortDescription, description,
  images[]{ asset->{url}, alt },
  supabaseId, seoTitle, seoDescription
}`;

export const COLLECTIONS_QUERY = `*[_type == "collection" && isActive == true] {
  _id, name, "slug": slug.current, description, sortOrder,
  image { asset->{url}, alt }
} | order(sortOrder asc)`;

export const BLOG_POSTS_QUERY = `*[_type == "blogPost"] {
  _id, title, "slug": slug.current, publishedAt, excerpt, tags,
  coverImage { asset->{url}, alt }
} | order(publishedAt desc)`;

export const BLOG_POST_QUERY = `*[_type == "blogPost" && slug.current == $slug][0] {
  title, publishedAt, excerpt, body, tags,
  coverImage { asset->{url}, alt },
  seoTitle, seoDescription
}`;

export const ABOUT_QUERY = `*[_type == "about"][0] {
  heroHeadline,
  heroImage,
  storyHeading, storyContent,
  values[]{ icon, heading, body },
  team[]{ name, role, image },
  seoTitle, seoDescription
}`;
