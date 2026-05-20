import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <>
      <h1 className="w-full text-center font-display text-3xl tracking-tight text-foreground">
        Sign in
      </h1>
      <p className="mt-2 w-full text-center text-sm text-muted-foreground">
        Access your orders and saved addresses.
      </p>
      <div className="mt-10 flex w-full justify-center">
        <div className="w-full max-w-sm">
          <Suspense
            fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}
