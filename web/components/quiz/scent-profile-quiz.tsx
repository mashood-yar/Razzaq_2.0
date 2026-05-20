"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SafeProductImage } from "@/components/product/safe-product-image";
import { useUiStore } from "@/stores/ui-store";
import { useSession } from "@/lib/auth/use-session";
import { mapDbProductToLegacy } from "@/lib/catalog/map-db-product";
import type { Product as DbProduct } from "@/lib/types";
import type { LegacyProduct } from "@/lib/products";
import {
  QUIZ_QUESTIONS,
  buildScentProfile,
  writeScentProfileToStorage,
  type ScentProfile,
  type ScentQuizAnswers,
} from "@/lib/quiz/scent-profile";
import { cn } from "@/lib/utils";

type Step = 0 | 1 | 2 | 3 | "results";

const slide = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

export function ScentProfileQuiz() {
  const open = useUiStore((s) => s.quizOpen);
  const setQuizOpen = useUiStore((s) => s.setQuizOpen);
  const { status } = useSession();

  const [step, setStep] = useState<Step>(0);
  const [answers, setAnswers] = useState<Partial<ScentQuizAnswers>>({});
  const [catalog, setCatalog] = useState<LegacyProduct[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [result, setResult] = useState<ScentProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveHint, setSaveHint] = useState("");

  const reset = useCallback(() => {
    setStep(0);
    setAnswers({});
    setResult(null);
    setSaveHint("");
  }, []);

  useEffect(() => {
    if (!open) {
      const t = window.setTimeout(reset, 300);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [open, reset]);

  useEffect(() => {
    if (!open || catalog.length > 0) return;
    let cancelled = false;
    setLoadingCatalog(true);
    void (async () => {
      try {
        const res = await fetch("/api/products?limit=48");
        const json = (await res.json()) as { data?: DbProduct[] };
        if (!res.ok || !json.data?.length) return;
        if (cancelled) return;
        setCatalog(json.data.map((row) => mapDbProductToLegacy(row)));
      } catch {
        /* catalog optional — scoring falls back */
      } finally {
        if (!cancelled) setLoadingCatalog(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, catalog.length]);

  const persistProfile = useCallback(
    async (profile: ScentProfile) => {
      writeScentProfileToStorage(profile);
      if (status !== "authenticated") {
        setSaveHint("Saved on this device. Sign in to keep your profile across devices.");
        return;
      }
      setSaving(true);
      try {
        const res = await fetch("/api/account/profile", {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scent_profile: profile }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) throw new Error(data.error ?? "Could not save profile");
        setSaveHint("Saved to your account.");
      } catch {
        setSaveHint("Saved on this device. We could not sync to your account yet.");
      } finally {
        setSaving(false);
      }
    },
    [status],
  );

  const pickAnswer = <K extends keyof ScentQuizAnswers>(
    key: K,
    value: ScentQuizAnswers[K],
  ) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    if (step === 0) setStep(1);
    else if (step === 1) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) {
      const complete = next as ScentQuizAnswers;
      const profile = buildScentProfile(complete, catalog);
      setResult(profile);
      setStep("results");
      void persistProfile(profile);
    }
  };

  const progress =
    step === "results" ? 100 : (((typeof step === "number" ? step : 3) + 1) / 4) * 100;

  const currentQuestion =
    typeof step === "number" ? QUIZ_QUESTIONS[step] : null;

  return (
    <Dialog open={open} onOpenChange={setQuizOpen}>
      <DialogContent className="max-h-[min(92vh,720px)] max-w-xl overflow-hidden border-[#3282B8]/30 bg-gradient-to-b from-[#1B262C] to-[#0F4C75]/95 p-0 text-foreground shadow-2xl">
        <motion.div
          className="h-1 bg-[#0F4C75]"
          aria-hidden
        >
          <motion.div
            className="h-full bg-[#D4A832]"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </motion.div>

        <motion.div
          className="max-h-[min(88vh,680px)] overflow-y-auto px-6 pb-6 pt-5"
          layout
        >
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="font-display text-2xl text-[#D4A832]">
              {step === "results" ? "Your scent profile" : "Scent profile quiz"}
            </DialogTitle>
            <DialogDescription className="text-sm text-[#BBE1FA]/80">
              {step === "results"
                ? "Three fragrances chosen for your chemistry."
                : "Four intimate questions — then your personalised trio."}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {step !== "results" && currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                variants={slide}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.28 }}
                className="mt-6"
              >
                <p className="text-xs font-medium uppercase tracking-widest text-[#3282B8]">
                  Question {(step as number) + 1} of 4
                </p>
                <h3 className="mt-2 font-display text-xl text-foreground">
                  {currentQuestion.title}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {currentQuestion.subtitle}
                </p>

                <ul className="mt-5 space-y-2.5" role="listbox" aria-label={currentQuestion.title}>
                  {currentQuestion.options.map((opt) => {
                    const selected =
                      answers[currentQuestion.id] === opt.value;
                    return (
                      <li key={opt.value}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selected}
                          disabled={loadingCatalog && step === 3}
                          onClick={() => pickAnswer(currentQuestion.id, opt.value)}
                          className={cn(
                            "w-full rounded-xl border px-4 py-3.5 text-left transition-all",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A832]/60",
                            selected
                              ? "border-[#D4A832]/60 bg-[#D4A832]/15 shadow-[0_0_24px_rgba(212,168,50,0.12)]"
                              : "border-[#3282B8]/25 bg-[#1B262C]/60 hover:border-[#3282B8]/50 hover:bg-[#0F4C75]/40",
                          )}
                        >
                          <span className="block font-medium text-foreground">
                            {opt.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {opt.hint}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            )}

            {step === "results" && result && (
              <motion.div
                key="results"
                variants={slide}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.28 }}
                className="mt-6"
              >
                <motion.div
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-3 rounded-xl border border-[#D4A832]/35 bg-[#D4A832]/10 px-4 py-3"
                >
                  <Sparkles className="h-6 w-6 shrink-0 text-[#D4A832]" aria-hidden />
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[#3282B8]">
                      You are
                    </p>
                    <p className="font-display text-lg text-[#D4A832]">{result.label}</p>
                  </div>
                </motion.div>

                <p className="mt-4 text-sm text-muted-foreground">
                  Your curated trio — explore each on its product page.
                </p>

                <ul className="mt-4 space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <motion.li
                      key={rec.slug}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.08 * i }}
                    >
                      <Link
                        href={`/products/${rec.slug}`}
                        onClick={() => setQuizOpen(false)}
                        className="flex items-center gap-3 rounded-xl border border-[#3282B8]/25 bg-[#1B262C]/50 p-3 transition-colors hover:border-[#D4A832]/40 hover:bg-[#0F4C75]/30"
                      >
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#0F4C75]/40">
                          <SafeProductImage
                            src={rec.image}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-base text-foreground">
                            {rec.name}
                          </p>
                          {rec.tagline && (
                            <p className="truncate text-xs text-muted-foreground">
                              {rec.tagline}
                            </p>
                          )}
                        </div>
                        <span className="shrink-0 text-xs font-medium text-[#D4A832]">
                          View →
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>

                {saveHint && (
                  <p className="mt-4 text-center text-xs text-muted-foreground">{saveHint}</p>
                )}

                <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-[#3282B8]/40"
                    onClick={() => {
                      reset();
                    }}
                  >
                    Retake quiz
                  </Button>
                  {status !== "authenticated" ? (
                    <Button asChild className="flex-1 bg-[#D4A832] text-[#1B262C] hover:bg-[#D4A832]/90">
                      <Link href="/login?next=/account/profile" onClick={() => setQuizOpen(false)}>
                        Sign in to save
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="flex-1 bg-[#D4A832] text-[#1B262C] hover:bg-[#D4A832]/90">
                      <Link href="/account/profile" onClick={() => setQuizOpen(false)}>
                        View on profile
                      </Link>
                    </Button>
                  )}
                </div>
                {saving && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">Saving…</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
