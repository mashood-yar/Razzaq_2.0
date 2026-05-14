/** Public bank transfer labels for checkout UI (configured per deployment). */

export function publicBankTransferDisplay(): {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  upaisaNumber: string;
} {
  return {
    bankName: process.env.NEXT_PUBLIC_CHECKOUT_BANK_NAME?.trim() || "Bank Islami",
    accountTitle:
      process.env.NEXT_PUBLIC_CHECKOUT_BANK_ACCOUNT_TITLE?.trim() ||
      "BASHIR AHMED",
    accountNumber:
      process.env.NEXT_PUBLIC_CHECKOUT_BANK_ACCOUNT_NUMBER?.trim() ||
      "103100660870001",
    upaisaNumber:
      process.env.NEXT_PUBLIC_CHECKOUT_UPAISA_NUMBER?.trim() ||
      "03332361713",
  };
}
