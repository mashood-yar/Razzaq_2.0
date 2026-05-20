"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { friendlyAuthMessage } from "@/lib/auth/auth-errors";
import { sendWelcomeEmail } from "@/lib/resend/client";
import { isSupabaseConfigured } from "@/utils/supabase/public-env";

export type AuthActionState = { error?: string; success?: string } | null;

function supabaseSetupHint(): string {
  if (process.env.VERCEL === "1") {
    return "In Vercel: Project → Settings → Environment Variables, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY). Apply to Production and Preview, then redeploy.";
  }
  if (process.env.NODE_ENV === "production") {
    return "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) in your host’s environment and restart.";
  }
  return "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to web/.env.local or web/.env.development.local, then restart the dev server.";
}

export async function signIn(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return {
      error: `Authentication is not configured. ${supabaseSetupHint()}`,
    };
  }
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/account/orders");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendlyAuthMessage(error, "sign_in") };

  revalidatePath("/", "layout");
  redirect(next.startsWith("/") ? next : "/account/orders");
}

export async function signUp(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return {
      error: `Authentication is not configured. ${supabaseSetupHint()}`,
    };
  }
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const password2 = String(formData.get("password2") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const genderRaw = String(formData.get("gender") ?? "").trim();
  const gender =
    genderRaw === "male" || genderRaw === "female" || genderRaw === "other"
      ? genderRaw
      : null;

  if (!gender) {
    return { error: "Please select Male, Female, or Prefer not to say." };
  }

  if (password !== password2) {
    return { error: "Passwords do not match." };
  }

  const site =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  const origin = site.replace(/\/$/, "");
  const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/account/orders")}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, gender },
      emailRedirectTo,
    },
  });
  if (error) return { error: friendlyAuthMessage(error, "sign_up") };

  if (data.user?.identities?.length === 0) {
    return {
      error:
        "An account with this email already exists. Sign in instead, or reset your password.",
    };
  }

  if (data.session && data.user) {
    const { error: profileErr } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        email,
        full_name: fullName,
        gender,
        role: "customer",
      },
      { onConflict: "id" },
    );
    if (profileErr) {
      console.warn("[auth/signUp] profile upsert:", profileErr.message);
    }
    try {
      await sendWelcomeEmail(email, fullName);
    } catch (e) {
      console.warn("[auth/signUp] welcome email:", e);
    }
    revalidatePath("/", "layout");
    redirect("/account/orders");
  }

  if (data.user) {
    return {
      success:
        "Check your email to confirm your account, then sign in.",
    };
  }

  return {
    error:
      "We couldn't create your account. Please try again or use a different email.",
  };
}

export async function signOut() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function sendMagicLink(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: `Authentication is not configured. ${supabaseSetupHint()}` };
  }
  const email = String(formData.get("email") ?? "").trim();
  const site =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${site.replace(/\/$/, "")}/auth/callback`,
    },
  });
  if (error) return { error: friendlyAuthMessage(error, "otp") };
  return { success: "Check your email for the sign-in link." };
}

export async function sendPasswordReset(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: `Authentication is not configured. ${supabaseSetupHint()}` };
  }
  const email = String(formData.get("email") ?? "").trim();
  const site =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  // Route through /auth/callback so the PKCE code is exchanged first,
  // then the callback redirects to /reset-password with an active session.
  const callbackUrl = `${site.replace(/\/$/, "")}/auth/callback?next=/reset-password`;

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl,
  });
  if (error) return { error: friendlyAuthMessage(error, "password_reset") };
  return {
    success: "If an account exists for that email, a reset link was sent.",
  };
}

export async function updatePassword(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { error: `Authentication is not configured. ${supabaseSetupHint()}` };
  }
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: friendlyAuthMessage(error, "update_password") };
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function updatePasswordWithConfirm(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const password2 = String(formData.get("password2") ?? "");
  if (password !== password2) return { error: "Passwords do not match." };
  return updatePassword(_prev, formData);
}
