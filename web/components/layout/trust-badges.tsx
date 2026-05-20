import { Lock, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrustBadges({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-center gap-2", className)}
      role="list"
      aria-label="Payment and delivery partners"
    >
      <span className="trust-badge" role="listitem">
        <Truck className="h-3.5 w-3.5 text-ocean-mid" aria-hidden />
        TCS
      </span>
      <span className="trust-badge" role="listitem">
        <Truck className="h-3.5 w-3.5 text-ocean-light" aria-hidden />
        Leopards
      </span>
      <span className="trust-badge-payfast" role="listitem">
        PayFast
      </span>
      <span className="trust-badge-lock" role="listitem">
        <Lock className="h-3.5 w-3.5 text-success" aria-hidden />
        Secure checkout
      </span>
    </div>
  );
}
