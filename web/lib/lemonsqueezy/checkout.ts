import {
  lemonSqueezySetup,
  createCheckout,
} from "@lemonsqueezy/lemonsqueezy.js";

let setup = false;
type CheckoutData = {
  data?: {
    attributes?: {
      url?: string;
    };
  };
};

function ensureSetup() {
  if (!setup) {
    lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });
    setup = true;
  }
}

export async function createLemonSqueezyCheckout(order: {
  id: string;
  orderNumber: string;
  totalPkr: number;
  email: string;
  name: string;
}): Promise<string | null> {
  ensureSetup();

  // Fetch PKR→USD rate from our own API (cached)
  let rate = 280; // fallback
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/currency`,
      { next: { revalidate: 3600 } },
    );
    if (res.ok) {
      const data = await res.json();
      rate = data.rate ?? rate;
    }
  } catch {
    // use fallback
  }

  const totalUsd = Math.max(0.5, Math.round((order.totalPkr / rate) * 100) / 100);

  const storeId = process.env.LEMONSQUEEZY_STORE_ID!;
  const variantId = process.env.LEMONSQUEEZY_PRODUCT_VARIANT_ID!;

  const response = await createCheckout(storeId, variantId, {
    checkoutData: {
      email: order.email,
      name: order.name,
      custom: {
        order_id: order.id,
        order_number: order.orderNumber,
      },
    },
    productOptions: {
      name: `Razzaq Luxe — Order ${order.orderNumber}`,
      description: `Order total: PKR ${order.totalPkr.toLocaleString()} (~USD ${totalUsd})`,
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/order/${order.id}?success=true`,
    },
  });

  if (response.error) {
    console.error("[LemonSqueezy] createCheckout error:", response.error);
    return null;
  }

  const checkoutData = response.data as CheckoutData | undefined;
  return checkoutData?.data?.attributes?.url ?? null;
}
