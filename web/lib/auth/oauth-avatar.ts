import type { User } from "@supabase/supabase-js";

/** Profile photo URL from Google / other OAuth providers (Supabase user object). */
export function oauthProfileImageUrl(user: User | null): string | null {
  if (!user) return null;

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fromMeta =
    (typeof meta?.picture === "string" && meta.picture) ||
    (typeof meta?.avatar_url === "string" && meta.avatar_url);
  if (fromMeta) return fromMeta;

  const oauth = user.identities?.find(
    (i) =>
      i.provider === "google" ||
      i.provider === "apple" ||
      i.provider === "azure",
  );
  const data = oauth?.identity_data as Record<string, unknown> | undefined;
  if (!data) return null;
  if (typeof data.picture === "string") return data.picture;
  if (typeof data.avatar_url === "string") return data.avatar_url;

  return null;
}
