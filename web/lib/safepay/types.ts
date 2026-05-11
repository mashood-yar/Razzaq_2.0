/**
 * Request body for POST /order/v1/init — matches official @sfpy/node-sdk (v3.x) Payments.create().
 * @see https://github.com/getsafepay/safepay-node/blob/master/readme.md
 */
export type SafepayOrderInitRequestBody = {
  amount: number;
  client: string;
  currency: "PKR" | "USD";
  environment: "sandbox" | "production" | "development";
};

/** Typical success envelope from Safepay (SDK reads `response.data.data`). */
export type SafepayOrderInitResponse = {
  data?: {
    token?: string;
    amount?: number;
    currency?: string;
    state?: string;
    [key: string]: unknown;
  };
  status?: { errors?: unknown[]; message?: string };
};
