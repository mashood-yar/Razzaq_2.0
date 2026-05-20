/**
 * Diagnose profiles.gender column + signup trigger health.
 * Usage: node scripts/check-profiles-gender.mjs (from web/, loads .env.local)
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    const val = t.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or service/anon key in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

const probeEmail = `probe-${Date.now()}@example.invalid`;

const { data: colProbe, error: colErr } = await supabase
  .from("profiles")
  .select("id, gender, role")
  .limit(1);

if (colErr) {
  console.error("profiles select failed:", colErr.message, colErr.code);
  if (/gender|column/i.test(colErr.message)) {
    console.error("\n=> Likely missing profiles.gender — run supabase/migrations/20260520130000_profiles_gender_signup_fix.sql in Supabase SQL Editor.");
  }
  process.exit(1);
}

console.log("profiles.gender column OK (sample rows:", colProbe?.length ?? 0, ")");

const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
  email: probeEmail,
  password: "ProbePass123!",
  options: { data: { full_name: "Probe", gender: "male" } },
});

if (signUpErr) {
  console.error("auth.signUp failed:", signUpErr.message, signUpErr.code ?? "");
  process.exit(1);
}

console.log("auth.signUp OK — user id:", signUpData.user?.id ?? "(none)");

if (signUpData.user?.id) {
  await supabase.auth.admin.deleteUser(signUpData.user.id);
  console.log("Cleaned up probe user.");
}
