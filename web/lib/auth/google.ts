"use client";

import { createClient } from "@/lib/supabase/client";

export async function signInWithGoogle(next?: string) {
  const supabase = createClient();
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  // Embed the post-login destination in the callback URL so the route handler
  // can redirect the user to the right page after the OAuth exchange.
  const callbackUrl = new URL(`${origin}/auth/callback`);
  if (next && next.startsWith("/")) {
    callbackUrl.searchParams.set("next", next);
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
  if (error) throw error;
}
