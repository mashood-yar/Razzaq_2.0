import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { createLemonSqueezyCheckout } from "@/lib/lemonsqueezy/checkout";
import { sendOrderConfirmationEmail } from "@/lib/resend/client";
import { payfastConfig } from "@/lib/payfast/config";
import type { CartItem, Order } from "@/lib/types";

function isStripeCheckoutEnabled(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY?.trim() &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim()
  );
}

/** UUID v4-ish from Supabase.gen_random_uuid() */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type StockUndo =
  | { kind: "variant"; id: string; addBack: number }
  | { kind: "product"; id: string; addBack: number };

async function rollbackPromoReservation(
  svc: ReturnType<typeof createServiceRoleClient>,
  promoCodeUpper: string | null,
): Promise<void> {
  if (!promoCodeUpper) return;
  const { error } = await svc.rpc("rollback_discount_reservation", {
    p_code: promoCodeUpper,
  });
  if (error) {
    console.error("[Orders] rollback discount reservation:", error.message);
  }
}

async function revertInventoryDecrements(
  svc: ReturnType<typeof createServiceRoleClient>,
  undo: StockUndo[],
): Promise<void> {
  for (let i = undo.length - 1; i >= 0; i--) {
    const u = undo[i]!;
    if (u.kind === "variant") {
      const { data: row } = await svc
        .from("product_variants")
        .select("stock_quantity")
        .eq("id", u.id)
        .maybeSingle();
      const current = Number(row?.stock_quantity ?? 0);
      const { error } = await svc
        .from("product_variants")
        .update({ stock_quantity: current + u.addBack })
        .eq("id", u.id);
      if (error) {
        console.error("[Orders] revert variant stock:", u.id, error.message);
      }
    } else {
      const { data: row } = await svc
        .from("products")
        .select("stock_quantity")
        .eq("id", u.id)
        .maybeSingle();
      const current = Number(row?.stock_quantity ?? 0);
      const { error } = await svc
        .from("products")
        .update({ stock_quantity: current + u.addBack })
        .eq("id", u.id);
      if (error) {
        console.error("[Orders] revert product stock:", u.id, error.message);
      }
    }
  }
}

type RepricedLine = {
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPricePkr: number;
  productName: string;
  variantLabel: string | null;
  imageUrl: string | null;
};

