import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  getSupabaseAnonPublishableKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/utils/supabase/public-env";

/** Anonymous read-only client for server contexts without a browser session (e.g. chat RAG). */
export function getPublicSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  return createClient(getSupabaseUrl(), getSupabaseAnonPublishableKey());
}
