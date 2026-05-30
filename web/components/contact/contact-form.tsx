"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Valid email required"),
  subject: z.string().min(2, "Subject required"),
  message: z.string().min(10, "Please write at least 10 characters"),
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
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {!sent ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-2">
            <label htmlFor="contact-name" className="label-luxe">
              Your Name
            </label>
            <Input
              id="contact-name"
              className="input-luxe-line"
              placeholder="Ahmed Razzaq"
              autoComplete="name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-error">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="contact-email" className="label-luxe">
              Email Address
            </label>
            <Input
              id="contact-email"
              type="email"
              className="input-luxe-line"
              placeholder="your@email.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-error">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="contact-subject" className="label-luxe">
              Subject
            </label>
            <select
              id="contact-subject"
              {...register("subject")}
              className="input-luxe-line cursor-pointer appearance-none bg-transparent"
            >
              <option value="">Order Inquiry / Gifting / General</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.subject && (
              <p className="text-xs text-error">{errors.subject.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="contact-message" className="label-luxe">
              Message
            </label>
            <Textarea
              id="contact-message"
              variant="line"
              placeholder="Tell us what's on your mind..."
              {...register("message")}
            />
            {errors.message && (
              <p className="text-xs text-error">{errors.message.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send Message"}
          </Button>
        </form>
      ) : (
        <div className="py-8 text-center">
          <p className="font-display text-3xl italic text-gold-bright">Thank you.</p>
          <p className="mt-3 text-sm font-light text-muted-foreground">
            We received your message and will get back to you within 24 hours.
          </p>
        </div>
      )}
    </motion.div>
  );
}
