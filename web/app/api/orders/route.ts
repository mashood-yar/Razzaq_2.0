import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createLemonSqueezyCheckout } from "@/lib/lemonsqueezy/checkout";
import { sendOrderConfirmationEmail } from "@/lib/resend/client";
import type { CartItem, Order } from "@/lib/types";

function isStripeCheckoutEnabled(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY?.trim() &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
  );
}

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
    transactionId,
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
    paymentMethod:
      | "card"
      | "cod"
      | "safepay"
      | "jazzcash"
      | "payfast"
      | "bank_transfer";
    promoCode?: string;
    discountAmount?: number;
    guestEmail?: string;
    /** Bank / wallet receipt reference for manual verification */
    transactionId?: string;
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

  const trimmedTxn =
    typeof transactionId === "string" ? transactionId.trim() : "";
  if (paymentMethod === "bank_transfer") {
    if (!trimmedTxn) {
      return NextResponse.json(
        { error: "Enter your bank or Upaisa transaction reference from the receipt." },
        { status: 400 },
      );
    }
  }

  /*
   * PayFast storefront integration intentionally disabled — do not accept new PayFast orders.
   */
  if (paymentMethod === "payfast") {
    return NextResponse.json(
      {
        error:
          "PayFast is not available. Choose Cash on Delivery or Bank / Upaisa transfer.",
      },
      { status: 400 },
    );
  }

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
      transaction_id:
        paymentMethod === "bank_transfer" ? trimmedTxn || null : null,
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

  // Email: COD + Lemon Squeezy get immediate confirmation. Stripe / Safepay confirm after webhook.
  const sendNow =
    paymentMethod === "cod" ||
    paymentMethod === "bank_transfer" ||
    (paymentMethod === "card" && !isStripeCheckoutEnabled());

  if (sendNow) {
    try {
      const fullOrder: Order = {
        ...order,
        order_items: orderItems.map((i, idx) => ({ ...i, id: `item-${idx}` })),
      };
      await sendOrderConfirmationEmail(fullOrder);
    } catch (e) {
      console.error("[Orders] confirmation email failed:", e);
    }
  }

  if (paymentMethod === "safepay") {
    if (!process.env.SAFEPAY_API_KEY?.trim()) {
      return NextResponse.json(
        {
          error:
            "Safepay is not configured. Set SAFEPAY_API_KEY or choose another payment method.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ order, safepay: true });
  }

  if (paymentMethod === "jazzcash") {
    const jc =
      process.env.JAZZCASH_MERCHANT_ID?.trim() &&
      process.env.JAZZCASH_PASSWORD?.trim() &&
      process.env.JAZZCASH_INTEGRITY_SALT?.trim();
    if (!jc) {
      return NextResponse.json(
        {
          error:
            "JazzCash is not configured. Set JAZZCASH_MERCHANT_ID, JAZZCASH_PASSWORD, and JAZZCASH_INTEGRITY_SALT or choose another payment method.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json({ order, jazzcash: true });
  }

  /*
   * PAYFAST (disabled) — formerly returned { order, payfast: true }; see commented lib + routes when re‑enabling:
   *
   * if (paymentMethod === "payfast") {
   *   const pf = payfastConfig();
   *   ...
   *   return NextResponse.json({ order, payfast: true });
   * }
   */

  // Stripe — hosted Checkout; frontend POST /api/payment/stripe/create-checkout-session then redirects.
  if (paymentMethod === "card" && isStripeCheckoutEnabled()) {
    return NextResponse.json({ order, stripe: true });
  }

  // Card via Lemon Squeezy (legacy) when Stripe env is not configured
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
        { error: "Failed to create payment session. Try COD or contact support." },
        { status: 500 },
      );
    }

    return NextResponse.json({ order, checkoutUrl });
  }

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
