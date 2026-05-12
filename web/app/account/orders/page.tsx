import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orders",
};

export default async function AccountOrdersPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, status, total_pkr, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-16">
        <p className="text-sm text-red-400">
          Could not load orders. If you see{' '}
          <span className="font-mono">permission denied</span>, run{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">web/supabase/fix-orders-select-rls.sql</code>{' '}
          in Supabase SQL Editor (adds grants + fixes orders policies), or reinstall from{' '}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">web/supabase/schema.sql</code>.
        </p>
        <p className="text-xs text-muted-foreground">
          Detail: <span className="font-mono">{error.message}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-serif text-4xl">Your orders</h1>
      <p className="mt-2 text-muted-foreground">
        Signed in as {user.email}
      </p>
      <ul className="mt-10 space-y-4">
        {(orders ?? []).length === 0 ? (
          <li className="rounded-lg border border-white/10 p-6 text-muted-foreground">
            No orders yet.{" "}
            <Link href="/shop" className="text-gold hover:underline">
              Browse the shop
            </Link>
          </li>
        ) : (
          (orders ?? []).map((o) => (
            <li
              key={o.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-white/10 p-4"
            >
              <div>
                <p className="font-medium">{o.order_number}</p>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {o.status} ·{" "}
                  {new Date(o.created_at).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-gold">
                  PKR {Number(o.total_pkr).toLocaleString()}
                </span>
                <Link
                  href={`/order/${o.id}`}
                  className="text-xs uppercase tracking-widest text-gold hover:underline"
                >
                  Track
                </Link>
              </div>
            </li>
          ))
        )}
      </ul>
      <p className="mt-10">
        <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground">
          ← Account overview
        </Link>
      </p>
    </div>
  );
}
