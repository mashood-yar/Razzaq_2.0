"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  getSupabaseAnonPublishableKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./public-env";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or publishable key).",
    );
  }
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonPublishableKey());
}
