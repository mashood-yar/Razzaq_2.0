import { payfastJoinUrl } from "./config";

export type PayfastTokenResponse = {
  token: string | null;
  raw: Record<string, unknown>;
};

/**
 * OAuth-style client credentials — POST form to `{apiBase}/token`.
 */
export async function payfastGetAccessToken(opts: {
  apiBaseUrl: string;
  merchantId: string;
  securedKey: string;
  signal?: AbortSignal;
}): Promise<PayfastTokenResponse> {
  const url = payfastJoinUrl(opts.apiBaseUrl, "/token");
  const body = new URLSearchParams({
    merchant_id: opts.merchantId,
    grant_type: "client_credentials",
    secured_key: opts.securedKey,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    signal: opts.signal,
  });

  const text = await res.text();
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(`PayFast token: invalid JSON (${res.status})`);
  }

  const token =
    (typeof raw.token === "string" && raw.token) ||
    (raw.data &&
    typeof raw.data === "object" &&
    raw.data !== null &&
    "token" in raw.data &&
    typeof (raw.data as { token?: string }).token === "string" ?
      (raw.data as { token: string }).token
    : null);

  const code = raw.code;
  const okCode = code === "00" || code === "" || code === null || code === undefined;

  if (!res.ok || !token || !okCode) {
    const msg =
      typeof raw.message === "string" ?
        raw.message
      : `HTTP ${res.status}`;
    throw new Error(`PayFast token failed: ${msg}`);
  }

  return { token, raw };
}
