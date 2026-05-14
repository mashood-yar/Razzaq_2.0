/** Public bank transfer labels for checkout UI (configured per deployment). */

export function publicBankTransferDisplay(): {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  upaisaNumber: string;
} {
  return {
    bankName: process.env.NEXT_PUBLIC_CHECKOUT_BANK_NAME?.trim() || "[BANK_NAME_PLACEHOLDER]",
    accountTitle:
      process.env.NEXT_PUBLIC_CHECKOUT_BANK_ACCOUNT_TITLE?.trim() ||
      "[ACCOUNT_TITLE_PLACEHOLDER]",
    accountNumber:
      process.env.NEXT_PUBLIC_CHECKOUT_BANK_ACCOUNT_NUMBER?.trim() ||
      "[ACCOUNT_NUMBER_PLACEHOLDER]",
    upaisaNumber:
      process.env.NEXT_PUBLIC_CHECKOUT_UPAISA_NUMBER?.trim() ||
      "[UPAISA_NUMBER_PLACEHOLDER]",
  };
}
