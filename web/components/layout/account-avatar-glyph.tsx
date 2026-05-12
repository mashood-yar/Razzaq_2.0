"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { User } from "@supabase/supabase-js";
import type { ProfileGender } from "@/lib/types";
import { oauthProfileImageUrl, userAvatarInitial } from "@/lib/auth/oauth-avatar";
import { getNavLetterSeed } from "@/lib/auth/nav-account-model";
import { letterAvatarSwatch } from "@/lib/auth/letter-avatar-hash";

const MALE_AVATAR = "/avatars/male-avatar.png";
const FEMALE_AVATAR = "/avatars/female-avatar.png";

function profileGenderFromUser(user: User): ProfileGender | null {
  const raw = (user.user_metadata as Record<string, unknown> | undefined)?.gender;
  if (raw === "male" || raw === "female" || raw === "other") return raw;
  return null;
}

/** Outline person icon — matches icy navbar accents via currentColor. */
export function NavPersonOutlineIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className ?? "h-[22px] w-[22px] text-muted-foreground"}
      aria-hidden
    >
      <circle cx="12" cy="8.25" r="3.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M6.25 19.25c0-3.35 2.55-5.5 5.75-5.5s5.75 2.15 5.75 5.5"
      />
    </svg>
  );
}

/**
 * Navbar avatar: remote OAuth avatar when present; else gender PNG from signup;
 * else hashed letter for `other` / unset.
 */
export function AccountAvatarGlyph({ user }: { user: User }) {
  const remotePhoto = oauthProfileImageUrl(user);
  const [remoteFailed, setRemoteFailed] = useState(false);

  useEffect(() => {
    setRemoteFailed(false);
  }, [user.id, remotePhoto]);

  const gender = profileGenderFromUser(user);

  if (remotePhoto && !remoteFailed) {
    return (
      <Image
        src={remotePhoto}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/15"
        draggable={false}
        onError={() => setRemoteFailed(true)}
      />
    );
  }

  if (gender === "male") {
    return (
      <Image
        src={MALE_AVATAR}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/15"
        draggable={false}
      />
    );
  }

  if (gender === "female") {
    return (
      <Image
        src={FEMALE_AVATAR}
        alt=""
        width={36}
        height={36}
        className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/15"
        draggable={false}
      />
    );
  }

  const letter = userAvatarInitial(user);
  const seed = getNavLetterSeed(user);
  const swatch = letterAvatarSwatch(seed);

  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-[15px] font-semibold uppercase leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-white/10"
      style={{ backgroundColor: swatch.bg, color: swatch.fg }}
      aria-hidden
    >
      {letter || "?"}
    </span>
  );
}
