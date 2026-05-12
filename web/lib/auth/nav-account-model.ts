import type { User } from "@supabase/supabase-js";

export type NavAuthVisualMode = "google" | "email";

/** Google sign-in uses photo + Next/Image; everything else uses hashed letter avatar. */
export function getNavAuthVisualMode(user: User): NavAuthVisualMode {
  if (user.identities?.some((i) => i.provider === "google")) return "google";
  return "email";
}

/** Stable seed for letter color / initial fallback (name → email → id). */
export function getNavLetterSeed(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const name =
    (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta?.name === "string" && meta.name.trim()) ||
    "";
  const email = user.email?.trim() ?? "";
  return (name || email || user.id).toLowerCase();
}
