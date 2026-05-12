/** JazzCash Application API (sandbox/live). Credentials from merchant portal. */

export type JazzcashConfig = {
  merchantId: string;
  password: string;
  integritySalt: string;
  apiUrl: string;
};

export function jazzcashConfig(): JazzcashConfig | null {
  const merchantId = process.env.JAZZCASH_MERCHANT_ID?.trim();
  const password = process.env.JAZZCASH_PASSWORD?.trim();
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT?.trim();
  const apiUrl =
    process.env.JAZZCASH_API_URL?.trim() ||
    "https://sandbox.jazzcash.com.pk/ApplicationAPI/API/2.0/Purchase/DoMWalletTransaction";

  if (!merchantId || !password || !integritySalt) return null;
  return { merchantId, password, integritySalt, apiUrl };
}
