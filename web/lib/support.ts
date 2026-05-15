let warnedSupportEmail: boolean = false;

/** Customer-facing support email — set in Vercel + `.env.local` as `NEXT_PUBLIC_SUPPORT_EMAIL`. */
export function getSupportEmail(): string {
  const v = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim();
  if (!v) {
    const duringNpmBuild = process.env.npm_lifecycle_event === "build";
    if (
      typeof window === "undefined" &&
      process.env.NODE_ENV === "production" &&
      !warnedSupportEmail &&
      !duringNpmBuild
    ) {
      warnedSupportEmail = true;
      console.warn(
        "[App] NEXT_PUBLIC_SUPPORT_EMAIL is not set — support links in emails and UI use the built-in fallback address until you configure it.",
      );
    }
    return "sultanbarak77@gmail.com";
  }
  return v;
}
