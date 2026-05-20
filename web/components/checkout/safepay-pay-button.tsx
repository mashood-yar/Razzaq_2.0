"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  totalLabel: string;
  loading: boolean;
  disabled?: boolean;
  onPay: () => void;
  className?: string;
};

/**
 * Primary action for Safepay: parent should POST /api/orders (paymentMethod=safepay),
 * then POST /api/payment/create-session and redirect to `redirectUrl`.
 */
export function SafepayPayButton({
  totalLabel,
  loading,
  disabled,
  onPay,
  className,
}: Props) {
  return (
    <Button
      type="button"
      size="lg"
      className={cn(
        "w-full bg-[#0F4C75] text-white hover:bg-[#0a3d5c]",
        className,
      )}
      disabled={disabled || loading}
      onClick={onPay}
    >
      {loading ? "Connecting to Safepay…" : `Pay securely with Safepay · ${totalLabel}`}
    </Button>
  );
}
