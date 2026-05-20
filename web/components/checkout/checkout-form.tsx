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
import { PK_CITIES_BY_PROVINCE, PK_PROVINCES } from "@/lib/utils";
import { publicBankTransferDisplay } from "@/lib/checkout/bank-transfer-public";
import { TrustBadges } from "@/components/layout/trust-badges";

const detailsSchema = z.object({
  fullName:     z.string().min(2, "Full name required"),
  email:        z.string().email("Valid email required"),
  phone:        z.string().min(10, "Valid phone required"),
  addressLine1: z.string().min(10, "Full address required"),
  addressLine2: z.string().optional(),
  city:         z.string().min(2, "City required"),
  province:     z.string().min(2, "Province required"),
  postalCode:   z.string().optional(),
  country:      z.string().min(1).default("PK"),
});

type DetailsInput = z.input<typeof detailsSchema>;
type DetailsData  = z.output<typeof detailsSchema>;

type ShippingMethod = "standard" | "express";
type PaymentChoice = "cod" | "bank_transfer";

export function CheckoutForm({
  saved,
}: {
  saved?: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
  } | null;
}) {
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentChoice>("cod");
  const [bankTxnReference, setBankTxnReference] = useState("");
  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const sub = cartSubtotal(items);
  const shipCost =
    shippingMethod === "express" ? 500 : cartShipping(sub, promoCode);
  const total = cartTotal(sub, promoDiscount, shipCost);
  const bankDisplay = publicBankTransferDisplay();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DetailsInput, unknown, DetailsData>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      country: "PK",
      fullName: saved?.fullName ?? "",
      email: saved?.email ?? "",
      phone: saved?.phone ?? "",
      addressLine1: saved?.address ?? "",
      city: saved?.city ?? "",
      province: saved?.province ?? "",
    },
  });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p className="font-display text-3xl italic text-foreground">Your bag is empty.</p>
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
          transactionId:
            paymentMethod === "bank_transfer"
              ? bankTxnReference.trim()
              : undefined,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        order?: { id: string };
        confirmationEmailSent?: boolean;
      };
      if (!res.ok) throw new Error(data.error ?? "Order failed");

      clearCart();
      setIsSubmitting(false);

      if (data.order?.id) {
        if (data.confirmationEmailSent === false) {
          try {
            sessionStorage.setItem(
              `razzaq:confirm-email-missed:${data.order.id}`,
              "1",
            );
          } catch {
            /* private mode / quota */
          }
        }
        router.push(`/order/confirm/${data.order.id}`);
      } else {
        throw new Error("Order created without id");
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
      <div>
        <div className="mb-8 flex items-center gap-2 text-xs uppercase tracking-widest">
          {(["Details", "Shipping", "Payment"] as const).map((label, idx) => (
            <span key={label} className="flex items-center gap-2">
              {idx > 0 && <span className="text-graphite">/</span>}
              <span
                className={
                  step === idx + 1
                    ? "font-medium text-gold"
                    : step > idx + 1
                      ? "text-muted-foreground line-through"
                      : "text-muted-foreground"
                }
              >
                {idx + 1}. {label}
              </span>
            </span>
          ))}
        </div>

        <AnimatePresence mode="wait">
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
              <h2 className="font-display text-3xl text-foreground">
                Shipping details
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    className="mt-1.5"
                    autoComplete="name"
                    {...register("fullName")}
                  />
                  {errors.fullName && (
                    <p className="mt-1 text-xs text-error">{errors.fullName.message}</p>
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
                  <Label htmlFor="addressLine1">Full address</Label>
                  <Input id="addressLine1" className="mt-1.5" {...register("addressLine1")} />
                  {errors.addressLine1 && (
                    <p className="mt-1 text-xs text-error">{errors.addressLine1.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="addressLine2">Apartment / landmark (optional)</Label>
                  <Input id="addressLine2" className="mt-1.5" {...register("addressLine2")} />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <select id="city" {...register("city")} className="input-luxe mt-1.5">
                    <option value="">Select city</option>
                    {Object.entries(PK_CITIES_BY_PROVINCE).map(([province, cities]) => (
                      <optgroup key={province} label={province}>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="mt-1 text-xs text-error">{errors.city.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="province">Province</Label>
                  <select
                    id="province"
                    {...register("province")}
                    className="input-luxe mt-1.5"
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
              </div>

              <div>
                <Label>Promo code</Label>
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
                Continue to shipping
              </Button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              {...stepVariants}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h2 className="font-display text-3xl text-foreground">
                Shipping method
              </h2>
              <div className="space-y-3">
                {[
                  {
                    value: "standard" as const,
                    label: "Standard delivery",
                    sub: "3–5 business days · TCS / Leopards",
                    price: sub >= 5000 ? "Free" : formatPKR(250),
                  },
                  {
                    value: "express" as const,
                    label: "Express delivery",
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
                        : "border-border hover:border-border/80"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{opt.sub}</p>
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
                  Continue to payment
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              {...stepVariants}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h2 className="font-display text-3xl text-foreground">
                Payment
              </h2>
              <div className="space-y-3">
                {([
                  {
                    value: "cod" as const,
                    label: "Cash on delivery",
                    sub: "Pay in cash when your parcel arrives — available nationwide.",
                  },
                  {
                    value: "bank_transfer" as const,
                    label: "Bank / Upaisa transfer",
                    sub: "Transfer the exact total, then enter your receipt reference below.",
                  },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setPaymentMethod(opt.value)}
                    className={`flex w-full items-center gap-4 rounded-[2rem] border p-4 text-left transition-colors ${
                      paymentMethod === opt.value
                        ? "border-[#0F4C75] bg-[#0F4C75]/5 ring-2 ring-[#0F4C75]/20"
                        : "border-border hover:border-[#1B3A4B]"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                        paymentMethod === opt.value
                          ? "border-gold bg-gold"
                          : "border-border"
                      }`}
                    />
                    <div>
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                        {opt.label}
                        {opt.value === "cod" ? <span className="cod-badge">COD</span> : null}
                      </p>
                      <p className="text-xs text-muted-foreground">{opt.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
              <TrustBadges className="justify-start" />

              {submitError && (
                <p className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                  {submitError}
                </p>
              )}

              {paymentMethod === "bank_transfer" && (
                <div className="space-y-4 rounded-xl border border-border bg-muted/50 p-4 text-sm">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Transfer exactly {formatPKR(total)}
                  </p>
                  <dl className="grid gap-2 text-foreground">
                    <div>
                      <dt className="text-muted-foreground text-xs">Bank</dt>
                      <dd className="font-medium">{bankDisplay.bankName}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Account title</dt>
                      <dd className="font-medium">{bankDisplay.accountTitle}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Account number</dt>
                      <dd className="font-mono tracking-wide">{bankDisplay.accountNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground text-xs">Upaisa number</dt>
                      <dd className="font-mono tracking-wide">{bankDisplay.upaisaNumber}</dd>
                    </div>
                  </dl>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Use your checkout email ({shippingDetails?.email}) in the transfer narration when possible. After payment, enter your transaction ID below.
                  </p>
                  <div>
                    <Label htmlFor="bank-txn-reference">Bank / Upaisa transaction ID</Label>
                    <Input
                      id="bank-txn-reference"
                      className="mt-1.5"
                      placeholder="From your SMS or banking receipt"
                      value={bankTxnReference}
                      onChange={(e) => setBankTxnReference(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
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
                    : `Place order · ${formatPKR(total)}`}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <aside className="h-fit rounded-2xl border border-border bg-charcoal/60 p-6 backdrop-blur-md lg:sticky lg:top-28">
        <h2 className="font-display text-xl text-foreground">Order summary</h2>
        <ul className="mt-6 space-y-4">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4 text-sm">
              <span className="truncate text-muted-foreground">
                {i.name}
                {i.variantLabel && ` (${i.variantLabel})`} × {i.quantity}
              </span>
              <span className="shrink-0 text-foreground">
                {formatPKR(i.price * i.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-6 space-y-2 border-t border-border pt-6 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatPKR(sub)}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount ({promoCode})</span>
              <span className="text-success">− {formatPKR(promoDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-foreground">
              {shipCost === 0 ? "Free" : formatPKR(shipCost)}
            </span>
          </div>
          <div className="flex justify-between pt-2 text-base font-medium">
            <span className="text-foreground">Total</span>
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

export { CheckoutForm as CheckoutPage };
