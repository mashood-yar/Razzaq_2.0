import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="font-serif text-3xl tracking-tight">Reset password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We&apos;ll email you a link to choose a new password.
      </p>
      <div className="mt-10">
        <ForgotPasswordForm />
      </div>
    </>
  );
}
