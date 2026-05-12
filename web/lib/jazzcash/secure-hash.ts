import crypto from "crypto";

/**
 * JazzCash pp_SecureHash — HMAC-SHA256 (hex, uppercase).
 * Concatenate integrity salt, "&", then all `pp_*` values except `pp_SecureHash`,
 * sorted by parameter name ascending, joined with "&".
 * @see Payment Gateway Integration Guide §14.2 (SHA256-HMAC).
 */
export function jazzcashFlatten(
  obj: Record<string, unknown>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === "boolean") out[k] = v ? "true" : "false";
    else if (v == null) out[k] = "";
    else out[k] = String(v).trim();
  }
  return out;
}

export function jazzcashSecureHash(
  params: Record<string, string>,
  integritySalt: string,
): string {
  const entries = Object.entries(params).filter(
    ([k]) => k.startsWith("pp_") && k !== "pp_SecureHash",
  );
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const valuesJoined = entries.map(([, v]) => (v ?? "").trim()).join("&");
  const payload = `${integritySalt}&${valuesJoined}`;
  return crypto
    .createHmac("sha256", Buffer.from(integritySalt, "utf8"))
    .update(payload, "utf8")
    .digest("hex")
    .toUpperCase();
}

export function verifyJazzcashSecureHash(
  params: Record<string, string>,
  integritySalt: string,
): boolean {
  const received = (params.pp_SecureHash ?? "").trim().toUpperCase();
  if (!received) return false;
  const expected = jazzcashSecureHash(params, integritySalt);
  try {
    const a = Buffer.from(received, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
