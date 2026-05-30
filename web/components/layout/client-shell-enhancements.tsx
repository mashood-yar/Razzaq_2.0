"use client";

import dynamic from "next/dynamic";

const IntroAnimation = dynamic(
  () =>
    import("@/components/ui/intro-animation").then((m) => ({
      default: m.IntroAnimation,
    })),
  { ssr: false },
);

const CustomCursorProvider = dynamic(
  () =>
    import("@/components/ui/custom-cursor-provider").then((m) => ({
      default: m.CustomCursorProvider,
    })),
  { ssr: false },
);

/** Client-only shell widgets split off the critical path. */
export function ClientShellEnhancements() {
  return (
    <>
      <IntroAnimation />
      <CustomCursorProvider />
    </>
  );
}
