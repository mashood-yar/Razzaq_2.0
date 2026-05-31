import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <>
      <h1 className="w-full text-center font-display italic text-[2.5rem] tracking-tight text-[var(--cream-bone)]">
        Sign in
      </h1>
      <p className="mt-2 w-full text-center font-body font-light text-[13px] text-[var(--cream-muted)]">
        Access your orders and saved addresses.
      </p>
      <div className="mt-10 flex w-full justify-center">
        <div className="w-full max-w-sm">
          <Suspense
            fallback={<p className="text-sm text-[var(--cream-muted)] text-center">Loading…</p>}
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </>
  );
}
