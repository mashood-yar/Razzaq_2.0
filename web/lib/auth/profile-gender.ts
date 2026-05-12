import type { User } from "@supabase/supabase-js";

export type ProfileGender = "male" | "female" | "other";

export function normalizeProfileGender(
  raw: string | null | undefined,
): ProfileGender | null {
  if (raw == null || typeof raw !== "string") return null;
  const v = raw.trim().toLowerCase();
  if (v === "male" || v === "female" || v === "other") return v;
  return null;
}

/** Gender stored on `auth.users.raw_user_meta_data` at signup. */
export function genderFromUserMetadata(user: User | null): ProfileGender | null {
  if (!user) return null;
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  return normalizeProfileGender(
    typeof meta?.gender === "string" ? meta.gender : undefined,
  );
}
