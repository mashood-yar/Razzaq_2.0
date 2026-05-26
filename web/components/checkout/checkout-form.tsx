"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import { TrustBadges } from "@/components/layout/trust-badges";
import { SafeProductImage } from "@/components/product/safe-product-image";
import { Check } from "lucide-react";

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
        <p className="font-display text-[2rem] italic text-[var(--cream-bone)]">Your bag is empty.</p>
        <button onClick={() => router.push('/shop')} className="mt-8 btn-primary">
          CONTINUE SHOPPING
        </button>
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
        router.push(`/checkout/success?order_id=${data.order.id}`);
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

  // Atelier specific input classes
  const inputBase = "w-full h-[52px] bg-[var(--bg-dusk)] border border-[var(--border-fine)] text-[var(--cream-bone)] font-body font-light text-[15px] px-4 rounded-[2px] placeholder:text-[var(--cream-ghost)] focus:border-[var(--border-glow)] focus:outline-none focus:ring-[2px] focus:ring-[var(--gold-warm)]/12 transition-all duration-200";
  const inputError = "!border-[var(--ember)]";
  const labelBase = "block font-body font-semibold text-[10px] tracking-[0.25em] text-[var(--cream-muted)] uppercase mb-2";
  const errorText = "mt-2 font-body font-light text-[12px] text-[var(--ember)]/90";
  const sectionHeader = "font-body font-semibold text-[10px] tracking-[0.42em] text-[var(--cream-ghost)] uppercase border-b border-[var(--border-fine)] pb-3 mb-6";

  return (
    <div className="mx-auto max-w-[1440px] px-4 lg:px-24 py-12 lg:py-24 text-[var(--cream-bone)]">
      
      {/* Step Indicator (Endowed Progress) */}
      <div className="w-full max-w-[480px] mx-auto mb-16 px-4">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-[8px] left-0 right-0 h-[1px] bg-[var(--border-fine)] -z-10" />
          <div className="absolute top-[8px] left-0 h-[1px] bg-[var(--gold-warm)] -z-10 transition-all duration-500" style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }} />
          
          {(["Contact", "Shipping", "Payment"] as const).map((label, idx) => {
            const isCompletedOrActive = step >= idx + 1;
            return (
              <div key={label} className="flex flex-col items-center gap-3 bg-[var(--bg-obsidian)] px-2">
                <div className={`w-[16px] h-[16px] rounded-full border-2 flex items-center justify-center transition-colors ${
                  isCompletedOrActive ? "border-[var(--gold-warm)] bg-[var(--gold-warm)]" : "border-[var(--border-mid)] bg-[var(--bg-dusk)]"
                }`}>
                  {isCompletedOrActive && <Check className="w-2.5 h-2.5 text-[var(--bg-void)]" />}
                </div>
                <span className={`font-body font-medium text-[11px] tracking-[0.15em] uppercase ${
                  isCompletedOrActive ? "text-[var(--gold-warm)]" : "text-[var(--cream-ghost)]"
                }`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-12 lg:gap-24 lg:grid-cols-[1fr_420px]">
        {/* Left Side: Forms */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: CONTACT & DELIVERY */}
            {step === 1 && (
              <motion.form
                key="step1"
                {...stepVariants}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit((data: DetailsData) => {
                  setShippingDetails(data);
                  setStep(2);
                })}
                className="space-y-10"
              >
                <div>
                  <h2 className={sectionHeader}>CONTACT INFORMATION</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="fullName" className={labelBase}>Full name</label>
                      <input id="fullName" autoComplete="name" className={`${inputBase} ${errors.fullName ? inputError : ''}`} {...register("fullName")} />
                      {errors.fullName && <p className={errorText}>{errors.fullName.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="email" className={labelBase}>Email</label>
                      <input id="email" type="email" className={`${inputBase} ${errors.email ? inputError : ''}`} {...register("email")} />
                      {errors.email && <p className={errorText}>{errors.email.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="phone" className={labelBase}>Phone</label>
                      <input id="phone" type="tel" placeholder="+92 300 0000000" className={`${inputBase} ${errors.phone ? inputError : ''}`} {...register("phone")} />
                      {errors.phone && <p className={errorText}>{errors.phone.message}</p>}
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className={sectionHeader}>DELIVERY ADDRESS</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="addressLine1" className={labelBase}>Full address</label>
                      <input id="addressLine1" className={`${inputBase} ${errors.addressLine1 ? inputError : ''}`} {...register("addressLine1")} />
                      {errors.addressLine1 && <p className={errorText}>{errors.addressLine1.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="addressLine2" className={labelBase}>Apartment / landmark (optional)</label>
                      <input id="addressLine2" className={inputBase} {...register("addressLine2")} />
                    </div>
                    <div>
                      <label htmlFor="city" className={labelBase}>City</label>
                      <select id="city" {...register("city")} className={`${inputBase} ${errors.city ? inputError : ''}`}>
                        <option value="">Select city</option>
                        {Object.entries(PK_CITIES_BY_PROVINCE).map(([province, cities]) => (
                          <optgroup key={province} label={province} className="bg-[var(--bg-obsidian)]">
                            {cities.map((city) => (
                              <option key={city} value={city}>{city}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                      {errors.city && <p className={errorText}>{errors.city.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="province" className={labelBase}>Province</label>
                      <select id="province" {...register("province")} className={`${inputBase} ${errors.province ? inputError : ''}`}>
                        <option value="">Select province</option>
                        {PK_PROVINCES.map((p) => (
                          <option key={p} value={p} className="bg-[var(--bg-obsidian)]">{p}</option>
                        ))}
                      </select>
                      {errors.province && <p className={errorText}>{errors.province.message}</p>}
                    </div>
                  </div>
                </div>

                <button type="submit" className="w-full h-[56px] bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-bold text-[11px] tracking-[0.25em] rounded-[2px] transition-colors hover:bg-[var(--gold-bright)] mt-4">
                  CONTINUE TO SHIPPING →
                </button>
              </motion.form>
            )}

            {/* STEP 2: SHIPPING METHOD */}
            {step === 2 && (
              <motion.div
                key="step2"
                {...stepVariants}
                transition={{ duration: 0.25 }}
                className="space-y-10"
              >
                <div>
                  <h2 className={sectionHeader}>SHIPPING METHOD</h2>
                  <div className="space-y-4">
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
                        className={`w-full flex items-center justify-between p-5 rounded-[4px] border transition-all duration-300 ${
                          shippingMethod === opt.value
                            ? "bg-[rgba(201,160,80,0.06)] border-[var(--border-glow)]"
                            : "bg-[var(--bg-dusk)] border-[var(--border-fine)]"
                        }`}
                      >
                        <div className="text-left flex gap-4 items-center">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${shippingMethod === opt.value ? 'border-[var(--gold-warm)]' : 'border-[var(--border-mid)]'}`}>
                            {shippingMethod === opt.value && <div className="w-2 h-2 rounded-full bg-[var(--gold-warm)]" />}
                          </div>
                          <div>
                            <p className="font-body font-medium text-[15px] text-[var(--cream-bone)]">{opt.label}</p>
                            <p className="font-body font-light text-[13px] text-[var(--cream-muted)] mt-1">{opt.sub}</p>
                          </div>
                        </div>
                        <span className="font-body font-semibold text-[14px] text-[var(--gold-warm)]">{opt.price}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="h-[56px] px-8 bg-transparent border border-[var(--border-mid)] text-[var(--cream-bone)] font-body font-semibold text-[11px] tracking-[0.25em] rounded-[2px]">
                    BACK
                  </button>
                  <button onClick={() => setStep(3)} className="flex-1 h-[56px] bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-bold text-[11px] tracking-[0.25em] rounded-[2px] transition-colors hover:bg-[var(--gold-bright)]">
                    CONTINUE TO PAYMENT →
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PAYMENT */}
            {step === 3 && (
              <motion.div
                key="step3"
                {...stepVariants}
                transition={{ duration: 0.25 }}
                className="space-y-10"
              >
                <div>
                  <h2 className={sectionHeader}>PAYMENT METHOD</h2>
                  <div className="space-y-4">
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
                        className={`w-full flex items-center justify-between p-5 rounded-[4px] border transition-all duration-300 ${
                          paymentMethod === opt.value
                            ? "bg-[rgba(201,160,80,0.06)] border-[var(--border-glow)]"
                            : "bg-[var(--bg-dusk)] border-[var(--border-fine)]"
                        }`}
                      >
                        <div className="text-left flex gap-4 items-center">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${paymentMethod === opt.value ? 'border-[var(--gold-warm)]' : 'border-[var(--border-mid)]'}`}>
                            {paymentMethod === opt.value && <div className="w-2 h-2 rounded-full bg-[var(--gold-warm)]" />}
                          </div>
                          <div>
                            <p className="font-body font-medium text-[15px] text-[var(--cream-bone)] flex items-center gap-2">
                              {opt.label}
                              {opt.value === "cod" && <span className="text-[9px] bg-[var(--bg-obsidian)] border border-[var(--border-mid)] px-2 py-0.5 rounded-[2px]">COD</span>}
                            </p>
                            <p className="font-body font-light text-[13px] text-[var(--cream-muted)] mt-1 pr-4">{opt.sub}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {submitError && (
                  <p className="rounded-[4px] border border-[var(--ember)]/30 bg-[var(--ember)]/10 px-4 py-3 font-body text-[13px] text-[var(--ember)]">
                    {submitError}
                  </p>
                )}

                <AnimatePresence>
                  {paymentMethod === "bank_transfer" && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 rounded-[4px] border border-[var(--border-mid)] bg-[var(--bg-dusk)] p-5">
                        <p className="font-body font-semibold text-[10px] tracking-[0.2em] text-[var(--gold-warm)] uppercase">
                          Transfer exactly {formatPKR(total)}
                        </p>
                        <div className="grid gap-3 font-body font-light text-[13px]">
                          <div className="grid grid-cols-[120px_1fr]">
                            <span className="text-[var(--cream-ghost)]">Bank</span>
                            <span className="text-[var(--cream-bone)] font-medium">{bankDisplay.bankName}</span>
                          </div>
                          <div className="grid grid-cols-[120px_1fr]">
                            <span className="text-[var(--cream-ghost)]">Account title</span>
                            <span className="text-[var(--cream-bone)] font-medium">{bankDisplay.accountTitle}</span>
                          </div>
                          <div className="grid grid-cols-[120px_1fr]">
                            <span className="text-[var(--cream-ghost)]">Account number</span>
                            <span className="text-[var(--cream-bone)] font-mono">{bankDisplay.accountNumber}</span>
                          </div>
                          <div className="grid grid-cols-[120px_1fr]">
                            <span className="text-[var(--cream-ghost)]">Upaisa number</span>
                            <span className="text-[var(--cream-bone)] font-mono">{bankDisplay.upaisaNumber}</span>
                          </div>
                        </div>
                        <p className="font-body font-light text-[12px] text-[var(--cream-muted)] leading-relaxed mt-2">
                          Use your checkout email ({shippingDetails?.email}) in the transfer narration. After payment, enter your transaction ID below.
                        </p>
                        <div className="mt-4">
                          <label htmlFor="bank-txn-reference" className={labelBase}>Transaction ID</label>
                          <input
                            id="bank-txn-reference"
                            className={inputBase}
                            placeholder="From your SMS or banking receipt"
                            value={bankTxnReference}
                            onChange={(e) => setBankTxnReference(e.target.value)}
                            autoComplete="off"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="h-[56px] px-8 bg-transparent border border-[var(--border-mid)] text-[var(--cream-bone)] font-body font-semibold text-[11px] tracking-[0.25em] rounded-[2px]">
                    BACK
                  </button>
                  <button onClick={placeOrder} disabled={isSubmitting} className="flex-1 h-[56px] bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-bold text-[11px] tracking-[0.25em] rounded-[2px] transition-colors hover:bg-[var(--gold-bright)] disabled:opacity-50">
                    {isSubmitting ? "PROCESSING…" : "PLACE ORDER →"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Side: Order Summary */}
        <aside className="w-full relative lg:sticky lg:top-[120px] h-fit">
          <div className="bg-[var(--bg-dusk)] border border-[var(--border-mid)] rounded-[4px] p-6">
            <h2 className="font-body font-semibold text-[10px] tracking-[0.35em] text-[var(--cream-ghost)] uppercase mb-6 border-b border-[var(--border-fine)] pb-4">
              ORDER SUMMARY
            </h2>
            
            <ul className="space-y-4 mb-6">
              {items.map((i) => (
                <li key={i.id} className="flex gap-4 items-center">
                  <div className="relative w-[48px] h-[64px] rounded-[2px] bg-[var(--bg-obsidian)] border border-[var(--border-fine)] overflow-hidden shrink-0">
                     <SafeProductImage src={i.imageUrl} alt={i.name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-display font-medium text-[15px] text-[var(--cream-bone)] truncate">{i.name}</span>
                    <span className="font-body font-light text-[12px] text-[var(--cream-ghost)] truncate">{i.variantLabel} x {i.quantity}</span>
                  </div>
                  <span className="font-body font-semibold text-[14px] text-[var(--gold-warm)] shrink-0">
                    {formatPKR(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mb-6 pt-6 border-t border-[var(--border-fine)]">
              <label className={labelBase}>Promo code</label>
              <div className="flex gap-2">
                <input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className={`${inputBase} flex-1`}
                  disabled={!!promoCode}
                />
                {promoCode ? (
                  <button type="button" onClick={removePromo} className="h-[52px] px-6 bg-[var(--bg-obsidian)] border border-[var(--border-mid)] font-body font-semibold text-[10px] tracking-[0.2em] text-[var(--cream-muted)] rounded-[2px]">
                    REMOVE
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={applyPromoCode}
                    disabled={!promoInput || promoLoading}
                    className="h-[52px] px-6 bg-[var(--bg-obsidian)] border border-[var(--border-mid)] font-body font-semibold text-[10px] tracking-[0.2em] text-[var(--cream-muted)] rounded-[2px] hover:text-[var(--gold-warm)] disabled:opacity-50"
                  >
                    {promoLoading ? "…" : "APPLY"}
                  </button>
                )}
              </div>
              {promoCode && (
                <p className="mt-2 font-body font-light text-[12px] text-emerald-400/90">
                  Code "{promoCode}" applied
                </p>
              )}
              {promoError && (
                <p className="mt-2 font-body font-light text-[12px] text-[var(--ember)]/90">
                  {promoError}
                </p>
              )}
            </div>

            <div className="space-y-3 font-body font-light text-[14px] text-[var(--cream-warm)] pt-6 border-t border-[var(--border-fine)]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPKR(sub)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[var(--cream-ghost)]">Discount</span>
                  <span className="text-emerald-400/90">− {formatPKR(promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipCost === 0 ? "Free" : formatPKR(shipCost)}</span>
              </div>
            </div>

            <div className="flex items-end justify-between pt-6 mt-6 border-t border-[var(--border-fine)]">
              <span className="font-body font-medium text-[15px] text-[var(--cream-bone)]">Total</span>
              <span className="font-display font-semibold text-[1.5rem] text-[var(--cream-bone)]">{formatPKR(total)}</span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

export { CheckoutForm as CheckoutPage };
