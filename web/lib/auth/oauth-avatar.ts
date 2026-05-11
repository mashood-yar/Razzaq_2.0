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

/** First character for avatar fallback — works for email/password and OAuth users without picture. */
export function userAvatarInitial(user: User | null): string {
  if (!user) return "";
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fromMeta =
    (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta?.name === "string" && meta.name.trim()) ||
    "";
  const source =
    fromMeta ||
    (typeof meta?.display_name === "string" && meta.display_name.trim()) ||
    "";
  if (source) {
    const ch = [...source][0];
    return ch?.toUpperCase() ?? "?";
  }
  const email = user.email?.trim();
  if (email) {
    const ch = [...email.replace(/^[^A-Za-z0-9]+/, "")][0];
    return ch?.toUpperCase() ?? "?";
  }
  return "?";
}
