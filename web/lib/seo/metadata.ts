import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const DEFAULT_SITE_URL = "https://www.razzaqluxe.com";
export const DEFAULT_OG_IMAGE = "/images/default-og.jpg";

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path: string = "/"): string {
  const base = siteUrl();
  if (!path || path === "/") return base;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function resolveOgImage(image?: string | null): string {
  if (!image) return DEFAULT_OG_IMAGE;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return image.startsWith("/") ? image : `/${image}`;
}

type BuildPageMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
  openGraphType?: "website" | "article";
};

export function buildPageMetadata({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
  openGraphType = "website",
}: BuildPageMetadataOptions): Metadata {
  const desc = description ?? siteConfig.description;
  const canonical = absoluteUrl(path);
  const ogImage = resolveOgImage(image);

  return {
    title,
    description: desc,
    alternates: {
      canonical,
    },
    openGraph: {
      type: openGraphType,
      locale: "en_PK",
      url: canonical,
      siteName: siteConfig.name,
      title,
      description: desc,
      images: [{ url: ogImage, alt: title }],
    },
    // Next.js Metadata API still uses the `twitter` key for X (formerly Twitter) card tags.
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [ogImage],
      creator: siteConfig.twitterHandle,
    },
    ...(noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

export const rootMetadataDefaults: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: siteConfig.defaultTitle,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name }],
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: siteUrl(),
    siteName: siteConfig.name,
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [{ url: DEFAULT_OG_IMAGE, alt: siteConfig.defaultTitle }],
  },
  // Next.js Metadata API still uses the `twitter` key for X (formerly Twitter) card tags.
  twitter: {
    card: "summary_large_image",
    title: siteConfig.defaultTitle,
    description: siteConfig.description,
    images: [DEFAULT_OG_IMAGE],
    creator: siteConfig.twitterHandle,
  },
  robots: { index: true, follow: true },
};
