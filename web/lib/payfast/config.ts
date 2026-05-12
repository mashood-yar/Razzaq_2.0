/** PayFast Pakistan API base (sandbox: https://sandbox.payfast.pk). */

export type PayfastConfig = {
  merchantId: string;
  securedKey: string;
  apiBaseUrl: string;
  merchantName: string;
};

export function payfastConfig(): PayfastConfig | null {
  const merchantId = process.env.PAYFAST_MERCHANT_ID?.trim();
  const securedKey = process.env.PAYFAST_SECURED_KEY?.trim();
  const apiBaseUrl = (
    process.env.PAYFAST_API_URL?.trim() || "https://sandbox.payfast.pk"
  ).replace(/\/+$/, "");
  const merchantName =
    process.env.PAYFAST_MERCHANT_NAME?.trim() || "Razzaq Luxe";

  if (!merchantId || !securedKey) return null;
  return { merchantId, securedKey, apiBaseUrl, merchantName };
}

export function payfastJoinUrl(base: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/+$/, "")}${p}`;
}
