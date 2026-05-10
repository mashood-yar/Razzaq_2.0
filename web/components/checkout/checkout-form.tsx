"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCartStore,
  cartSubtotal,
  cartShipping,
  cartTotal,
  formatPKR,
} from "@/stores/cart-store";
import { PK_PROVINCES } from "@/lib/utils";

// ─── Schemas ──────────────────────────────────────────────────────────────
const detailsSchema = z.object({
  firstName:    z.string().min(1, "First name required"),
  lastName:     z.string().min(1, "Last name required"),
  email:        z.string().email("Valid email required"),
  phone:        z.string().min(10, "Valid phone required"),
  addressLine1: z.string().min(5, "Address required"),
  addressLine2: z.string().optional(),
  city:         z.string().min(2, "City required"),
  province:     z.string().min(2, "Province required"),
  postalCode:   z.string().optional(),
  country:      z.string().min(1).default("PK"),
});

type DetailsInput = z.input<typeof detailsSchema>;
type DetailsData  = z.output<typeof detailsSchema>;

type ShippingMethod = "standard" | "express";
type PaymentMethod = "card" | "cod";

export function CheckoutForm() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const promoCode = useCartStore((s) => s.promoCode);
  const promoDiscount = useCartStore((s) => s.promoDiscount);
  const clearCart = useCartStore((s) => s.clearCart);
  const applyPromo = useCartStore((s) => s.applyPromo);
  const removePromo = useCartStore((s) => s.removePromo);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [shippingDetails, setShippingDetails] = useState<DetailsData | null>(null);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const sub = cartSubtotal(items);
  const shipCost =
    shippingMethod === "express" ? 500 : cartShipping(sub, promoCode);
  const total = cartTotal(sub, promoDiscount, shipCost);

  // Step 1 form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DetailsInput, unknown, DetailsData>({ resolver: zodResolver(detailsSchema) });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-display text-3xl italic text-ivory">Your bag is empty.</p>
        <Button asChild className="mt-8">
          <Link href="/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  const applyPromoCode = async () => {
    setPromoError("");
    setPromoLoading(true);
    try {
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput, orderAmount: sub }),
      });
      const data = await res.json();
      if (data.valid) {
        applyPromo(promoInput.toUpperCase(), data.discountAmount ?? 0);
        setPromoInput("");
      } else {
        setPromoError(data.error ?? "Invalid code");
      }
    } catch {
      setPromoError("Failed to validate code");
    } finally {
      setPromoLoading(false);
    }
  };

  const placeOrder = async () => {
    if (!shippingDetails) return;
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: items,
          shippingAddress: shippingDetails,
          shippingMethod:
            shippingMethod === "express" ? "express_pk" : "standard_pk",
          paymentMethod,
          promoCode: promoCode ?? undefined,
          discountAmount: promoDiscount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order failed");

      clearCart();

      if (paymentMethod === "card" && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        router.push(`/order/${data.order.id}?success=true`);
      }
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -20 },
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 lg:grid-cols-[1fr_380px] lg:px-8">
      {/* Left column */}
      <div>
        {/* Progress */}
        <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest">
          {(["Details", "Shipping", "Payment"] as const).map((label, idx) => (
            <span key={label} className="flex items-center gap-2">
              {idx > 0 && <span className="text-graphite">/</span>}
              <span
                className={
                  step === idx + 1
                    ? "font-medium text-gold"
                    : step > idx + 1
                      ? "text-smoke line-through"
                      : "text-ash"
                }
              >
                {idx + 1}. {label}
              </span>
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1 — Details */}
          {step === 1 && (
            <motion.form
              key="step1"
              {...stepVariants}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit((data: DetailsData) => {
                setShippingDetails(data);
                setStep(2);
              })}
              className="space-y-6"
            >
              <h2 className="font-display text-3xl text-ivory">
                Shipping Details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    className="mt-1.5"
                    {...register("firstName")}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-error">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" className="mt-1.5" {...register("lastName")} />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-error">{errors.lastName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" className="mt-1.5" {...register("email")} />
                  {errors.email && (
                    <p className="mt-1 text-xs text-error">{errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" placeholder="+92 300 0000000" className="mt-1.5" {...register("phone")} />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-error">{errors.phone.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="addressLine1">Address</Label>
                  <Input id="addressLine1" className="mt-1.5" {...register("addressLine1")} />
                  {errors.addressLine1 && (
                    <p className="mt-1 text-xs text-error">{errors.addressLine1.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="addressLine2">Apartment / Suite (optional)</Label>
                  <Input id="addressLine2" className="mt-1.5" {...register("addressLine2")} />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input id="city" className="mt-1.5" {...register("city")} />
                  {errors.city && (
                    <p className="mt-1 text-xs text-error">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="province">Province</Label>
                  <select
                    id="province"
                    {...register("province")}
                    className="mt-1.5 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-gold/60 focus:outline-none"
                  >
                    <option value="">Select province</option>
                    {PK_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {errors.province && (
                    <p className="mt-1 text-xs text-error">{errors.province.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code (optional)</Label>
                  <Input id="postalCode" className="mt-1.5" {...register("postalCode")} />
                </div>
              </div>

              {/* Promo code */}
              <div>
                <Label>Promo Code</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="uppercase"
                    disabled={!!promoCode}
                  />
                  {promoCode ? (
                    <Button type="button" variant="outline" onClick={removePromo}>
                      Remove
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={applyPromoCode}
                      disabled={!promoInput || promoLoading}
                    >
                      {promoLoading ? "…" : "Apply"}
                    </Button>
                  )}
                </div>
                {promoCode && (
                  <p className="mt-1 text-xs text-success">
                    Code &ldquo;{promoCode}&rdquo; applied — saving {formatPKR(promoDiscount)}
                  </p>
                )}
                {promoError && (
                  <p className="mt-1 text-xs text-error">{promoError}</p>
                )}
              </div>

              <Button type="submit" size="lg" className="w-full">
                Continue to Shipping
              </Button>
            </motion.form>
          )}

          {/* Step 2 — Shipping method */}
          {step === 2 && (
            <motion.div
              key="step2"
              {...stepVariants}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h2 className="font-display text-3xl text-ivory">
                Shipping Method
              </h2>
              <div className="space-y-3">
                {[
                  {
                    value: "standard" as const,
                    label: "Standard Delivery",
                    sub: "3–5 business days · TCS / Leopards",
                    price: sub >= 5000 ? "Free" : formatPKR(250),
                  },
                  {
                    value: "express" as const,
                    label: "Express Delivery",
                    sub: "1–2 business days · TCS",
                    price: formatPKR(500),
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setShippingMethod(opt.value)}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-colors ${
                      shippingMethod === opt.value
                        ? "border-gold/60 bg-gold/5"
                        : "border-graphite hover:border-graphite/80"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-ivory">{opt.label}</p>
                      <p className="text-xs text-smoke">{opt.sub}</p>
                    </div>
                    <span className="text-sm font-medium text-gold">{opt.price}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => setStep(3)}
                >
                  Continue to Payment
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3 — Payment */}
          {step === 3 && (
            <motion.div
              key="step3"
              {...stepVariants}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h2 className="font-display text-3xl text-ivory">
                Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  {
                    value: "card" as const,
                    label: "Pay by Card",
                    sub: "Secure card payment via LemonSqueezy. You will be redirected.",
                  },
                  {
                    value: "cod" as const,
                    label: "Cash on Delivery",
                    sub: "Pay in cash when your order arrives. Available across Pakistan.",
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPaymentMethod(opt.value)}
                    className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors ${
                      paymentMethod === opt.value
                        ? "border-gold/60 bg-gold/5"
                        : "border-graphite hover:border-graphite/80"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                        paymentMethod === opt.value
                          ? "border-gold bg-gold"
                          : "border-graphite"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-ivory">{opt.label}</p>
                      <p className="text-xs text-smoke">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>

              {submitError && (
                <p className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                  {submitError}
                </p>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={placeOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Placing order…"
                    : `Place Order · ${formatPKR(total)}`}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Order summary sidebar */}
      <aside className="h-fit rounded-2xl border border-graphite bg-charcoal/60 p-6 backdrop-blur-md lg:sticky lg:top-28">
        <h2 className="font-display text-xl text-ivory">Order Summary</h2>
        <ul className="mt-6 space-y-4">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4 text-sm">
              <span className="truncate text-smoke">
                {i.name}
                {i.variantLabel && ` (${i.variantLabel})`} × {i.quantity}
              </span>
              <span className="shrink-0 text-ivory">
                {formatPKR(i.price * i.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2 border-t border-graphite pt-6 text-sm">
          <div className="flex justify-between">
            <span className="text-smoke">Subtotal</span>
            <span className="text-ivory">{formatPKR(sub)}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-smoke">Discount ({promoCode})</span>
              <span className="text-success">− {formatPKR(promoDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-smoke">Shipping</span>
            <span className="text-ivory">
              {shipCost === 0 ? "Free" : formatPKR(shipCost)}
            </span>
          </div>
          <div className="flex justify-between pt-2 text-base font-medium">
            <span className="text-ivory">Total</span>
            <span className="text-gold">{formatPKR(total)}</span>
          </div>
        </div>
        <Link
          href="/cart"
          className="mt-6 inline-block text-xs uppercase tracking-widest text-gold hover:underline"
        >
          Edit cart
        </Link>
      </aside>
    </div>
  );
}
