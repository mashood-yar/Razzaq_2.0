"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/utils/supabase/public-env";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setReady(true);
      setHasSession(false);
      return;
    }
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return (
      <p className="text-sm text-muted-foreground">Checking session…</p>
    );
  }

  if (!hasSession) {
    return (
      <>
        <h1 className="font-serif text-3xl tracking-tight">Set new password</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          Open this page from the password reset email link. If you already
          requested a link, check your inbox.
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="font-serif text-3xl tracking-tight">Set new password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose a strong password for your account.
      </p>
      <div className="mt-10">
        <ResetPasswordForm />
      </div>
    </>
  );
}
