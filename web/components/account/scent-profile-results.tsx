"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SafeProductImage } from "@/components/product/safe-product-image";
import { useUiStore } from "@/stores/ui-store";
import { useSession } from "@/lib/auth/use-session";
import {
  readScentProfileFromStorage,
  type ScentProfile,
} from "@/lib/quiz/scent-profile";

type Props = {
  /** From GET /api/account/profile when logged in */
  initialProfile?: ScentProfile | null;
};

export function ScentProfileResults({ initialProfile = null }: Props) {
  const setQuizOpen = useUiStore((s) => s.setQuizOpen);
  const { status } = useSession();
  const [profile, setProfile] = useState<ScentProfile | null>(initialProfile);
  const [syncing, setSyncing] = useState(false);

  const loadLocal = useCallback(() => {
    const local = readScentProfileFromStorage();
    if (local) setProfile(local);
  }, []);

  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
      return;
    }
    loadLocal();
  }, [initialProfile, loadLocal]);

  const syncLocalToAccount = useCallback(async () => {
    const local = readScentProfileFromStorage();
    if (!local || status !== "authenticated") return;
    setSyncing(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scent_profile: local }),
      });
      if (res.ok) setProfile(local);
    } finally {
      setSyncing(false);
    }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated" && !initialProfile) {
      const local = readScentProfileFromStorage();
      if (local) void syncLocalToAccount();
    }
  }, [status, initialProfile, syncLocalToAccount]);

  if (!profile) {
    return (
      <section
        className="rounded-xl border border-[#D4A832]/25 bg-gradient-to-br from-[#0A0A08]/80 to-[#C49A1E]/30 p-6"
        aria-labelledby="scent-profile-heading"
      >
        <h2 id="scent-profile-heading" className="font-display text-2xl text-[#D4A832]">
          Your Scent Profile
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Take our four-question quiz to discover your signature mood and three curated
          fragrances.
        </p>
        <Button
          type="button"
          className="mt-5 bg-[#D4A832] text-[#0A0A08] hover:bg-[#D4A832]/90"
          onClick={() => setQuizOpen(true)}
        >
          Begin the quiz
        </Button>
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border border-[#D4A832]/25 bg-gradient-to-br from-[#0A0A08]/80 to-[#C49A1E]/30 p-6"
      aria-labelledby="scent-profile-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="scent-profile-heading" className="font-display text-2xl text-foreground">
            Your Scent Profile
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Based on your latest quiz answers
            {profile.completedAt && (
              <>
                {" "}
                ·{" "}
                {new Date(profile.completedAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </>
            )}
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4A832]/40 bg-[#D4A832]/15 px-3 py-1 text-sm font-medium text-[#D4A832]">
          <Sparkles className="h-4 w-4" aria-hidden />
          {profile.label}
        </span>
      </div>

      <ul className="mt-6 space-y-3">
        {profile.recommendations.map((rec) => (
          <li key={rec.slug}>
            <Link
              href={`/products/${rec.slug}`}
              className="flex items-center gap-3 rounded-lg border border-[#D4A832]/20 bg-[#0A0A08]/50 p-3 transition-colors hover:border-[#D4A832]/35"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[#C49A1E]/40">
                <SafeProductImage
                  src={rec.image}
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-base">{rec.name}</p>
                {rec.tagline && (
                  <p className="truncate text-xs text-muted-foreground">{rec.tagline}</p>
                )}
              </div>
              <span className="text-xs text-[#D4A832]">Shop →</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-[#D4A832]/40"
          onClick={() => setQuizOpen(true)}
        >
          Retake quiz
        </Button>
        {syncing && (
          <span className="self-center text-xs text-muted-foreground">Syncing…</span>
        )}
      </div>
    </section>
  );
}
