"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CONFIRM_EMAIL_STORAGE = "razzaq:confirm-email-missed:";

export function OrderConfirmForm({
  orderId,
  orderNumber,
  expiresAtIso,
  attemptsSoFar,
  whatsappUrl,
}: {
  orderId: string;
  orderNumber: string;
  expiresAtIso: string;
  attemptsSoFar: number;
  whatsappUrl: string | null;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(Math.max(0, 5 - attemptsSoFar));
  const [emailDispatchMissed, setEmailDispatchMissed] = useState(false);

  useEffect(() => {
    try {
      const key = CONFIRM_EMAIL_STORAGE + orderId;
      if (sessionStorage.getItem(key)) {
        setEmailDispatchMissed(true);
        sessionStorage.removeItem(key);
      }
    } catch {
      /* storage unavailable */
    }
  }, [orderId]);

  const submit = async () => {
    setErr("");
    setBusy(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        redirectUrl?: string;
        alreadyConfirmed?: boolean;
        error?: string;
        attempts_left?: number;
      };

      if (data.redirectUrl && (res.ok || data.alreadyConfirmed)) {
        router.push(data.redirectUrl);
        return;
      }

      if (data.attempts_left !== undefined) {
        setAttemptsLeft(data.attempts_left);
      }

      if (res.status === 429) {
        setErr("Too many incorrect attempts. Contact support to unlock this order.");
        return;
      }
      if (res.status === 410) {
        setErr("This confirmation code has expired. Please place a new order or contact us.");
        return;
      }

      setErr(
        data.error === "invalid_code"
          ? "That code does not match. Check the email we sent you."
          : data.error === "not_found"
            ? "We could not find this order."
            : "Something went wrong. Try again.",
      );
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-8 px-4 py-16">
      <div>
        <p className="text-xs uppercase tracking-widest text-smoke">Razzaq Luxe</p>
        <h1 className="mt-2 font-display text-3xl text-ivory">
          Confirm your order
        </h1>
        <p className="mt-2 text-sm text-smoke">
          Order <span className="text-gold">{orderNumber}</span>
        </p>
        <p className="mt-1 text-xs text-ash">
          Code expires:{" "}
          {new Date(expiresAtIso).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
        <p className="mt-3 text-sm text-smoke">
          Enter the 6-digit code we emailed to you. You have{" "}
          <strong className="text-ivory">{attemptsLeft}</strong> attempt
          {attemptsLeft === 1 ? "" : "s"} left.
        </p>
      </div>

      {emailDispatchMissed && (
        <p className="rounded-lg border border-gold/25 bg-gold/10 px-4 py-3 text-sm text-ivory/90">
          We could not send the confirmation email from our server (configuration or provider issue).
          Check spam, verify your address at checkout, or{" "}
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              className="text-gold underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              message us on WhatsApp
            </a>
          ) : (
            "contact support"
          )}{" "}
          with order <span className="text-gold">{orderNumber}</span> so we can resend the code.
        </p>
      )}

      {err && (
        <p className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {err}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="code">Confirmation code</Label>
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          placeholder="• • • • • •"
          className="font-mono text-lg tracking-[0.4em]"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
        />
      </div>

      <Button
        className="w-full"
        size="lg"
        disabled={busy || code.length !== 6}
        onClick={submit}
      >
        {busy ? "Verifying…" : "Verify & continue"}
      </Button>

      {whatsappUrl ? (
        <Button variant="outline" className="w-full" asChild>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            Chat on WhatsApp
          </a>
        </Button>
      ) : null}

      <p className="text-center text-xs text-ash">
        Wrong email?{" "}
        <Link href="/checkout" className="text-gold hover:underline">
          Return to checkout
        </Link>
      </p>
    </div>
  );
}
