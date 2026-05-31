"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn, sendMagicLink, type AuthActionState } from "@/lib/auth/actions";

type Props = {
  defaultNext?: string;
};

const inputBase = "w-full h-[52px] bg-[var(--bg-obsidian)] border border-[var(--border-fine)] text-[var(--cream-bone)] font-body font-light text-[15px] px-4 rounded-[2px] placeholder:text-[var(--cream-ghost)] focus:border-[var(--border-glow)] focus:outline-none focus:ring-[2px] focus:ring-[var(--gold-warm)]/12 transition-all duration-200";
const labelBase = "block font-body font-semibold text-[10px] tracking-[0.25em] text-[var(--cream-muted)] uppercase mb-2";
const buttonBase = "w-full h-[56px] bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-bold text-[11px] tracking-[0.25em] rounded-[2px] transition-colors hover:bg-[var(--gold-bright)] flex items-center justify-center gap-2 disabled:opacity-50";

export function LoginForm({ defaultNext = "/account/orders" }: Props) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? defaultNext;
  const authError = searchParams.get("error");

  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(signIn, null);
  const [magicState, magicAction, magicPending] = useActionState<AuthActionState, FormData>(sendMagicLink, null);

  return (
    <div className="space-y-8 mt-6">
      {authError === "auth_failed" ? (
        <p className="text-center font-body text-[13px] text-[var(--ember)]" role="alert">
          Sign-in failed. Try again or use another method.
        </p>
      ) : null}

      <form action={formAction} className="space-y-5 text-left">
        <input type="hidden" name="next" value={next} />
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
            autoComplete="current-password"
            className={inputBase}
            required
          />
        </div>
        {state?.error ? (
          <p className="font-body text-[13px] text-[var(--ember)]" role="alert">
            {state.error}
          </p>
        ) : null}
        <button type="submit" className={buttonBase} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          SIGN IN
        </button>
      </form>

      <form
        action={magicAction}
        className="space-y-4 rounded-[4px] border border-[var(--border-mid)] bg-[var(--bg-obsidian)] p-5 text-left"
      >
        <p className="font-body font-semibold text-[10px] tracking-[0.2em] text-[var(--cream-ghost)] uppercase">
          Magic link
        </p>
        <div>
          <label htmlFor="magic-email" className={labelBase}>Email</label>
          <input
            id="magic-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="same email as above"
            className={inputBase}
          />
        </div>
        <button
          type="submit"
          className="w-full h-[48px] bg-transparent border border-[var(--border-mid)] text-[var(--cream-bone)] font-body font-semibold text-[10px] tracking-[0.25em] rounded-[2px] disabled:opacity-50 flex justify-center items-center gap-2"
          disabled={pending || magicPending}
        >
          {magicPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
          SEND ME A MAGIC LINK
        </button>
        {magicState?.error ? (
          <p className="font-body text-[13px] text-[var(--ember)]">{magicState.error}</p>
        ) : null}
        {magicState?.success ? (
          <p className="font-body text-[13px] text-emerald-400">{magicState.success}</p>
        ) : null}
      </form>

      <div className="flex flex-col gap-2 font-body font-light text-[13px] text-[var(--cream-muted)] text-center">
        <p>
          <Link href="/forgot-password" className="hover:text-[var(--gold-warm)] transition-colors">
            Forgot password?
          </Link>
        </p>
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[var(--cream-bone)] hover:text-[var(--gold-warm)] transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
