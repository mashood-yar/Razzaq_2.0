/**
 * Create or update an admin user (auth + profiles.role = 'admin').
 * Usage: node scripts/create-admin-user.mjs <email> <password> [full_name]
 * Loads SUPABASE_SERVICE_ROLE_KEY from .env.local only — never commit credentials.
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

const email = process.argv[2]?.trim().toLowerCase();
const password = process.argv[3];
const fullName = process.argv[4]?.trim() || email?.split("@")[0] || "Admin";

if (!email || !password) {
  console.error("Usage: node scripts/create-admin-user.mjs <email> <password> [full_name]");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let userId;
let action = "created";

const { data: listData, error: listErr } = await supabase.auth.admin.listUsers({
  page: 1,
  perPage: 1000,
});

if (listErr) {
  console.error("Failed to list users:", listErr.message);
  process.exit(1);
}

const existing = listData.users.find(
  (u) => u.email?.toLowerCase() === email,
);

if (existing) {
  userId = existing.id;
  action = "updated";

  const { error: updateErr } = await supabase.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (updateErr) {
    console.error("Failed to update existing user:", updateErr.message);
    process.exit(1);
  }

  console.log(`Auth user already existed — password reset and email confirmed.`);
} else {
  const { data: createData, error: createErr } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

  if (createErr) {
    console.error("Failed to create user:", createErr.message);
    process.exit(1);
  }

  userId = createData.user.id;
  console.log(`Auth user created (id: ${userId}).`);
}

const { data: profile, error: profileErr } = await supabase
  .from("profiles")
  .upsert(
    {
      id: userId,
      email,
      full_name: fullName,
      role: "admin",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  )
  .select("id, email, full_name, role")
  .single();

if (profileErr) {
  console.error("Failed to upsert profile:", profileErr.message);
  process.exit(1);
}

console.log(`Profile ${action} with role=admin:`);
console.log(`  id:        ${profile.id}`);
console.log(`  email:     ${profile.email}`);
console.log(`  full_name: ${profile.full_name}`);
console.log(`  role:      ${profile.role}`);
console.log(`\nLogin at /admin/login with the provided email and password.`);
console.log(`⚠ Change the password after first login if this is production.`);
