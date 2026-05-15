import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { splitFullName } from "@/lib/checkout/split-full-name";
import { sendOrderConfirmationCodeEmail } from "@/lib/resend/client";
import type { CartItem, Order } from "@/lib/types";
import { customerSupportWhatsAppUrl } from "@/lib/notifications/whatsapp";

function generateConfirmationCode(): string {
  return String(100000 + randomInt(900000));
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
      fullName: string;
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
    paymentMethod: "cod" | "bank_transfer";
    promoCode?: string;
    discountAmount?: number;
    guestEmail?: string;
    transactionId?: string;
  } = body;

  if (!cartItems?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  if (paymentMethod !== "cod" && paymentMethod !== "bank_transfer") {
    return NextResponse.json(
      { error: "Only Cash on Delivery or Bank / Upaisa transfer is available." },
      { status: 400 },
    );
  }

  const fullName = String(shippingAddress?.fullName ?? "").trim();
  if (fullName.length < 2) {
    return NextResponse.json(
      { error: "Please enter your full name." },
      { status: 400 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const subtotal = cartItems.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.quantity,
    0,
  );

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

  const customerEmail =
    shippingAddress.email || guestEmail || user?.email || "";
  if (!customerEmail.trim()) {
    return NextResponse.json(
      { error: "A valid email is required for order confirmation." },
      { status: 400 },
    );
  }

  const { first: shipFirst, last: shipLast } = splitFullName(fullName);
  const customerName = fullName;
  const plainCode = generateConfirmationCode();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user?.id ?? null,
      guest_email: user ? null : customerEmail,
      customer_email: customerEmail,
      customer_name: customerName,
      customer_phone: shippingAddress.phone,
      status: "pending_confirmation",
      payment_method: paymentMethod,
      payment_status: "pending",
      transaction_id:
        paymentMethod === "bank_transfer" ? trimmedTxn || null : null,
      confirmation_code: plainCode,
      confirmation_code_expires_at: expiresAt,
      confirmation_attempts: 0,
      subtotal_pkr: subtotal,
      discount_pkr: discountAmount,
      shipping_pkr: shippingCost,
      total_pkr: total,
      discount_code: promoCode ?? null,
      shipping_method: shippingMethod,
      ship_first_name: shipFirst,
      ship_last_name: shipLast,
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

  await supabase.from("order_status_history").insert({
    order_id: order.id,
    status: "pending_confirmation",
    note: "Order placed — awaiting email confirmation",
  });

  if (user?.id) {
    const { error: profErr } = await supabase
      .from("profiles")
      .update({
        phone: shippingAddress.phone,
        address_line: shippingAddress.addressLine1,
        city: shippingAddress.city,
        province: shippingAddress.province,
        shipping_full_name: fullName,
        shipping_phone: shippingAddress.phone,
        shipping_address: shippingAddress.addressLine1,
        shipping_city: shippingAddress.city,
        shipping_province: shippingAddress.province,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (profErr) console.warn("[Orders] profile update:", profErr);
  }

  if (promoCode) {
    try {
      await supabase.rpc("increment_discount_usage", { p_code: promoCode });
    } catch {
      /* non-fatal */
    }
  }

  try {
    const fullOrder: Order = {
      ...(order as unknown as Order),
      order_items: orderItems.map((i, idx) => ({
        ...i,
        id: `item-${idx}`,
      })) as Order["order_items"],
    };
    await sendOrderConfirmationCodeEmail(fullOrder, plainCode, expiresAt);
  } catch (e) {
    console.error("[Orders] confirmation code email failed:", e);
  }

  const whatsappHelpUrl = customerSupportWhatsAppUrl(order.order_number);

  return NextResponse.json({
    order,
    whatsappHelpUrl: whatsappHelpUrl ?? undefined,
  });
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
