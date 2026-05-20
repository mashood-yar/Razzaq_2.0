import type { User } from "@supabase/supabase-js";

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

/** First character for letter avatar — name from metadata, then identity, then email. */
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
