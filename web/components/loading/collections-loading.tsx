"use client";

import { AppSkeletonTheme, LoadingSkeleton } from "@/components/loading/app-skeleton";

export function CollectionsGridSkeleton() {
  return (
    <AppSkeletonTheme>
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <LoadingSkeleton height={36} width={280} className="mx-auto rounded-md md:mx-0" />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} className="aspect-[4/5] w-full rounded-xl" />
          ))}
        </div>
      </div>
    </AppSkeletonTheme>
  );
}
