"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signUp, type AuthActionState } from "@/lib/auth/actions";

function strengthLabel(pw: string): { label: string; width: number } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  const tier = score <= 1 ? "weak" : score <= 3 ? "medium" : "strong";
  const width = score <= 1 ? 33 : score <= 3 ? 66 : 100;
  return { label: tier, width };
}

const inputBase = "w-full h-[52px] bg-[var(--bg-obsidian)] border border-[var(--border-fine)] text-[var(--cream-bone)] font-body font-light text-[15px] px-4 rounded-[2px] placeholder:text-[var(--cream-ghost)] focus:border-[var(--border-glow)] focus:outline-none focus:ring-[2px] focus:ring-[var(--gold-warm)]/12 transition-all duration-200";
const labelBase = "block font-body font-semibold text-[10px] tracking-[0.25em] text-[var(--cream-muted)] uppercase mb-2";
const buttonBase = "w-full h-[56px] bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-bold text-[11px] tracking-[0.25em] rounded-[2px] transition-colors hover:bg-[var(--gold-bright)] flex items-center justify-center gap-2 disabled:opacity-50 mt-4";

export function RegisterForm() {
  const [pw, setPw] = useState("");
  const strength = useMemo(() => strengthLabel(pw), [pw]);

  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signUp, null);

  return (
    <div className="space-y-8 mt-6">
      <form action={formAction} className="space-y-5">
        <div>
          <label htmlFor="full_name" className={labelBase}>Full name</label>
          <input
            id="full_name"
            name="full_name"
            autoComplete="name"
            className={inputBase}
            required
          />
        </div>
        
        <fieldset className="space-y-3">
          <legend className={labelBase}>
            Gender
          </legend>
          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:gap-6">
            <label className="flex cursor-pointer items-center gap-3 font-body font-light text-[14px] text-[var(--cream-bone)]">
              <input
                type="radio"
                name="gender"
                value="male"
                required
                className="h-4 w-4 accent-[var(--gold-warm)]"
              />
              Male
            </label>
            <label className="flex cursor-pointer items-center gap-3 font-body font-light text-[14px] text-[var(--cream-bone)]">
              <input
                type="radio"
                name="gender"
                value="female"
                className="h-4 w-4 accent-[var(--gold-warm)]"
              />
              Female
            </label>
            <label className="flex cursor-pointer items-center gap-3 font-body font-light text-[14px] text-[var(--cream-bone)]">
              <input
                type="radio"
                name="gender"
                value="other"
                className="h-4 w-4 accent-[var(--gold-warm)]"
              />
              Prefer not to say
            </label>
          </div>
        </fieldset>

        <div>
          <label htmlFor="email" className={labelBase}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={inputBase}
            required
          />
        </div>
        
        <div>
          <label htmlFor="password" className={labelBase}>Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            className={inputBase}
            required
            minLength={8}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <div className="mt-2 space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-[2px] bg-[var(--bg-obsidian)] border border-[var(--border-mid)]">
              <div
                className="h-full bg-[var(--gold-warm)] transition-all duration-300"
                style={{ width: `${strength.width}%` }}
              />
            </div>
            <p className="font-body font-light text-[11px] capitalize text-[var(--cream-ghost)]">
              Strength: {strength.label}
            </p>
          </div>
        </div>
        
        <div>
          <label htmlFor="password2" className={labelBase}>Confirm password</label>
          <input
            id="password2"
            name="password2"
            type="password"
            autoComplete="new-password"
            className={inputBase}
            required
          />
        </div>
        
        {state?.error ? (
          <p className="font-body text-[13px] text-[var(--ember)]" role="alert">
            {state.error}
          </p>
        ) : null}
        {state?.success ? (
          <p className="font-body text-[13px] text-emerald-400">{state.success}</p>
        ) : null}
        
        <button type="submit" className={buttonBase} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          CREATE ACCOUNT
        </button>
      </form>

      <p className="text-center font-body font-light text-[13px] text-[var(--cream-muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--cream-bone)] hover:text-[var(--gold-warm)] transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
