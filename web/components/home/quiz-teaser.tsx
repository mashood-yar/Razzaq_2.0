"use client";

import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";

export function QuizTeaser() {
  const setQuizOpen = useUiStore((s) => s.setQuizOpen);

  return (
    <div className="mx-auto max-w-xl text-center">
      <span className="eyebrow">Scent Profile</span>
      <h3 className="text-display mt-3 text-foreground">Discover Your Signature</h3>
      <p className="mx-auto mt-4 max-w-md text-sm font-light leading-relaxed text-text-secondary">
        Four intimate questions — then meet three fragrances chosen for your chemistry.
      </p>
      <Button
        type="button"
        variant="default"
        size="lg"
        className="mt-10"
        onClick={() => setQuizOpen(true)}
      >
        Begin the quiz
      </Button>
    </div>
  );
}
