import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import { siteConfig } from "@/lib/site";
import { StoreHydration } from "@/components/providers";
import { AuthProvider } from "@/components/providers/auth-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DeferredChrome } from "@/components/layout/deferred-chrome";
import { AccessDeniedBanner } from "@/components/layout/access-denied-banner";
import { FlyToCartProvider } from "@/components/motion/fly-to-cart";
import { AppToaster } from "@/components/providers/app-toaster";
import { IntroAnimation } from "@/components/ui/intro-animation";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
  themeColor: "#0B2E33",
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
          <AppToaster />
          <AccessDeniedBanner />
          <IntroAnimation />
          <StoreHydration />
          <FlyToCartProvider>
            {/* Grain sits below page UI so it never composites over sharp SVG/text (Visa, etc.). */}
            <div
              className="grain-overlay pointer-events-none fixed inset-0 z-0 opacity-[0.22]"
              aria-hidden
            />
            <div className="relative z-10">
              <SiteHeader />
              <main className="min-h-screen pt-16">{children}</main>
              <SiteFooter />
              <DeferredChrome />
            </div>
          </FlyToCartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
