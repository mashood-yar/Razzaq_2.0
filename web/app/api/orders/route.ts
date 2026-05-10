import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLemonSqueezyCheckout } from "@/lib/lemonsqueezy/checkout";
import { sendOrderConfirmationEmail } from "@/lib/resend/client";
import type { CartItem, Order } from "@/lib/types";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const {
    cartItems,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    promoCode,
    discountAmount = 0,
    guestEmail,
  }: {
    cartItems: CartItem[];
    shippingAddress: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      province: string;
      postalCode?: string;
      country: string;
    };
    shippingMethod: string;
    paymentMethod: "card" | "cod";
    promoCode?: string;
    discountAmount?: number;
    guestEmail?: string;
  } = body;

  if (!cartItems?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  // Get logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Server-side subtotal (never trust client totals)
  const subtotal = cartItems.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.quantity,
    0,
  );

  // Shipping cost
  const isFreeShipping =
    promoCode === "FREESHIP" || subtotal >= 5000 || shippingMethod === "standard_free";
  const shippingCost = isFreeShipping
    ? 0
    : shippingMethod?.includes("express")
      ? 500
      : 250;

  const total = Math.max(0, subtotal - discountAmount) + shippingCost;

  const customerEmail = shippingAddress.email || guestEmail || user?.email || "";
  const customerName = `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim();

  // Create order record
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      guest_email: user ? null : customerEmail,
      customer_email: customerEmail,
      customer_name: customerName,
      customer_phone: shippingAddress.phone,
      payment_method: paymentMethod,
      payment_status: "pending",
      subtotal_pkr: subtotal,
      discount_pkr: discountAmount,
      shipping_pkr: shippingCost,
      total_pkr: total,
      discount_code: promoCode ?? null,
      shipping_method: shippingMethod,
      ship_first_name: shippingAddress.firstName,
      ship_last_name: shippingAddress.lastName,
      ship_address1: shippingAddress.addressLine1,
      ship_address2: shippingAddress.addressLine2 ?? null,
      ship_city: shippingAddress.city,
      ship_province: shippingAddress.province,
      ship_postal_code: shippingAddress.postalCode ?? null,
      ship_country: shippingAddress.country || "PK",
      ship_phone: shippingAddress.phone,
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("[Orders] create order error:", orderError);
    return NextResponse.json(
      { error: orderError?.message ?? "Failed to create order" },
      { status: 500 },
    );
  }

  // Insert order items (denormalized snapshot)
  const orderItems = cartItems.map((item: CartItem) => ({
    order_id: order.id,
    product_id: item.productId || null,
    variant_id: item.variantId ?? null,
    product_name: item.name,
    variant_label: item.variantLabel ?? null,
    image_url: item.imageUrl,
    quantity: item.quantity,
    unit_price: item.price,
    total_price: item.price * item.quantity,
  }));

  await supabase.from("order_items").insert(orderItems);

  // Initial status history
  await supabase.from("order_status_history").insert({
    order_id: order.id,
    status: "pending",
    note: "Order placed",
  });

  // Increment discount usage
  if (promoCode) {
    try {
      await supabase.rpc("increment_discount_usage", { p_code: promoCode });
    } catch {
      // non-fatal
    }
  }

  // Send order confirmation email
  try {
    const fullOrder: Order = {
      ...order,
      order_items: orderItems.map((i, idx) => ({ ...i, id: `item-${idx}` })),
    };
    await sendOrderConfirmationEmail(fullOrder);
  } catch (e) {
    console.error("[Orders] confirmation email failed:", e);
  }

  // If card payment → create LemonSqueezy checkout
  if (paymentMethod === "card") {
    const checkoutUrl = await createLemonSqueezyCheckout({
      id: order.id,
      orderNumber: order.order_number,
      totalPkr: total,
      email: customerEmail,
      name: customerName,
    });

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Failed to create payment session. Please try COD or contact support." },
        { status: 500 },
      );
    }

    return NextResponse.json({ order, checkoutUrl });
  }

  // COD — return order directly
  return NextResponse.json({ order });
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
