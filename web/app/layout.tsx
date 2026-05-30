import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import { rootMetadataDefaults } from "@/lib/seo/metadata";
import { StoreHydration } from "@/components/providers";
import { AuthProvider } from "@/components/providers/auth-provider";
import { AppChrome } from "@/components/layout/app-chrome";
import { AccessDeniedBanner } from "@/components/layout/access-denied-banner";
import { FlyToCartProvider } from "@/components/motion/fly-to-cart";
import { AppToaster } from "@/components/providers/app-toaster";
import { IntroAnimation } from "@/components/ui/intro-animation";
import { CustomCursorProvider } from "@/components/ui/custom-cursor-provider";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = rootMetadataDefaults;

export const viewport: Viewport = {
  themeColor: "#0A0A08",
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
        className={`${cormorant.variable} ${dmSans.variable} min-h-screen bg-background font-body font-light antialiased`}
      >
        <AuthProvider>
          <AppToaster />
          <AccessDeniedBanner />
          <IntroAnimation />
          <CustomCursorProvider />
          <StoreHydration />
          <FlyToCartProvider>
            <AppChrome>{children}</AppChrome>
          </FlyToCartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
