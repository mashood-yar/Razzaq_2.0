import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
  return NextResponse.json({ profile: data, email: user.email });
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

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
