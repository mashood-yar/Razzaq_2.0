"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { DeferredChrome } from "@/components/layout/deferred-chrome";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <div className="relative z-10">
      <SiteHeader />
      <main className="min-h-screen pt-28 sm:pt-32">{children}</main>
      <SiteFooter />
      <DeferredChrome />
    </div>
  );
}
