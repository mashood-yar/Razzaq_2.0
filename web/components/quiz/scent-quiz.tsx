"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { scoreProductsForQuiz } from "@/lib/products";

const steps = [
  {
    id: "mood",
    question: "Which mood speaks to you tonight?",
    options: [
      { label: "Bold & commanding", value: "bold" },
      { label: "Soft & intimate", value: "soft" },
      { label: "Bright & airy", value: "bright" },
      { label: "Deep & mysterious", value: "deep" },
    ],
  },
  {
    id: "intensity",
    question: "How do you want to be remembered in a room?",
    options: [
      { label: "Clean silhouette", value: "clean" },
      { label: "Sensual trail", value: "sensual" },
      { label: "Quiet luxury", value: "soft" },
      { label: "Unmistakable presence", value: "bold" },
    ],
  },
  {
    id: "season",
    question: "Which season mirrors your soul?",
    options: [
      { label: "Spring bloom", value: "spring" },
      { label: "Summer radiance", value: "summer" },
      { label: "Autumn depth", value: "fall" },
      { label: "Winter stillness", value: "winter" },
    ],
  },
  {
    id: "signature",
    question: "Your signature should feel…",
    options: [
      { label: "Fresh & minimal", value: "clean" },
      { label: "Opulent & spiced", value: "deep" },
      { label: "Floral poetry", value: "spring" },
      { label: "Wooded dusk", value: "fall" },
    ],
  },
] as const;

export function ScentQuiz() {
  const open = useUiStore((s) => s.quizOpen);
  const setOpen = useUiStore((s) => s.setQuizOpen);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const current = steps[step];
  const isLast = step === steps.length - 1;

  function pick(value: string) {
    if (!current) return;
    const next = { ...answers, [current.id]: value };
    setAnswers(next);
    if (!isLast) setStep((s) => s + 1);
    else setStep(steps.length);
  }

  const recommended =
    step >= steps.length && Object.keys(answers).length >= 4
      ? scoreProductsForQuiz({
          mood: answers.mood ?? "bold",
          intensity: answers.intensity ?? "clean",
          season: answers.season ?? "spring",
          signature: answers.signature ?? "clean",
        })
      : [];

  function reset() {
    setStep(0);
    setAnswers({});
  }

  function handleOpenChange(v: boolean) {
    setOpen(v);
    if (!v) {
      reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden border-white/10 bg-card">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">
            Scent discovery
          </DialogTitle>
          <DialogDescription>
            Four questions. Three curated recommendations.
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step < steps.length && current && (
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <p className="text-sm font-medium text-foreground">
                {current.question}
              </p>
              <div className="grid gap-2">
                {current.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-left text-sm transition-colors hover:border-gold/40 hover:bg-white/5"
                    onClick={() => pick(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs text-muted-foreground">
                Step {step + 1} of {steps.length}
              </p>
            </motion.div>
          )}

          {step >= steps.length && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                We think you will love these compositions:
              </p>
              <ul className="space-y-3">
                {recommended.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/shop/${p.slug}`}
                      className="flex gap-3 rounded-lg border border-white/10 p-2 transition-colors hover:border-gold/30"
                      onClick={() => handleOpenChange(false)}
                    >
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={p.images[0]}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {p.tagline}
                        </p>
                        <p className="mt-1 text-sm text-gold">
                          ${p.price}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 pt-2">
                <Button variant="secondary" className="flex-1" onClick={reset}>
                  Retake
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/shop" onClick={() => handleOpenChange(false)}>
                    Browse all
                  </Link>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
