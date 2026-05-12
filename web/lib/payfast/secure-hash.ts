import crypto from "crypto";

const SIGNATURE_KEYS = new Set(["SIGNATURE", "SECURED_HASH", "secured_hash"]);

/**
 * PayFast request verification hash: HMAC-SHA256 (hex, lowercase).
 * Parameters sorted alphabetically by key; canonical string `key=value` joined with `&`.
 * Excludes signature fields from the message before hashing.
 */
export function payfastSortedParamHash(
  params: Record<string, string>,
  securedKey: string,
): string {
  const entries = Object.entries(params).filter(([k]) => !SIGNATURE_KEYS.has(k));
  entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  const canonical = entries.map(([k, v]) => `${k}=${v}`).join("&");
  return crypto
    .createHmac("sha256", Buffer.from(securedKey, "ascii"))
    .update(canonical, "utf8")
    .digest("hex");
}

export function payfastVerifySortedParamHash(
  params: Record<string, string>,
  securedKey: string,
): boolean {
  const received =
    params.SIGNATURE?.trim() ||
    params.SECURED_HASH?.trim() ||
    params.secured_hash?.trim() ||
    "";
  if (!received) return false;
  const expected = payfastSortedParamHash(params, securedKey);
  try {
    const a = Buffer.from(received.toLowerCase(), "utf8");
    const b = Buffer.from(expected.toLowerCase(), "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Flatten URLSearchParams or JSON body to plain strings. */
export function payfastFlattenParams(
  input: Record<string, unknown>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v == null) out[k] = "";
    else if (typeof v === "boolean") out[k] = v ? "true" : "false";
    else out[k] = String(v).trim();
  }
  return out;
}
