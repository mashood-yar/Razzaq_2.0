"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn, sendMagicLink, type AuthActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  defaultNext?: string;
};

export function LoginForm({ defaultNext = "/account/orders" }: Props) {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? defaultNext;
  const authError = searchParams.get("error");

  const [state, formAction, pending] = useActionState<
    AuthActionState,
    FormData
  >(signIn, null);

  const [magicState, magicAction, magicPending] = useActionState<
    AuthActionState,
    FormData
  >(sendMagicLink, null);

  return (
    <div className="space-y-8">
      {authError === "auth_failed" ? (
        <p className="text-center text-sm text-red-400" role="alert">
          Sign-in failed. Try again or use another method.
        </p>
      ) : null}

      <form action={formAction} className="space-y-4 text-left">
        <input type="hidden" name="next" value={next} />
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
            autoComplete="current-password"
            required
          />
        </div>
        {state?.error ? (
          <p className="text-sm text-red-400" role="alert">
            {state.error}
          </p>
        ) : null}
        <div className="flex w-full justify-center">
          <Button
            type="submit"
            className="!h-auto min-h-11 w-auto px-8 py-3 gap-2"
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : null}
            Sign in
          </Button>
        </div>
      </form>

      <form
        action={magicAction}
        className="space-y-3 rounded-lg border border-border/50 p-4 text-left"
      >
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Magic link
        </p>
        <div className="space-y-2">
          <Label htmlFor="magic-email">Email</Label>
          <Input
            id="magic-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="same email as above"
          />
        </div>
        <Button
          type="submit"
          variant="ghost"
          className="w-full text-muted-foreground"
          disabled={pending || magicPending}
        >
          {magicPending ? (
            <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
          ) : null}
          Send me a magic link
        </Button>
        {magicState?.error ? (
          <p className="text-sm text-red-400">{magicState.error}</p>
        ) : null}
        {magicState?.success ? (
          <p className="text-sm text-primary">{magicState.success}</p>
        ) : null}
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/forgot-password" className="text-gold hover:underline">
          Forgot password?
        </Link>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-gold hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
