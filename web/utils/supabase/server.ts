import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import {
  getSupabaseAnonPublishableKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./public-env";

export async function tryCreateServerClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const cookieStore = await cookies();

    return createServerClient(getSupabaseUrl(), getSupabaseAnonPublishableKey(), {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* Server Component can't set cookies; middleware keeps session refreshed */
          }
        },
      },
    });
  } catch {
    return null;
  }
}

/**
 * Supabase server client — use inside Server Components, Server Actions, Route Handlers.
 * Pass refreshed sessions via middleware (see `/middleware.ts`).
 */
export async function createClient() {
  const client = await tryCreateServerClient();
  if (!client) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return client;
}
