import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/session";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Razzaq Luxe order.",
};

export default async function CheckoutPage() {
  await requireUser();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let saved: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
  } | null = null;
  if (user?.id) {
    const { data: p } = await supabase
      .from("profiles")
      .select(
        "email, shipping_full_name, shipping_phone, shipping_address, shipping_city, shipping_province, address_line, city, province, phone",
      )
      .eq("id", user.id)
      .maybeSingle();
    if (p) {
      saved = {
        fullName: p.shipping_full_name ?? undefined,
        email: p.email ?? user.email ?? undefined,
        phone: p.shipping_phone ?? p.phone ?? undefined,
        address: p.shipping_address ?? p.address_line ?? undefined,
        city: p.shipping_city ?? p.city ?? undefined,
        province: p.shipping_province ?? p.province ?? undefined,
      };
    }
  }
  return <CheckoutForm saved={saved} />;
}
