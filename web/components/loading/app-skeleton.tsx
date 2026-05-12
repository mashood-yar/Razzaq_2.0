"use client";

import RLSkeleton, { SkeletonTheme } from "react-loading-skeleton";
import { cn } from "@/lib/utils";

const base = "hsl(187 32% 14%)";
const highlight = "hsl(186 22% 22%)";

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