async function repricedLinesFromCart(
  svc: ReturnType<typeof createServiceRoleClient>,
  cartItems: CartItem[],
): Promise<{ ok: RepricedLine[] } | { error: string; status?: number }> {
  const out: RepricedLine[] = [];
  const productIds = [...new Set(cartItems.map((c) => c.productId?.trim()))].filter(
    (id) => id && UUID_RE.test(id),
  ) as string[];

  if (productIds.length === 0) {
    return { error: "No valid cart line items", status: 400 };
  }

  const { data: products, error: pErr } = await svc
    .from("products")
    .select("id,name,slug,price_pkr,stock_quantity,status")
    .in("id", productIds);

  if (pErr || !products?.length) {
    console.error("[Orders] repricing products:", pErr);
    return { error: "Failed to load catalog for checkout", status: 500 };
  }

  const productMap = new Map(products.map((p) => [p.id as string, p]));

  const variantIds = cartItems
    .map((c) => (c.variantId?.trim?.() ?? "") as string)
    .filter((id) => id && UUID_RE.test(id));

  const uniqVariantIds = [...new Set(variantIds)];

  const variantRows =
    uniqVariantIds.length > 0
      ? (
          await svc
            .from("product_variants")
            .select(
              "id,product_id,color,size,sku,price_override,stock_quantity",
            )
            .in("id", uniqVariantIds)
        ).data
      : [];

  const variantMap = new Map(variantRows?.map((v) => [v.id as string, v]) ?? []);

  const { data: imgs } = await svc
    .from("product_images")
    .select("product_id,url,is_primary,sort_order")
    .in("product_id", productIds)
    .order("sort_order", { ascending: true });

  const imageByProduct = new Map<string, string>();
  if (imgs?.length) {
    const buckets = new Map<string, typeof imgs>();
    for (const im of imgs) {
      const pid = im.product_id as string;
      if (!buckets.has(pid)) buckets.set(pid, []);
      buckets.get(pid)!.push(im);
    }
    for (const [pid, rows] of buckets) {
      const primary = rows.find((r) => r.is_primary) ?? rows[0];
      const url = primary?.url;
      if (typeof url === "string" && url) imageByProduct.set(pid, url);
    }
  }

  for (const raw of cartItems) {
    const pid = typeof raw.productId === "string" ? raw.productId.trim() : "";
    if (!pid || !UUID_RE.test(pid)) {
      return { error: "Each cart item must include a valid product id", status: 400 };
    }

    const qty = Number(raw.quantity);
    if (!(Number.isInteger(qty) && qty > 0)) {
      return { error: "Each cart item must include a positive integer quantity", status: 400 };
    }

    const product = productMap.get(pid);
    if (!product) {
      return { error: `Product not found (${pid})`, status: 400 };
    }
    if (product.status !== "active") {
      return { error: `${product.name} is not available for sale`, status: 400 };
    }

    let variantId: string | null = null;
    let unitPrice = Number(product.price_pkr);
    let available = Number(product.stock_quantity);
    let variantLabel: string | null = null;

    const vidRaw =
      typeof raw.variantId === "string" ? raw.variantId.trim() : "";
    if (vidRaw) {
      if (!UUID_RE.test(vidRaw)) {
        return { error: "Invalid variant on cart item", status: 400 };
      }
      const vRow = variantMap.get(vidRaw);
      if (!vRow || (vRow.product_id as string) !== pid) {
        return {
          error: `Variant does not match product (${product.name})`,
          status: 400,
        };
      }
      variantId = vidRaw;
      unitPrice =
        vRow.price_override != null ? Number(vRow.price_override) : Number(product.price_pkr);
      available = Number(vRow.stock_quantity);
      variantLabel =
        [vRow.color as string | null, vRow.size as string | null]
          .filter(Boolean)
          .join(" / ") || null;
    }

    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return { error: `${product.name} has an invalid price`, status: 400 };
    }
    if (qty > available) {
      return {
        error: `${product.name}: only ${available} left in stock (you asked for ${qty})`,
        status: 400,
      };
    }

    out.push({
      productId: pid,
      variantId,
      quantity: qty,
      unitPricePkr: Math.round(unitPrice * 100) / 100,
      productName: product.name as string,
      variantLabel,
      imageUrl: imageByProduct.get(pid) ?? null,
    });
  }

  return { ok: out };
}

