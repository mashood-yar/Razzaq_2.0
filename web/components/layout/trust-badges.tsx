import { Lock, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

export function TrustBadges({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-center lg:justify-start gap-4", className)}
      role="list"
      aria-label="Payment and delivery partners"
    >
      <span className="flex items-center gap-2 rounded-[2px] border border-[var(--border-fine)] bg-[var(--bg-dusk)] px-4 py-2 font-body font-normal text-[11px] text-[var(--cream-ghost)]" role="listitem">
        <Truck className="h-3.5 w-3.5 text-[var(--gold-warm)]" aria-hidden />
        TCS
      </span>
      <span className="flex items-center gap-2 rounded-[2px] border border-[var(--border-fine)] bg-[var(--bg-dusk)] px-4 py-2 font-body font-normal text-[11px] text-[var(--cream-ghost)]" role="listitem">
        <Truck className="h-3.5 w-3.5 text-[var(--gold-warm)]" aria-hidden />
        Leopards
      </span>
      <span className="flex items-center gap-2 rounded-[2px] border border-[var(--border-fine)] bg-[var(--bg-dusk)] px-4 py-2 font-body font-normal text-[11px] text-[var(--cream-ghost)]" role="listitem">
        PayFast
      </span>
      <span className="flex items-center gap-2 rounded-[2px] border border-[var(--border-fine)] bg-[var(--bg-dusk)] px-4 py-2 font-body font-normal text-[11px] text-[var(--cream-ghost)]" role="listitem">
        <Lock className="h-3.5 w-3.5 text-[var(--gold-warm)]" aria-hidden />
        Secure checkout
      </span>
    </div>
  );
}
