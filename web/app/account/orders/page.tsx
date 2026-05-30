import {
  PAYMENT_METHOD_LABELS,
  STATUS_LABELS,
} from "@/lib/utils";
import type { OrderStatus, PaymentMethod } from "@/lib/types";
import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { Package } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders",
};

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case "pending_confirmation":
      return "bg-[#B8860B] text-[var(--cream-bone)] border-[#B8860B]"; // gold-deep
    case "confirmed":
      return "bg-[#FFD700] text-[var(--bg-void)] border-[#FFD700]"; // gold-bright
    case "shipped":
      return "bg-[#8B8989] text-[var(--cream-bone)] border-[#8B8989]"; // bg-stone
    case "delivered":
      return "bg-[#9DC183] text-[var(--bg-void)] border-[#9DC183]"; // sage
    default:
      return "bg-[var(--bg-dusk)] text-[var(--cream-muted)] border-[var(--border-mid)]";
  }
}

export default async function AccountOrdersPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, total_pkr, created_at, payment_method",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="space-y-3 py-8">
        <p className="text-[13px] font-body text-[var(--ember)]">
          Could not load orders. <span className="font-mono">{error.message}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl">
      <h1 className="font-display italic text-[2.5rem] text-[var(--cream-bone)] mb-8 hidden lg:block">
        Order History
      </h1>
      
      <ul className="space-y-4">
        {(orders ?? []).length === 0 ? (
          <li className="rounded-[4px] border border-[var(--border-fine)] bg-[var(--bg-dusk)] p-12 text-center flex flex-col items-center">
            <Package className="w-8 h-8 text-[var(--border-mid)] mb-4" />
            <p className="font-body font-light text-[14px] text-[var(--cream-muted)] mb-6">
              You haven&apos;t placed any orders yet.
            </p>
            <Link 
              href="/shop" 
              className="h-[48px] px-8 bg-transparent border border-[var(--cream-bone)] text-[var(--cream-bone)] font-body font-semibold text-[10px] tracking-[0.2em] uppercase rounded-[2px] flex items-center justify-center transition-colors hover:bg-[var(--cream-bone)] hover:text-[var(--bg-void)]"
            >
              BROWSE COLLECTION
            </Link>
          </li>
        ) : (
          (orders ?? []).map((o) => (
            <li
              key={o.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-[4px] border border-[var(--border-fine)] bg-[var(--bg-dusk)] p-5 lg:p-6 transition-colors hover:border-[var(--border-mid)]"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <p className="font-display font-semibold text-[1.125rem] text-[var(--cream-bone)]">
                    #{o.order_number}
                  </p>
                  <span className={`px-2 py-0.5 rounded-[2px] font-body font-semibold text-[9px] tracking-[0.1em] uppercase border ${getStatusColor(o.status as OrderStatus)}`}>
                    {STATUS_LABELS[o.status as OrderStatus] ?? o.status}
                  </span>
                </div>
                
                <p className="font-body font-light text-[12px] text-[var(--cream-muted)] flex flex-wrap gap-2 items-center">
                  <span>{new Date(o.created_at).toLocaleDateString("en-PK", { year: "numeric", month: "short", day: "numeric" })}</span>
                  <span className="opacity-40">·</span>
                  <span>{PAYMENT_METHOD_LABELS[o.payment_method as PaymentMethod]}</span>
                  <span className="opacity-40">·</span>
                  <span className="text-[var(--cream-bone)] font-medium">PKR {Number(o.total_pkr).toLocaleString()}</span>
                </p>
              </div>
              
              <Link
                href={`/order/${o.id}`}
                className="h-[40px] px-6 bg-[var(--bg-obsidian)] border border-[var(--border-mid)] text-[var(--cream-bone)] font-body font-semibold text-[10px] tracking-[0.2em] rounded-[2px] flex items-center justify-center transition-colors hover:border-[var(--gold-warm)] hover:text-[var(--gold-warm)] sm:w-auto"
              >
                VIEW DETAILS
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
