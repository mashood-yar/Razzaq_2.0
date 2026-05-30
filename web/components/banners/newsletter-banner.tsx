"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function NewsletterBanner() {
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(
          typeof data.error === "string" ? data.error : "Something went wrong. Please try again.",
        );
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: reduceMotion ? 0 : 0.5 }}
      className="newsletter-banner-corners relative overflow-hidden rounded-sm border border-border bg-noir-surface px-6 py-14 sm:px-12"
    >
      <div className="relative z-10 mx-auto max-w-xl text-center">
        <span className="eyebrow">Newsletter</span>
        <h2 className="mt-3 font-display text-3xl font-light text-foreground sm:text-4xl">
          Join the RazzaqLuxe Family
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Early access to drops, styling notes, and members-only offers.
        </p>

        {status === "success" ? (
          <p className="mt-8 font-display text-xl italic text-gold-bright">
            You&apos;re in — welcome to the family.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:items-center"
          >
            <label htmlFor="newsletter-banner-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-banner-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={status === "loading"}
              className="input-luxe h-12 flex-1 bg-noir-elevated/90"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-luxe-primary shrink-0 px-8"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Joining…
                </>
              ) : (
                "Subscribe"
              )}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 text-sm text-[#E05A5A]" role="alert">
            {message}
          </p>
        )}

        <p className="mt-5 text-xs text-muted-foreground">
          We respect your inbox. Unsubscribe anytime. By subscribing you agree to receive
          marketing emails from Razzaq Luxe.
        </p>
      </div>
    </motion.section>
  );
}
