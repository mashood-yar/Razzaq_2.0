"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useUiStore } from "@/stores/ui-store";

export function QuizTeaser() {
  const setQuizOpen = useUiStore((s) => s.setQuizOpen);

  return (
    <Card className="overflow-hidden border-gold/20 bg-gradient-to-br from-emerald-deep/80 to-card">
      <CardContent className="flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
            <Sparkles className="h-7 w-7" aria-hidden />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-foreground">
              Discover your scent profile
            </h3>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Four intimate questions — then meet three fragrances chosen for your chemistry.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="default"
          size="lg"
          className="shrink-0"
          onClick={() => setQuizOpen(true)}
        >
          Begin the quiz
        </Button>
      </CardContent>
    </Card>
  );
}
