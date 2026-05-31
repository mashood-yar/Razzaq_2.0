"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error ?? "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <section className="relative overflow-hidden border border-border/50 bg-noir-surface px-8 py-14 text-center">
      {/* Corner accent lines */}
      <span className="pointer-events-none absolute left-4 top-4 h-8 w-8 border-l border-t border-gold-warm/20" />
      <span className="pointer-events-none absolute bottom-4 right-4 h-8 w-8 border-b border-r border-gold-warm/20" />

      <p className="eyebrow">Newsletter</p>
      <h2 className="mt-3 font-display text-3xl font-light text-foreground sm:text-4xl">
        First to know, first to wear.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm font-light leading-relaxed text-muted-foreground">
        New arrivals, exclusive offers, and editorial content — delivered to your inbox.
      </p>

      {status === "success" ? (
        <p className="mt-8 font-display text-xl italic text-gold-bright">
          You&apos;re on the list. Welcome to Razzaq Luxe.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-md flex-col gap-0 sm:flex-row sm:items-stretch"
        >
          <label htmlFor="newsletter-section-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-section-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="input-luxe h-12 flex-1 border-0 border-b border-border/70 bg-transparent italic placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:border-gold-warm/60"
          />
          <Button type="submit" disabled={status === "loading"} className="mt-4 sm:mt-0">
            {status === "loading" ? "…" : "Subscribe"}
          </Button>
        </form>
      )}

      {status === "error" && (
        <p className="mt-3 text-xs text-error">{message}</p>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        No spam. Unsubscribe anytime.
      </p>
    </section>
  );
}
