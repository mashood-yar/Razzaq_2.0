import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseScentProfile } from "@/lib/quiz/scent-profile";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const profile = data
    ? {
        ...data,
        scent_profile: parseScentProfile(
          (data as { scent_profile?: unknown }).scent_profile,
        ),
      }
    : data;
  return NextResponse.json({ profile, email: user.email });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json().catch(() => ({}))) as {
    full_name?: string;
    phone?: string;
    email?: string;
    newPassword?: string;
    address_line?: string;
    city?: string;
    province?: string;
    scent_profile?: unknown;
  };

  if (typeof body.newPassword === "string" && body.newPassword.length >= 8) {
    const { error: pwErr } = await supabase.auth.updateUser({
      password: body.newPassword,
    });
    if (pwErr) {
      return NextResponse.json({ error: pwErr.message }, { status: 400 });
    }
  }

  if (typeof body.email === "string" && body.email.includes("@")) {
    const { error: emErr } = await supabase.auth.updateUser({
      email: body.email.trim(),
    });
    if (emErr) {
      return NextResponse.json({ error: emErr.message }, { status: 400 });
    }
  }

  const updates: Record<string, string> = {};
  if (typeof body.full_name === "string") updates.full_name = body.full_name.trim();
  if (typeof body.phone === "string") updates.phone = body.phone.trim();
  if (typeof body.address_line === "string")
    updates.address_line = body.address_line.trim();
  if (typeof body.city === "string") updates.city = body.city.trim();
  if (typeof body.province === "string")
    updates.province = body.province.trim();

  const patch: Record<string, unknown> = { ...updates };
  if (body.scent_profile !== undefined) {
    const parsed = parseScentProfile(body.scent_profile);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid scent profile" }, { status: 400 });
    }
    patch.scent_profile = parsed;
  }

  if (Object.keys(patch).length > 0) {
    const { error } = await supabase
      .from("profiles")
      .update({
        ...patch,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
