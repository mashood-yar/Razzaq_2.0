import { jazzcashSecureHash } from "./secure-hash";
import type { JazzcashConfig } from "./config";

export function pakTxnTimestamp(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

/** JazzCash wallet MSISDN (e.g. 03001234567). */
export function normalizePkMobileWalletMsisdn(input: string): string {
  let d = input.replace(/\D/g, "");
  if (d.startsWith("92")) d = d.slice(2);
  if (!d.startsWith("0")) d = `0${d}`;
  return d.slice(0, 11);
}

/** Amount in smallest PKR unit (paisa), no decimal — JazzCash `pp_Amount`. */
export function jazzcashAmountPaisaString(totalPkr: number): string {
  return String(Math.max(1, Math.round(Number(totalPkr) * 100)));
}

export function buildMwalletRequestPayload(opts: {
  cfg: JazzcashConfig;
  txnRefNo: string;
  amountPkr: number;
  mobileNumber: string;
  cnicLast6: string;
  billReference: string;
  description: string;
  returnUrl: string;
}): Record<string, string> {
  const ts = pakTxnTimestamp();
  const exp = pakTxnTimestamp(new Date(Date.now() + 7 * 864e5));
  const base: Record<string, string> = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: opts.cfg.merchantId,
    pp_SubMerchantID: "",
    pp_Password: opts.cfg.password,
    pp_BankID: "",
    pp_ProductID: "",
    pp_TxnRefNo: opts.txnRefNo,
    pp_Amount: jazzcashAmountPaisaString(opts.amountPkr),
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: ts,
    pp_BillReference: opts.billReference.slice(0, 40),
    pp_Description: opts.description.slice(0, 128),
    pp_TxnExpiryDateTime: exp,
    pp_ReturnURL: opts.returnUrl,
    pp_MobileNumber: opts.mobileNumber,
    pp_CNIC: opts.cnicLast6.slice(-6),
    pp_DiscountedAmount: "",
    ppmpf_1: "",
    ppmpf_2: "",
    ppmpf_3: "",
    ppmpf_4: "",
    ppmpf_5: "",
    pp_SecureHash: "",
  };
  base.pp_SecureHash = jazzcashSecureHash(base, opts.cfg.integritySalt);
  return base;
}
