/** Plain trim helper — avoids dynamic `process.env[key]` lookups (those are not inlined for the browser bundle). */

function trimDefined(v: string | undefined): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}

/** Public Supabase credentials for browser + cookie-based server clients */
export function isSupabaseConfigured(): boolean {
  const url = trimDefined(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key =
    trimDefined(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    trimDefined(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  return !!(url && key);
}

export function getSupabaseUrl(): string {
  const url = trimDefined(process.env.NEXT_PUBLIC_SUPABASE_URL);
  if (!url) {
    throw new Error("Missing env NEXT_PUBLIC_SUPABASE_URL");
  }
  return url;
}

/** Prefer publishable key; fall back to classic JWT anon key from the dashboard */
export function getSupabaseAnonPublishableKey(): string {
  const key =
    trimDefined(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    trimDefined(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (!key) {
    throw new Error(
      "Missing env NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
  return key;
}
