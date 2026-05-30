import type { Metadata, Viewport } from "next";
import { Fraunces, Nunito } from "next/font/google";
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

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-fraunces",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = rootMetadataDefaults;

export const viewport: Viewport = {
  themeColor: "#1B262C",
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
        className={`${fraunces.variable} ${nunito.variable} min-h-screen bg-background font-body antialiased`}
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
