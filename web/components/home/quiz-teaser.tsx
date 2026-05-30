"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";

const MOOD_PILLS = [
  { id: "dark", label: "Dark & Intense" },
  { id: "fresh", label: "Fresh & Airy" },
  { id: "floral", label: "Floral & Romantic" },
  { id: "woody", label: "Woody & Earthy" },
  { id: "spicy", label: "Spicy & Bold" },
] as const;

export function QuizTeaser() {
  const setQuizOpen = useUiStore((s) => s.setQuizOpen);
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-xl text-center">
      <span className="eyebrow">Find Your Signature</span>
      <h3 className="text-display mt-3 text-foreground">What Speaks to Your Soul?</h3>
      <p className="mx-auto mt-4 max-w-md text-[15px] font-light leading-relaxed text-text-secondary">
        Every great fragrance begins with a feeling. Tell us your mood — we&apos;ll find your
        perfect match from our curated collection.
      </p>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {MOOD_PILLS.map((pill) => (
          <button
            key={pill.id}
            type="button"
            aria-pressed={active === pill.id}
            className={cn("quiz-pill", active === pill.id && "quiz-pill-active")}
            onClick={() => setActive(pill.id)}
          >
            {pill.label}
          </button>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Button type="button" size="lg" onClick={() => setQuizOpen(true)}>
          Take the Quiz
        </Button>
        <Button asChild variant="secondary" size="lg">
          <Link href="/shop">Explore Collection</Link>
        </Button>
      </div>
    </div>
  );
}
