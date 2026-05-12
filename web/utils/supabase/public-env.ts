function envTrim(key: string): string | undefined {
  const v = process.env[key];
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}

/** Public Supabase credentials for browser + cookie-based server clients */
export function isSupabaseConfigured(): boolean {
  const url = envTrim("NEXT_PUBLIC_SUPABASE_URL");
  const key =
    envTrim("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
    envTrim("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return !!(url && key);
}

export function getSupabaseUrl(): string {
  const url = envTrim("NEXT_PUBLIC_SUPABASE_URL");
  if (!url) {
    throw new Error("Missing env NEXT_PUBLIC_SUPABASE_URL");
  }
  return url;
}

/** Prefer publishable key; fall back to classic JWT anon key from the dashboard */
export function getSupabaseAnonPublishableKey(): string {
  const key =
    envTrim("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") ||
    envTrim("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!key) {
    throw new Error(
      "Missing env NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return key;
}
