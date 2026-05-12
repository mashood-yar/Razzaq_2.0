"use client";

import { AppSkeletonTheme, LoadingSkeleton } from "@/components/loading/app-skeleton";

export function CartLoadingSkeleton() {
  return (
    <AppSkeletonTheme>
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <LoadingSkeleton height={32} width={220} className="rounded-md" />
        <div className="mt-10 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <LoadingSkeleton height={96} width={80} className="rounded-lg shrink-0" />
              <div className="flex-1 space-y-2 pt-1">
                <LoadingSkeleton height={18} className="rounded-md" />
                <LoadingSkeleton height={14} width="60%" className="rounded-md" />
                <LoadingSkeleton height={20} width={120} className="rounded-md" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 space-y-3 border-t border-white/10 pt-8">
          <LoadingSkeleton height={20} className="rounded-md" />
          <LoadingSkeleton height={48} className="rounded-md" />
        </div>
      </div>
    </AppSkeletonTheme>
  );
}