export async function POST(request: Request) {
  const authClient = await createClient();
  let svc: ReturnType<typeof createServiceRoleClient> | null = null;

  try {
    svc = createServiceRoleClient();
  } catch (e) {
    console.error("[Orders]", e);
    return NextResponse.json(
      { error: "Server billing database is misconfigured." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();

    const {
      cartItems,
      shippingAddress,
      shippingMethod,
      paymentMethod,
      promoCode,
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
      paymentMethod: "card" | "cod" | "safepay" | "jazzcash" | "payfast";
      promoCode?: string;
      guestEmail?: string;
    } = body;

    if (!cartItems?.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const {
      data: { user },
    } = await authClient.auth.getUser();

    const repriced = await repricedLinesFromCart(svc, cartItems);
    if ("error" in repriced) {
      return NextResponse.json(
        { error: repriced.error },
        { status: repriced.status ?? 400 },
      );
    }

    const lines = repriced.ok;
    const subtotalPkr =
      Math.round(lines.reduce((s, l) => s + l.unitPricePkr * l.quantity, 0) * 100) / 100;

    const trimmedPromo = promoCode?.trim();

    /** Legacy UI shortcut — not tied to discounts.usage_count */
    const isFreeshipShortcut =
      !!trimmedPromo && trimmedPromo.toUpperCase() === "FREESHIP";

    let discountDecimal = 0;
    let promoDbFreeShipping = false;
    let promoConsumed: string | null = null;

    if (trimmedPromo && !isFreeshipShortcut) {
      const { data: discRaw, error: vErr } = await svc.rpc(
        "validate_and_lock_discount",
        {
          p_code: trimmedPromo,
          p_order_amount: subtotalPkr,
        },
      );

      if (vErr) {
        console.error("[Orders] validate_and_lock_discount:", vErr.message);
        return NextResponse.json(
          { error: "Could not validate promo code. Try again." },
          { status: 500 },
        );
      }

      const discAmt =
        typeof discRaw === "number"
          ? discRaw
          : discRaw === null || discRaw === undefined
            ? NaN
            : Number(discRaw);

      if (!Number.isFinite(discAmt)) {
        return NextResponse.json(
          { error: "Promo code is invalid, expired or limit reached." },
          { status: 400 },
        );
      }

      /** invalid sentinel from RPC (-1 or any negative amount) */
      if (discAmt < 0) {
        return NextResponse.json(
          { error: "Promo code is invalid, expired or limit reached." },
          { status: 400 },
        );
      }

      discountDecimal = Math.round(discAmt * 100) / 100;
      promoConsumed = trimmedPromo.toUpperCase();

      const { data: dist } = await svc
        .from("discounts")
        .select("type")
        .eq("code", promoConsumed)
        .maybeSingle();
      promoDbFreeShipping = dist?.type === "free_shipping";
    }

    const promoFreeShipping = isFreeshipShortcut || promoDbFreeShipping;

    const isFreeShipping =
      promoFreeShipping ||
      subtotalPkr >= 5000 ||
      shippingMethod === "standard_free";
    const shippingCost = isFreeShipping
      ? 0
      : shippingMethod?.includes("express")
        ? 500
        : 250;

    const totalPkr =
      Math.max(
        0,
        Math.round((subtotalPkr - discountDecimal) * 100) / 100,
      ) + shippingCost;

    const customerEmail =
      shippingAddress.email || guestEmail || user?.email || "";
    const customerName =
      `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim();

    let orderIdCreated: string | null = null;
    const undoStock: StockUndo[] = [];

    const { data: order, error: orderError } = await svc
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        guest_email: user ? null : customerEmail,
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: shippingAddress.phone,
        payment_method: paymentMethod,
        payment_status: "pending",
        subtotal_pkr: subtotalPkr,
        discount_pkr: discountDecimal,
        shipping_pkr: shippingCost,
        total_pkr: totalPkr,
        discount_code: trimmedPromo ? trimmedPromo.toUpperCase() : null,
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
      console.error("[Orders] create order:", orderError);
      await rollbackPromoReservation(svc, promoConsumed);
      return NextResponse.json(
        { error: orderError?.message ?? "Failed to create order" },
        { status: 500 },
      );
    }

    orderIdCreated = order.id as string;

    const orderItemRows = lines.map((item) => ({
      order_id: orderIdCreated as string,
      product_id: item.productId || null,
      variant_id: item.variantId ?? null,
      product_name: item.productName,
      variant_label: item.variantLabel,
      image_url: item.imageUrl,
      quantity: item.quantity,
      unit_price: item.unitPricePkr,
      total_price: Math.round(item.unitPricePkr * item.quantity * 100) / 100,
    }));

    const { error: itemsError } = await svc.from("order_items").insert(orderItemRows);

    if (itemsError) {
      console.error("[Orders] insert order_items:", itemsError.message);
      await svc.from("orders").delete().eq("id", orderIdCreated);
      await rollbackPromoReservation(svc, promoConsumed);
      return NextResponse.json(
        { error: "Could not finalize order lines. Try again." },
        { status: 500 },
      );
    }

    const { error: histError } = await svc.from("order_status_history").insert({
      order_id: orderIdCreated,
      status: "pending",
      note: "Order placed",
    });

    if (histError) {
      console.error("[Orders] insert order_status_history:", histError.message);
      await svc.from("orders").delete().eq("id", orderIdCreated);
      await rollbackPromoReservation(svc, promoConsumed);
      return NextResponse.json(
        { error: "Could not record order history. Try again." },
        { status: 500 },
      );
    }

    for (const line of lines) {
      if (line.variantId) {
        undoStock.push({
          kind: "variant",
          id: line.variantId,
          addBack: line.quantity,
        });

        const { error: decErr } = await svc.rpc("decrement_variant_stock", {
          p_variant_id: line.variantId,
          p_qty: line.quantity,
        });
        if (decErr) {
          console.error(
            "[Orders] decrement_variant_stock:",
            line.variantId,
            decErr.message,
          );
          await revertInventoryDecrements(svc, undoStock);
          await svc.from("orders").delete().eq("id", orderIdCreated);
          await rollbackPromoReservation(svc, promoConsumed);
          return NextResponse.json(
            { error: "Could not reserve inventory. Try again shortly." },
            { status: 500 },
          );
        }
      } else {
        undoStock.push({
          kind: "product",
          id: line.productId,
          addBack: line.quantity,
        });

        const { error: decErr } = await svc.rpc("decrement_product_stock", {
          p_product_id: line.productId,
          p_qty: line.quantity,
        });
        if (decErr) {
          console.error(
            "[Orders] decrement_product_stock:",
            line.productId,
            decErr.message,
          );
          await revertInventoryDecrements(svc, undoStock);
          await svc.from("orders").delete().eq("id", orderIdCreated);
          await rollbackPromoReservation(svc, promoConsumed);
          return NextResponse.json(
            { error: "Could not reserve inventory. Try again shortly." },
            { status: 500 },
          );
        }
      }
    }

    const sendNow =
      paymentMethod === "cod" ||
      (paymentMethod === "card" && !isStripeCheckoutEnabled());

    if (sendNow) {
      try {
        const fullOrder: Order = {
          ...order,
          order_items: orderItemRows.map((i, idx) => ({
            ...i,
            id: `item-${idx}`,
          })),
        };
        await sendOrderConfirmationEmail(fullOrder);
      } catch (e) {
        console.error("[Orders] confirmation email failed:", e);
      }
    }

    if (paymentMethod === "safepay") {
      if (!process.env.SAFEPAY_API_KEY?.trim()) {
        await revertInventoryDecrements(svc, undoStock);
        await svc.from("orders").delete().eq("id", order.id);
        await rollbackPromoReservation(svc, promoConsumed);
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
        await revertInventoryDecrements(svc, undoStock);
        await svc.from("orders").delete().eq("id", order.id);
        await rollbackPromoReservation(svc, promoConsumed);
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

    if (paymentMethod === "payfast") {
      const pf = payfastConfig();
      if (!pf) {
        await revertInventoryDecrements(svc, undoStock);
        await svc.from("orders").delete().eq("id", order.id);
        await rollbackPromoReservation(svc, promoConsumed);
        return NextResponse.json(
          {
            error:
              "PayFast is not configured. Set PAYFAST_MERCHANT_ID, PAYFAST_SECURED_KEY, and PAYFAST_API_URL or choose another payment method.",
          },
          { status: 500 },
        );
      }
      return NextResponse.json({ order, payfast: true });
    }

    if (paymentMethod === "card" && isStripeCheckoutEnabled()) {
      return NextResponse.json({ order, stripe: true });
    }

    if (paymentMethod === "card") {
      const checkoutUrl = await createLemonSqueezyCheckout({
        id: order.id,
        orderNumber: order.order_number,
        totalPkr: totalPkr,
        email: customerEmail,
        name: customerName,
      });

      if (!checkoutUrl) {
        await revertInventoryDecrements(svc, undoStock);
        await svc.from("orders").delete().eq("id", order.id);
        await rollbackPromoReservation(svc, promoConsumed);
        return NextResponse.json(
          {
            error:
              "Failed to create payment session. Try COD or contact support.",
          },
          { status: 500 },
        );
      }

      return NextResponse.json({ order, checkoutUrl });
    }

    return NextResponse.json({ order });
  } catch (e: unknown) {
    console.error("[Orders] unexpected POST error:", e);
    return NextResponse.json(
      { error: "Unexpected error placing order." },
      { status: 500 },
    );
  }
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
