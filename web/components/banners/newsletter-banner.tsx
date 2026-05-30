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
      className="relative"
    >
      <span className="eyebrow">Stay Close</span>
      <h2 className="text-display mt-3 text-foreground">The Inner Circle</h2>
      <p className="mx-auto mt-4 max-w-md text-sm font-light leading-relaxed text-text-secondary">
        Early access to new launches, exclusive offers, and stories from the house. No noise — only
        what matters.
      </p>

      {status === "success" ? (
        <p className="mt-10 font-display text-xl italic text-gold-bright">
          You&apos;re in — welcome to the family.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 flex max-w-md flex-col gap-0 sm:flex-row sm:items-stretch"
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
            placeholder="Your email address"
            disabled={status === "loading"}
            className="input-luxe h-12 flex-1 border-0 border-b border-noir-muted bg-transparent italic placeholder:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-luxe-primary mt-4 min-h-12 shrink-0 px-7 sm:mt-0"
          >
            {status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              "Subscribe"
            )}
          </button>
        </form>
      )}

      {status === "error" && message && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {message}
        </p>
      )}

      <p className="mt-4 text-[11px] text-[#4A4640]">
        No spam. Unsubscribe anytime. We respect your privacy.
      </p>
    </motion.section>
  );
}
