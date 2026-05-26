"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name:    z.string().trim().min(2, "Name required"),
  email:   z.string().trim().toLowerCase().email("Valid email required"),
  subject: z.string().min(2, "Subject required"),
  message: z.string().trim().min(10, "Please write at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

const SUBJECTS = [
  "Order & Shipping Query",
  "Returns & Exchanges",
  "Product Enquiry",
  "Payment Issue",
  "Press & Partnerships",
  "Wholesale",
  "Other",
];

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSent(true);
    } else {
      const json = await res.json();
      setError(json.error ?? "Failed to send message. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[2px] border border-graphite bg-charcoal p-8 backdrop-blur-md"
    >
      {!sent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <h2 className="font-display text-2xl text-ivory italic mb-4">Direct Enquiry</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="text-smoke">Name</Label>
              <Input className="input mt-1.5" {...register("name")} />
              {errors.name && (
                <p className="mt-1 text-xs text-error">{errors.name.message}</p>
              )}
            </div>
            <div>
              <Label className="text-smoke">Email</Label>
              <Input type="email" className="input mt-1.5" {...register("email")} />
              {errors.email && (
                <p className="mt-1 text-xs text-error">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="text-smoke">Subject</Label>
            <select
              {...register("subject")}
              className="mt-1.5 w-full rounded-[2px] border border-graphite bg-obsidian px-3 py-2 text-sm text-ivory focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/60 transition-colors"
            >
              <option value="">Select a topic</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.subject && (
              <p className="mt-1 text-xs text-error">{errors.subject.message}</p>
            )}
          </div>

          <div>
            <Label className="text-smoke">Message</Label>
            <Textarea
              className="input mt-1.5 min-h-[140px]"
              {...register("message")}
              placeholder="How can we help you?"
            />
            {errors.message && (
              <p className="mt-1 text-xs text-error">{errors.message.message}</p>
            )}
          </div>

          {error && (
            <p className="rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send Message"}
          </button>
        </form>
      ) : (
        <div className="py-8 text-center">
          <p className="font-display text-3xl italic text-gold">Thank you.</p>
          <p className="mt-3 text-sm text-smoke font-light tracking-wide">
            We received your message and will get back to you within 24 hours.
          </p>
        </div>
      )}
    </motion.div>
  );
}
