import type { User } from "@supabase/supabase-js";

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
