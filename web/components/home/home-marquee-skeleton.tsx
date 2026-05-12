"use client";

import { AppSkeletonTheme, LoadingSkeleton } from "@/components/loading/app-skeleton";

export function HomeMarqueeSkeleton() {
  return (
    <AppSkeletonTheme>
      <LoadingSkeleton height={112} borderRadius={12} containerClassName="block w-full" />
    </AppSkeletonTheme>
  );
}
