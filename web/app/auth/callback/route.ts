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
    // Upsert profile after magic-link / email confirmation callbacks.
    const meta = user.user_metadata as Record<string, unknown> | undefined;
    const genderRaw =
      typeof meta?.gender === "string" ? meta.gender.trim() : "";
    const gender =
      genderRaw === "male" || genderRaw === "female" || genderRaw === "other"
        ? genderRaw
        : null;

    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name:
          (meta?.full_name as string | undefined) ??
          (meta?.name as string | undefined) ??
          null,
        gender,
        role: "customer",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id", ignoreDuplicates: false },
    );
  }

  return NextResponse.redirect(new URL(next, origin));
}
