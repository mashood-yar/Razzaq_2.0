"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCartStore,
  cartSubtotal,
  cartShipping,
  cartTotal,
  formatPKR,
} from "@/stores/cart-store";
import { PK_CITIES_BY_PROVINCE, PK_PROVINCES } from "@/lib/utils";
import { publicBankTransferDisplay } from "@/lib/checkout/bank-transfer-public";
import { SafeProductImage } from "@/components/product/safe-product-image";
import { Check, Loader2, ChevronRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── All schemas and types preserved exactly ─────────────────────────────────
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

// ─── UX Law: Doherty — sub-400ms transition ──────────────────────────────────
const stepVariants = {
  initial: { opacity: 0, x: 28 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -28 },
};
const stepTransition = {
  duration: 0.28,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number] as [number, number, number, number],
};

// ─── Premium field component — Aesthetic-Usability Effect ────────────────────
function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label className="font-body font-semibold text-[10px] tracking-[0.28em] text-[var(--cream-ghost)] uppercase">
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="font-body font-light text-[12px] text-[var(--ember)] flex items-center gap-1.5"
          >
            <span className="w-1 h-1 rounded-full bg-[var(--ember)] shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Shared input class — consistent design language ─────────────────────────
const inputCls = (hasError?: boolean) =>
  cn(
    "w-full h-[52px] bg-[var(--bg-dusk)] border text-[var(--cream-bone)] font-body font-light text-[15px] px-4 rounded-[4px]",
    "placeholder:text-[var(--cream-ghost)] focus:outline-none transition-all duration-200",
    "focus:border-[var(--border-glow)] focus:ring-2 focus:ring-[var(--gold-warm)]/10",
    hasError
      ? "border-[var(--ember)] bg-[var(--ember)]/5"
      : "border-[var(--border-fine)] hover:border-[var(--border-mid)]"
  );

