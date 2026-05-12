"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signIn, sendMagicLink, type AuthActionState } from "@/lib/auth/actions";
import { signInWithGoogle } from "@/lib/auth/google";
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

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]">
          <span className="bg-background px-3 text-muted-foreground">Or</span>
        </div>
      </div>

      <div className="flex w-full justify-center">
        <Button
          type="button"
          variant="secondary"
          className="flex !h-auto min-h-11 w-auto items-center justify-center gap-3 px-8 py-3"
          disabled={pending || magicPending}
          onClick={() => signInWithGoogle(next).catch(console.error)}
        >
          <GoogleGlyph />
          Continue with Google
        </Button>
      </div>

      <form
        action={magicAction}
        className="space-y-3 rounded-lg border border-white/10 p-4 text-left"
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
          <p className="text-sm text-emerald-400">{magicState.success}</p>
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

function GoogleGlyph() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
