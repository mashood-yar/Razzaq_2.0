"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/utils/supabase/public-env";
import {
  normalizeProfileGender,
  type ProfileGender,
} from "@/lib/auth/profile-gender";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  /** Loaded from `profiles.gender`; complements `user.user_metadata.gender`. */
  profileGender: ProfileGender | null;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  profileGender: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileGender, setProfileGender] = useState<ProfileGender | null>(null);

  const supabase = useMemo(() => {
    if (!isSupabaseConfigured()) return null;
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!cancelled) {
          setUser(session?.user ?? null);
        }

        const {
          data: { user: validated },
          error,
        } = await supabase.auth.getUser();
        if (!cancelled && !error && validated) {
          setUser(validated);
        }
      } catch {
        /* Session may still be valid; onAuthStateChange will reconcile. */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase || !user) {
      setProfileGender(null);
      return;
    }

    let cancelled = false;

    void supabase
      .from("profiles")
      .select("gender")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || error) return;
        setProfileGender(normalizeProfileGender(data?.gender as string | undefined));
      });

    return () => {
      cancelled = true;
    };
  }, [supabase, user?.id]);

  const value = useMemo(
    () => ({ user, loading, profileGender }),
    [user, loading, profileGender],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
