import type { User } from "@supabase/supabase-js";

function trimUrl(u: string | null | undefined): string | null {
  const t = typeof u === "string" ? u.trim() : "";
  return t.length > 0 ? t : null;
}

/** Profile photo URL from Google / other OAuth providers (Supabase user object). */
export function oauthProfileImageUrl(user: User | null): string | null {
  if (!user) return null;

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const fromMeta =
    trimUrl(typeof meta?.picture === "string" ? meta.picture : null) ||
    trimUrl(typeof meta?.avatar_url === "string" ? meta.avatar_url : null);
  if (fromMeta) return fromMeta;

  const oauth = user.identities?.find(
    (i) =>
      i.provider === "google" ||
      i.provider === "apple" ||
      i.provider === "azure",
  );
  const data = oauth?.identity_data as Record<string, unknown> | undefined;
  if (!data) return null;
  return (
    trimUrl(typeof data.picture === "string" ? data.picture : null) ||
    trimUrl(typeof data.avatar_url === "string" ? data.avatar_url : null)
  );
}

function identityDisplayName(user: User): string {
  for (const id of user.identities ?? []) {
    const d = id.identity_data as Record<string, unknown> | undefined;
    if (!d) continue;
    const keys = [
      "full_name",
      "name",
      "given_name",
      "first_name",
      "display_name",
      "email",
    ] as const;
    for (const k of keys) {
      const v = d[k];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return "";
}

/** First character for avatar fallback — works for email/password and OAuth users without picture. */
export function userAvatarInitial(user: User | null): string {
  if (!user) return "";

  const meta = user.user_metadata as Record<string, unknown> | undefined;
  const nameFromMeta =
    (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
    (typeof meta?.name === "string" && meta.name.trim()) ||
    (typeof meta?.display_name === "string" && meta.display_name.trim()) ||
    "";

  const emailLocal =
    typeof user.email === "string" && user.email.includes("@")
      ? user.email.split("@")[0]!.trim()
      : user.email?.trim() ?? "";

  const letterFrom = (s: string) => {
    const cleaned = s.replace(/^[^A-Za-z0-9]+/, "");
    const ch = [...cleaned][0];
    return ch?.toUpperCase() ?? "";
  };

  if (nameFromMeta) {
    const L = letterFrom(nameFromMeta);
    if (L) return L;
  }

  const fromIdentity = identityDisplayName(user);
  if (fromIdentity) {
    const L = letterFrom(fromIdentity);
    if (L) return L;
  }

  if (emailLocal) {
    const L = letterFrom(emailLocal);
    if (L) return L;
  }

  return "?";
}
