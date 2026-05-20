"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { signUp, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
            Used only for your default profile avatar illustration.
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
          <p className="text-sm text-primary">{state.success}</p>
        ) : null}
        <Button type="submit" className="w-full gap-2" disabled={pending}>
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : null}
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-gold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

