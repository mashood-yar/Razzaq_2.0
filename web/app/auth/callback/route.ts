import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next") ?? "/account/orders";
  const next = nextRaw.startsWith("/") ? nextRaw : "/account/orders";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] session exchange error:", error.message);
    return NextResponse.redirect(new URL("/login?error=auth_failed", req.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Upsert profile — idempotent for both OAuth sign-ups and existing users.
    // The DB trigger handles brand-new users; this upsert fills in any gaps
    // and keeps avatar/full_name in sync with the provider's latest data.
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name:
          (user.user_metadata?.full_name as string | undefined) ??
          (user.user_metadata?.name as string | undefined) ??
          null,
        avatar_url:
          (user.user_metadata?.avatar_url as string | undefined) ??
          (user.user_metadata?.picture as string | undefined) ??
          null,
        role: "customer",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id", ignoreDuplicates: false },
    );
  }

  return NextResponse.redirect(new URL(next, origin));
}
