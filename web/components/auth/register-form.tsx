"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signUp, type AuthActionState } from "@/lib/auth/actions";
import { signInWithGoogle } from "@/lib/auth/google";
import { friendlyAuthMessage } from "@/lib/auth/auth-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";

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

export function RegisterForm() {
  const [pw, setPw] = useState("");
  const strength = useMemo(() => strengthLabel(pw), [pw]);

  const [state, formAction, pending] = useActionState<
    AuthActionState,
    FormData
  >(signUp, null);

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            name="full_name"
            autoComplete="name"
            required
          />
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium leading-none text-foreground">
            Gender
          </legend>
          <p className="text-xs text-muted-foreground">
            Used only for your default profile avatar when you don&apos;t use a Google photo.
          </p>
          <div className="flex flex-col gap-2 pt-1 sm:flex-row sm:flex-wrap sm:gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="gender"
                value="male"
                required
                className="h-4 w-4 accent-gold"
              />
              Male
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="gender"
                value="female"
                className="h-4 w-4 accent-gold"
              />
              Female
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="gender"
                value="other"
                className="h-4 w-4 accent-gold"
              />
              Prefer not to say
            </label>
          </div>
        </fieldset>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
          />
          <div className="mt-2 space-y-1">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-gold transition-all duration-300"
                style={{ width: `${strength.width}%` }}
              />
            </div>
            <p className="text-xs capitalize text-muted-foreground">
              Strength: {strength.label}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password2">Confirm password</Label>
          <Input
            id="password2"
            name="password2"
            type="password"
            autoComplete="new-password"
            required
          />
        </div>
        {state?.error ? (
          <p className="text-sm text-red-400" role="alert">
            {state.error}
          </p>
        ) : null}
        {state?.success ? (
          <p className="text-sm text-emerald-400">{state.success}</p>
        ) : null}
        <Button type="submit" className="w-full gap-2" disabled={pending}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          Create account
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]">
          <span className="bg-background px-3 text-muted-foreground">Or</span>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="flex w-full items-center justify-center gap-3"
        disabled={pending}
        onClick={() =>
          signInWithGoogle("/account/orders").catch((e) =>
            toast.error(friendlyAuthMessage(e, "sign_up")),
          )
        }
      >
        <GoogleGlyph />
        Continue with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-gold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}
