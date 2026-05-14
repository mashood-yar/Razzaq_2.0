"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonPublishableKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./public-env";

/** Safe for builds / prerender when public env is incomplete. */
export function tryCreateBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  try {
    return createBrowserClient(getSupabaseUrl(), getSupabaseAnonPublishableKey());
  } catch {
    return null;
  }
}

export function createClient() {
  const client = tryCreateBrowserClient();
  if (!client) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or publishable key).",
    );
  }
  return client;
}
