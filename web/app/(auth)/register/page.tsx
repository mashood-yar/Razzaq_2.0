import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
};

export default function RegisterPage() {
  return (
    <>
      <h1 className="font-display text-3xl tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Join LUMINA for faster checkout and order history.
      </p>
      <div className="mt-10">
        <RegisterForm />
      </div>
    </>
  );
}
