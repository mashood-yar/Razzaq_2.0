import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <>
      <h1 className="w-full text-center font-display italic text-[2.5rem] tracking-tight text-[var(--cream-bone)]">
        Create account
      </h1>
      <p className="mt-2 w-full text-center font-body font-light text-[13px] text-[var(--cream-muted)]">
        Join RAZZAQ LUXE for a curated experience.
      </p>
      <div className="mt-10">
        <RegisterForm />
      </div>
    </>
  );
}
