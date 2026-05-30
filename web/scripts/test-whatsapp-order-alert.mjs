/**
 * Send a test merchant new-order WhatsApp alert (dev only).
 *
 * Usage (from web/):
 *   node scripts/test-whatsapp-order-alert.mjs
 *
 * Requires in .env.local:
 *   WHATSAPP_ENABLED=true
 *   WHATSAPP_API_TOKEN
 *   WHATSAPP_PHONE_NUMBER_ID
 *   MERCHANT_WHATSAPP (defaults to +923332361713 in app code)
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const META_GRAPH_API_VERSION = "v21.0";

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

function normalizePkWhatsAppTo(raw) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10) return null;
  if (digits.startsWith("92") && digits.length >= 12) return digits;
  if (digits.startsWith("0") && digits.length >= 10) return `92${digits.slice(1)}`;
  if (digits.length === 10) return `92${digits}`;
  if (digits.startsWith("92")) return digits;
  return `92${digits}`;
}

function describeMetaError(status, detail) {
  try {
    const err = JSON.parse(detail)?.error;
    if (!err) return detail.slice(0, 200);
    if (err.error_subcode === 131030) {
      return `${err.message} — add MERCHANT_WHATSAPP as a test recipient in Meta → WhatsApp → API Setup.`;
    }
    return err.message ?? detail.slice(0, 200);
  } catch {
    return detail.slice(0, 200);
  }
}

loadEnvLocal();

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to run in production. Use only for local dev testing.");
  process.exit(1);
}

const enabled = process.env.WHATSAPP_ENABLED === "true";
const token = process.env.WHATSAPP_API_TOKEN?.trim();
const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
const merchantRaw =
  process.env.MERCHANT_WHATSAPP?.trim() || "+923332361713";
const toDigits = normalizePkWhatsAppTo(merchantRaw);

console.log("WhatsApp test alert — config check");
console.log("  WHATSAPP_ENABLED:", enabled ? "true" : "false (set true to send)");
console.log("  WHATSAPP_API_TOKEN:", token ? "set" : "MISSING");
console.log("  WHATSAPP_PHONE_NUMBER_ID:", phoneId ? "set" : "MISSING");
console.log("  MERCHANT_WHATSAPP:", merchantRaw, "→", toDigits ? `+${toDigits}` : "INVALID");

if (!enabled) {
  console.error("\nSet WHATSAPP_ENABLED=true in .env.local and retry.");
  process.exit(1);
}
if (!token || !phoneId) {
  console.error("\nMissing WHATSAPP_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID.");
  process.exit(1);
}
if (!toDigits) {
  console.error("\nInvalid MERCHANT_WHATSAPP number.");
  process.exit(1);
}

const body = [
  "New Razzaq Luxe order #TEST-0001",
  "",
  "Customer: Test Customer",
  "Email: test@example.com",
  "Phone: 03001234567",
  "",
  "Items:",
  "• Signature Oud × 1 — PKR 4,500",
  "",
  "Total: PKR 4,500",
  "Payment: Cash on Delivery (COD)",
  "",
  "Ship to:",
  "Test Customer",
  "123 Test Street",
  "Islamabad, ICT",
  "PK",
  "03001234567",
  "",
  "(This is a dev test from scripts/test-whatsapp-order-alert.mjs)",
].join("\n");

const res = await fetch(
  `https://graph.facebook.com/${META_GRAPH_API_VERSION}/${phoneId}/messages`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toDigits,
      type: "text",
      text: { body },
    }),
  },
);

if (!res.ok) {
  const detail = await res.text();
  console.error("\nSend failed:", res.status, describeMetaError(res.status, detail));
  process.exit(1);
}

const data = await res.json();
console.log("\nSent OK to", `+${toDigits}`);
console.log("Message id:", data.messages?.[0]?.id ?? "(see response)");
console.log(JSON.stringify(data, null, 2));
