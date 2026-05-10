import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { code, orderAmount } = await request.json();

  if (!code) {
    return NextResponse.json({ valid: false, error: "No code provided" });
  }

  const supabase = await createClient();

  const { data: discount } = await supabase
    .from("discounts")
    .select("*")
    .eq("code", String(code).toUpperCase())
    .eq("is_active", true)
    .single();

  if (!discount) {
    return NextResponse.json({ valid: false, error: "Code is not valid or has expired." });
  }

  if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: "This code has expired." });
  }

  if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
    return NextResponse.json({ valid: false, error: "This code has reached its usage limit." });
  }

  if (discount.min_order_amount && Number(orderAmount) < discount.min_order_amount) {
    return NextResponse.json({
      valid: false,
      error: `Minimum order of PKR ${Number(discount.min_order_amount).toLocaleString()} required for this code.`,
    });
  }

  let discountAmount = 0;
  if (discount.type === "percentage") {
    discountAmount = Math.round((Number(orderAmount) * discount.value) / 100);
  } else if (discount.type === "fixed") {
    discountAmount = Math.min(discount.value, Number(orderAmount));
  }
  // free_shipping: handled by shipping calculator; discountAmount = 0

  return NextResponse.json({
    valid: true,
    discount,
    discountAmount,
    isFreeShipping: discount.type === "free_shipping",
  });
}
