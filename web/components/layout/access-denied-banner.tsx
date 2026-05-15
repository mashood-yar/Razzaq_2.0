"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function AccessDeniedBannerInner() {
  const searchParams = useSearchParams();
  if (searchParams.get("error") !== "access_denied") return null;

  return (
    <div className="border-b border-amber-900/60 bg-amber-950/50 px-4 py-3 text-center text-sm text-amber-100">
      Access to that admin area isn&apos;t available for your account.&nbsp;
      <Link href="/shop" className="font-medium underline-offset-4 hover:underline">
        Continue shopping
      </Link>
    </div>
  );
}

/** Surfaces redirects from middleware when a signed-in non-admin visits `/admin/*`. */
export function AccessDeniedBanner() {
  return (
    <Suspense fallback={null}>
      <AccessDeniedBannerInner />
    </Suspense>
  );
}
