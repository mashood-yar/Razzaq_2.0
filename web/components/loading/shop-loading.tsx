"use client";

import { AppSkeletonTheme, LoadingSkeleton } from "@/components/loading/app-skeleton";

export function ShopLoadingSkeleton() {
  return (
    <AppSkeletonTheme>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex gap-12">
          <div className="hidden w-64 flex-col gap-4 lg:flex">
            {Array.from({ length: 7 }).map((_, i) => (
              <LoadingSkeleton key={i} height={36} className="rounded-md" />
            ))}
          </div>
          <div className="min-w-0 flex-1 space-y-10">
            <LoadingSkeleton height={44} className="max-w-xl rounded-md" />
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <LoadingSkeleton className="aspect-[3/4] w-full rounded-xl" />
                  <LoadingSkeleton height={18} count={2} className="rounded-md" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppSkeletonTheme>
  );
}
