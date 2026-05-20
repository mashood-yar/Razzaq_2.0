"use client";

import RLSkeleton, { SkeletonTheme } from "react-loading-skeleton";
import { cn } from "@/lib/utils";

const base = "#16213E";
const highlight = "#3282B8";

export function AppSkeletonTheme({ children }: { children: React.ReactNode }) {
  return (
    <SkeletonTheme baseColor={base} highlightColor={highlight} duration={1.65} borderRadius={6}>
      {children}
    </SkeletonTheme>
  );
}

/** react-loading-skeleton with Razzaq dark theme — wrap sections in {@link AppSkeletonTheme}. */
export function LoadingSkeleton({
  className,
  ...props
}: React.ComponentProps<typeof RLSkeleton>) {
  return <RLSkeleton className={cn(className)} {...props} />;
}
