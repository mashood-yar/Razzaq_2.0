import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { StoreHydration } from "@/components/providers";
import { AuthProvider } from "@/components/providers/auth-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchModal } from "@/components/search/search-modal";
import { AIBot } from "@/components/layout/ai-bot";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.name,
    template: siteConfig.titleTemplate,
  },
  description: siteConfig.description,
  keywords: [
    "razzaq luxe",
    "luxury fashion pakistan",
    "fragrances pakistan",
    "lawn wear",
    "formal wear pakistan",
    "luxury lifestyle",
  ],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: siteUrl,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: siteConfig.twitterHandle,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0D0C0A",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${cormorant.variable} ${jost.variable} min-h-screen bg-background font-body antialiased`}
      >
        <AuthProvider>
          <StoreHydration />
          <div
            className="grain-overlay pointer-events-none fixed inset-0 z-[1] opacity-[0.25] mix-blend-overlay"
            aria-hidden
          />
          <SiteHeader />
          <main className="min-h-screen pt-16">{children}</main>
          <SiteFooter />
          <CartDrawer />
          <SearchModal />
          <AIBot />
        </AuthProvider>
      </body>
    </html>
  );
}
