"use client";

import { AppSkeletonTheme, LoadingSkeleton } from "@/components/loading/app-skeleton";

export function ProductPageSkeleton() {
  return (
    <AppSkeletonTheme>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="space-y-4">
            <LoadingSkeleton className="aspect-[3/4] w-full rounded-2xl" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <LoadingSkeleton key={i} height={80} width={64} className="rounded-lg shrink-0" />
              ))}
            </div>
          </div>
          <div className="space-y-6 pt-2">
            <LoadingSkeleton height={14} width={120} className="rounded-md" />
            <LoadingSkeleton height={44} className="max-w-md rounded-md" />
            <LoadingSkeleton height={28} width={180} className="rounded-md" />
            <LoadingSkeleton count={4} className="rounded-md" />
            <LoadingSkeleton height={48} className="max-w-xs rounded-md" />
            <LoadingSkeleton height={52} className="max-w-sm rounded-md" />
          </div>
        </div>
      </div>
    </AppSkeletonTheme>
  );
}
