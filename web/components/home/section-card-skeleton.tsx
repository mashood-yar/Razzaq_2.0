"use client";

import { AppSkeletonTheme, LoadingSkeleton } from "@/components/loading/app-skeleton";
import { cn } from "@/lib/utils";

/** Compact block skeleton for homepage lazy sections */
export function SectionCardSkeleton({
  height = 280,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <AppSkeletonTheme>
      <LoadingSkeleton
        height={height}
        borderRadius={16}
        containerClassName={cn("block w-full", className)}
      />
    </AppSkeletonTheme>
  );
}