const selectCls = (hasError?: boolean) =>
  cn(inputCls(hasError), "cursor-pointer appearance-none bg-[var(--bg-dusk)]");

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { num: 1, label: "Contact" },
    { num: 2, label: "Shipping" },
    { num: 3, label: "Payment" },
  ];
  return (
    <div className="w-full max-w-[480px] mx-auto mb-12 px-2">
      <div className="flex items-center justify-between relative">
        {/* Background track */}
        <div className="absolute top-[14px] left-0 right-0 h-px bg-[var(--border-fine)] -z-10" />
        {/* Animated gold fill — Doherty: real-time progress feedback */}
        <motion.div
          className="absolute top-[14px] left-0 h-px bg-[var(--gold-warm)] -z-10"
          animate={{ width: current === 1 ? "0%" : current === 2 ? "50%" : "100%" }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] as [number, number, number, number] }}
        />

        {steps.map(({ num, label }) => {
          const done = current > num;
          const active = current === num;
          return (
            <div key={num} className="flex flex-col items-center gap-2 bg-[var(--bg-obsidian)] px-2">
              <motion.div
                animate={{
                  backgroundColor: done || active ? "var(--gold-warm)" : "var(--bg-dusk)",
                  borderColor: done || active ? "var(--gold-warm)" : "var(--border-mid)",
                  scale: active ? 1.1 : 1,
                }}
                transition={{ duration: 0.25 }}
                className="w-[28px] h-[28px] rounded-full border-2 flex items-center justify-center"
              >
                <AnimatePresence mode="wait">
                  {done ? (
                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check className="w-3.5 h-3.5 text-[var(--bg-void)]" strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <motion.span
                      key="num"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className={cn(
                        "font-body font-bold text-[11px]",
                        active ? "text-[var(--bg-void)]" : "text-[var(--cream-ghost)]"
                      )}
                    >
                      {num}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
              <span
                className={cn(
                  "font-body font-medium text-[10px] tracking-[0.18em] uppercase",
                  active ? "text-[var(--gold-warm)]" : done ? "text-[var(--cream-muted)]" : "text-[var(--cream-ghost)]"
                )}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
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
  // ── All original store subscriptions preserved ──
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
  const shipCost = shippingMethod === "express" ? 500 : cartShipping(sub, promoCode);
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

  // ── Empty cart state ────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-32 text-center flex flex-col items-center gap-6">
        <p className="font-display text-[2.5rem] italic text-[var(--cream-bone)]">
          Your bag is empty.
        </p>
        <p className="font-body font-light text-[15px] text-[var(--cream-muted)]">
          Explore our collection and find your signature scent.
        </p>
        <button onClick={() => router.push("/shop")} className="btn-primary h-[52px] px-10">
          BROWSE COLLECTION
        </button>
      </div>
    );
  }

  // ── API handlers — preserved exactly ────────────────────────────────────────
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
          shippingMethod: shippingMethod === "express" ? "express_pk" : "standard_pk",
          paymentMethod,
          promoCode: promoCode ?? undefined,
          discountAmount: promoDiscount,
          transactionId:
            paymentMethod === "bank_transfer" ? bankTxnReference.trim() : undefined,
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
              "1"
            );
          } catch {
            /* private mode / quota */
          }
        }
        router.push(`/checkout/success?order_id=${data.order.id}`);
      } else {
        throw new Error("Order created without id");
      }
    } catch (e: unknown) {
      setSubmitError(
        e instanceof Error ? e.message : "Something went wrong. Please try again."
      );
      setIsSubmitting(false);
    }
  };

  const sectionHeader = "font-body font-semibold text-[10px] tracking-[0.42em] text-[var(--cream-ghost)] uppercase mb-6 flex items-center gap-3";

  return (
    <div className="mx-auto max-w-[1440px] px-4 lg:px-24 py-12 lg:py-24 text-[var(--cream-bone)]">

      {/* ── Step Indicator ──────────────────────────────────────────────────── */}
      <StepIndicator current={step} />

      <div className="grid gap-12 lg:gap-20 lg:grid-cols-[1fr_400px]">

        {/* ── Left: Form Steps ─────────────────────────────────────────────── */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">

            {/* STEP 1 — CONTACT & DELIVERY */}
            {step === 1 && (
              <motion.form
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={stepTransition}
                onSubmit={handleSubmit((data: DetailsData) => {
                  setShippingDetails(data);
                  setStep(2);
                })}
                className="space-y-10"
              >
                {/* Contact section */}
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
                        ? "border-gold bg-gold/5 ring-2 ring-gold/20"
                        : "border-border hover:border-noir-muted"
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

                {/* Delivery section */}
                <div>
                  <h2 className={sectionHeader}>
                    <span className="w-5 h-5 rounded-full bg-[var(--gold-warm)] text-[var(--bg-void)] text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                    Delivery Address
                  </h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Full address" error={errors.addressLine1?.message} className="sm:col-span-2">
                      <input
                        id="addressLine1"
                        autoComplete="address-line1"
                        placeholder="Street, House number"
                        className={inputCls(!!errors.addressLine1)}
                        {...register("addressLine1")}
                      />
                    </Field>
                    <Field label="Apartment / landmark (optional)" className="sm:col-span-2">
                      <input
                        id="addressLine2"
                        autoComplete="address-line2"
                        placeholder="Floor, landmark, etc."
                        className={inputCls()}
                        {...register("addressLine2")}
                      />
                    </Field>
                    <Field label="Province" error={errors.province?.message}>
                      <select id="province" {...register("province")} className={selectCls(!!errors.province)}>
                        <option value="">Select province</option>
                        {PK_PROVINCES.map((p) => (
                          <option key={p} value={p} className="bg-[var(--bg-obsidian)]">{p}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="City" error={errors.city?.message}>
                      <select id="city" {...register("city")} className={selectCls(!!errors.city)}>
                        <option value="">Select city</option>
                        {Object.entries(PK_CITIES_BY_PROVINCE).map(([province, cities]) => (
                          <optgroup key={province} label={province} className="bg-[var(--bg-obsidian)]">
                            {cities.map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </Field>
                  </div>
                </div>

                {/* CTA — Fitts's Law: full-width, 56px, rounded */}
                <button
                  type="submit"
                  className="w-full h-[56px] bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-bold text-[11px] tracking-[0.28em] rounded-full transition-all hover:bg-[var(--gold-bright)] active:scale-[0.98] shadow-[0_0_30px_rgba(201,160,80,0.2)] flex items-center justify-center gap-2"
                >
                  CONTINUE TO SHIPPING <ChevronRight className="w-4 h-4" />
                </button>
              </motion.form>
            )}

            {/* STEP 2 — SHIPPING METHOD */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={stepTransition}
                className="space-y-8"
              >
                <h2 className={sectionHeader}>
                  <span className="w-5 h-5 rounded-full bg-[var(--gold-warm)] text-[var(--bg-void)] text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                  Shipping Method
                </h2>

                {/* ── Method cards — Law of Similarity: same card shape, gold selection state */}
                <div className="space-y-3">
                  {[
                    {
                      value: "standard" as const,
                      label: "Standard Delivery",
                      sub: "3–5 business days · TCS / Leopards",
                      price: sub >= 5000 ? "FREE" : formatPKR(250),
                      badge: sub >= 5000 ? "Complimentary" : null,
                    },
                    {
                      value: "express" as const,
                      label: "Express Delivery",
                      sub: "1–2 business days · TCS",
                      price: formatPKR(500),
                      badge: "Fastest",
                    },
                  ].map((opt) => {
                    const active = shippingMethod === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setShippingMethod(opt.value)}
                        className={cn(
                          "w-full flex items-center justify-between p-5 rounded-[8px] border transition-all duration-250 text-left",
                          active
                            ? "bg-[rgba(201,160,80,0.07)] border-[var(--border-glow)] shadow-[0_0_20px_rgba(201,160,80,0.08)]"
                            : "bg-[var(--bg-dusk)] border-[var(--border-fine)] hover:border-[var(--border-mid)]"
                        )}
                      >
                        <div className="flex gap-4 items-center">
                          {/* Radio indicator — animated */}
                          <div className={cn(
                            "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                            active ? "border-[var(--gold-warm)]" : "border-[var(--border-mid)]"
                          )}>
                            <AnimatePresence>
                              {active && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="w-2.5 h-2.5 rounded-full bg-[var(--gold-warm)]"
                                />
                              )}
                            </AnimatePresence>
                          </div>
                          <div>
                            <p className="font-body font-semibold text-[14px] text-[var(--cream-bone)] flex items-center gap-2">
                              {opt.label}
                              {opt.badge && (
                                <span className="text-[9px] font-body font-bold tracking-[0.15em] bg-[var(--gold-warm)]/15 text-[var(--gold-warm)] border border-[var(--gold-warm)]/30 px-2 py-0.5 rounded-full">
                                  {opt.badge}
                                </span>
                              )}
                            </p>
                            <p className="font-body font-light text-[13px] text-[var(--cream-muted)] mt-0.5">
                              {opt.sub}
                            </p>
                          </div>
                        </div>
                        <span className={cn(
                          "font-body font-bold text-[14px] shrink-0 ml-4",
                          active ? "text-[var(--gold-warm)]" : "text-[var(--cream-muted)]"
                        )}>
                          {opt.price}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="h-[52px] px-6 bg-transparent border border-[var(--border-mid)] text-[var(--cream-bone)] font-body font-semibold text-[11px] tracking-[0.2em] rounded-full hover:border-[var(--border-glow)] transition-colors"
                  >
                    BACK
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 h-[52px] bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-bold text-[11px] tracking-[0.28em] rounded-full transition-all hover:bg-[var(--gold-bright)] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    CONTINUE TO PAYMENT <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — PAYMENT */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={stepTransition}
                className="space-y-8"
              >
                <h2 className={sectionHeader}>
                  <span className="w-5 h-5 rounded-full bg-[var(--gold-warm)] text-[var(--bg-void)] text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                  Payment Method
                </h2>

                <div className="space-y-3">
                  {([
                    {
                      value: "cod" as const,
                      label: "Cash on Delivery",
                      sub: "Pay in cash when your parcel arrives — available nationwide.",
                    },
                    {
                      value: "bank_transfer" as const,
                      label: "Bank / Upaisa Transfer",
                      sub: "Transfer the exact total, then enter your receipt reference below.",
                    },
                  ]).map((opt) => {
                    const active = paymentMethod === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPaymentMethod(opt.value)}
                        className={cn(
                          "w-full flex items-center gap-4 p-5 rounded-[8px] border transition-all duration-250 text-left",
                          active
                            ? "bg-[rgba(201,160,80,0.07)] border-[var(--border-glow)] shadow-[0_0_20px_rgba(201,160,80,0.08)]"
                            : "bg-[var(--bg-dusk)] border-[var(--border-fine)] hover:border-[var(--border-mid)]"
                        )}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                          active ? "border-[var(--gold-warm)]" : "border-[var(--border-mid)]"
                        )}>
                          <AnimatePresence>
                            {active && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="w-2.5 h-2.5 rounded-full bg-[var(--gold-warm)]"
                              />
                            )}
                          </AnimatePresence>
                        </div>
                        <div>
                          <p className="font-body font-semibold text-[14px] text-[var(--cream-bone)]">
                            {opt.label}
                          </p>
                          <p className="font-body font-light text-[13px] text-[var(--cream-muted)] mt-0.5">
                            {opt.sub}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bank transfer details — AnimatePresence for smooth reveal */}
                <AnimatePresence>
                  {paymentMethod === "bank_transfer" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] as [number, number, number, number] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-5 rounded-[8px] border border-[var(--border-mid)] bg-[var(--bg-dusk)] p-5">
                        <p className="font-body font-semibold text-[10px] tracking-[0.25em] text-[var(--gold-warm)] uppercase">
                          Transfer exactly {formatPKR(total)}
                        </p>
                        <div className="grid gap-3 text-[13px]">
                          {[
                            { label: "Bank", value: bankDisplay.bankName },
                            { label: "Account title", value: bankDisplay.accountTitle },
                            { label: "Account #", value: bankDisplay.accountNumber, mono: true },
                            { label: "Upaisa", value: bankDisplay.upaisaNumber, mono: true },
                          ].map(({ label, value, mono }) => (
                            <div key={label} className="grid grid-cols-[110px_1fr] items-center">
                              <span className="font-body font-light text-[var(--cream-ghost)]">{label}</span>
                              <span className={cn("text-[var(--cream-bone)]", mono && "font-mono")}>{value}</span>
                            </div>
                          ))}
                        </div>
                        <p className="font-body font-light text-[12px] text-[var(--cream-muted)] leading-relaxed border-t border-[var(--border-fine)] pt-4">
                          Use your checkout email ({shippingDetails?.email}) in the transfer narration. After payment, enter your transaction ID below.
                        </p>
                        <Field label="Transaction ID">
                          <input
                            id="bank-txn-reference"
                            className={inputCls()}
                            placeholder="From your SMS or banking receipt"
                            value={bankTxnReference}
                            onChange={(e) => setBankTxnReference(e.target.value)}
                            autoComplete="off"
                          />
                        </Field>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit error */}
                <AnimatePresence>
                  {submitError && (
                    <motion.p
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-[8px] border border-[var(--ember)]/30 bg-[var(--ember)]/8 px-5 py-4 font-body text-[13px] text-[var(--ember)] flex items-start gap-2"
                    >
                      <span className="w-4 h-4 rounded-full border border-[var(--ember)] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">!</span>
                      {submitError}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="h-[52px] px-6 bg-transparent border border-[var(--border-mid)] text-[var(--cream-bone)] font-body font-semibold text-[11px] tracking-[0.2em] rounded-full hover:border-[var(--border-glow)] transition-colors"
                  >
                    BACK
                  </button>
                  {/* CTA — Doherty: animated loading state, never just freezes */}
                  <button
                    onClick={placeOrder}
                    disabled={isSubmitting}
                    className="flex-1 h-[52px] bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-bold text-[11px] tracking-[0.28em] rounded-full transition-all hover:bg-[var(--gold-bright)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(201,160,80,0.2)]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        PROCESSING…
                      </>
                    ) : (
                      <>PLACE ORDER →</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right: Order Summary ─────────────────────────────────────────── */}
        {/* UX Law: Law of Proximity — all order details in a single grouped card */}
        <aside className="w-full relative lg:sticky lg:top-[100px] h-fit">
          <div className="rounded-[8px] border border-[var(--border-mid)] bg-[var(--bg-dusk)] overflow-hidden">
            <div className="p-5 border-b border-[var(--border-fine)]">
              <h2 className="font-body font-semibold text-[10px] tracking-[0.38em] text-[var(--cream-ghost)] uppercase">
                Order Summary
              </h2>
            </div>

            <ul className="divide-y divide-[var(--border-fine)]">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3 p-4 items-center">
                  <div className="relative w-[44px] h-[60px] rounded-[4px] bg-[var(--bg-obsidian)] border border-[var(--border-fine)] overflow-hidden shrink-0">
                    <SafeProductImage src={i.imageUrl} alt={i.name} fill sizes="44px" className="object-cover" />
                    {/* Quantity badge overlay */}
                    <div className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-bold text-[9px] flex items-center justify-center">
                      {i.quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-display font-medium text-[14px] text-[var(--cream-bone)] block truncate">{i.name}</span>
                    {i.variantLabel && <span className="font-body font-light text-[11px] text-[var(--cream-ghost)]">{i.variantLabel}</span>}
                  </div>
                  <span className="font-body font-semibold text-[13px] text-[var(--gold-warm)] shrink-0">
                    {formatPKR(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Promo code section */}
            <div className="p-5 border-t border-[var(--border-fine)]">
              <label className="font-body font-semibold text-[10px] tracking-[0.25em] text-[var(--cream-ghost)] uppercase flex items-center gap-2 mb-3">
                <Tag className="w-3.5 h-3.5 text-[var(--gold-warm)]" />
                Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  className={cn(
                    inputCls(),
                    "flex-1 font-body font-semibold text-[12px] tracking-[0.18em] placeholder:font-light placeholder:tracking-normal placeholder:text-[13px]"
                  )}
                  disabled={!!promoCode}
                />
                {promoCode ? (
                  <button
                    type="button"
                    onClick={removePromo}
                    className="h-[52px] px-4 bg-[var(--bg-obsidian)] border border-[var(--border-mid)] font-body font-semibold text-[10px] tracking-[0.2em] text-[var(--cream-muted)] rounded-[4px] hover:text-[var(--ember)] transition-colors shrink-0"
                  >
                    REMOVE
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    disabled={!promoInput || promoLoading}
                    className="h-[52px] px-4 bg-[var(--bg-obsidian)] border border-[var(--border-mid)] font-body font-semibold text-[10px] tracking-[0.2em] text-[var(--cream-muted)] rounded-[4px] hover:text-[var(--gold-warm)] disabled:opacity-40 transition-colors shrink-0 flex items-center gap-1.5"
                  >
                    {promoLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "APPLY"}
                  </button>
                )}
              </div>
              <AnimatePresence>
                {promoCode && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 font-body font-light text-[12px] text-[var(--sage)] flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Code &quot;{promoCode}&quot; applied
                  </motion.p>
                )}
                {promoError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 font-body font-light text-[12px] text-[var(--ember)]"
                  >
                    {promoError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Price breakdown */}
            <div className="p-5 pt-0 space-y-2 text-[13px]">
              <div className="flex justify-between text-[var(--cream-muted)]">
                <span>Subtotal</span>
                <span className="text-[var(--cream-bone)]">{formatPKR(sub)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--cream-muted)]">Discount</span>
                  <span className="text-[var(--sage)]">− {formatPKR(promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[var(--cream-muted)]">
                <span>Shipping</span>
                <span className="text-[var(--cream-bone)]">
                  {shipCost === 0 ? <span className="text-[var(--sage)]">Free</span> : formatPKR(shipCost)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border-fine)]">
                <span className="font-body font-semibold text-[14px] text-[var(--cream-bone)]">Total</span>
                <motion.span
                  key={total}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-display font-bold text-[1.625rem] text-[var(--cream-bone)]"
                >
                  {formatPKR(total)}
                </motion.span>
              </div>
            </div>
          </div>

          {/* Trust badges below summary — Law of Proximity */}
          <div className="mt-4 flex items-center justify-center gap-5 text-[11px] text-[var(--cream-ghost)] font-body">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[var(--gold-warm)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Secure checkout
            </span>
            <span className="w-px h-3 bg-[var(--border-fine)]" />
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[var(--gold-warm)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              100% authentic
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export { CheckoutForm as CheckoutPage };
