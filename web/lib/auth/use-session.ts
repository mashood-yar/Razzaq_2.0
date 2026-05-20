"use client";

import { useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * NextAuth-shaped session readout backed by Supabase.
 * This repo does not ship `next-auth`; use this hook anywhere you’d normally call `useSession()`.
 */
export type SessionUser = {
  name: string | null;
  email: string | null;
  image: string | null;
};

export type SessionData = { user: SessionUser };

export function useSession(): {
  data: SessionData | null;
  status: "loading" | "authenticated" | "unauthenticated";
  /** Raw Supabase user when authenticated (for initials, identities, etc.). */
  user: User | null;
} {
  const { user, loading } = useAuth();

  return useMemo(() => {
    if (loading) {
      return { data: null, status: "loading", user: null };
    }
    if (!user) {
      return { data: null, status: "unauthenticated", user: null };
    }

    const meta = user.user_metadata as Record<string, unknown> | undefined;
    const name =
      (typeof meta?.full_name === "string" && meta.full_name.trim()) ||
      (typeof meta?.name === "string" && meta.name.trim()) ||
      null;

    return {
      data: {
        user: {
          name,
          email: user.email ?? null,
          image: null,
        },
      },
      status: "authenticated",
      user,
    };
  }, [user, loading]);
}
