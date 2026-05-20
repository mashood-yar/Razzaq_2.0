"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoldBrandText } from "@/components/brand/gold-brand-text";

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
    <section className="rounded-3xl border border-border bg-charcoal/50 px-8 py-14 text-center backdrop-blur-md">
      <p className="text-xs uppercase tracking-widest text-gold">Newsletter</p>
      <h2 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">
        First to know, first to wear.
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
        New arrivals, exclusive offers, and editorial content — delivered to your inbox.
      </p>

      {status === "success" ? (
        <p className="mt-8 font-display text-xl italic text-foreground">
          <GoldBrandText text={"You're on the list. Welcome to Razzaq Luxe."} />
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 rounded-lg border border-border bg-obsidian px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-gold/60 focus:outline-none"
          />
          <Button type="submit" disabled={status === "loading"}>
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
