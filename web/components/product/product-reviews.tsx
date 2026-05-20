"use client";

import { useState } from "react";
import { StarRating } from "@/components/product/star-rating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const MOCK = [
  {
    id: "1",
    author: "Camille R.",
    rating: 5,
    title: "Liquid velvet",
    body: "This is what niche should feel like — intimate projection, gorgeous dry-down.",
    date: "Feb 2026",
  },
  {
    id: "2",
    author: "Jonah K.",
    rating: 4,
    title: "Patience rewards",
    body: "Give it twenty minutes on skin before judging — the heart is extraordinary.",
    date: "Jan 2026",
  },
];

export function ProductReviews({ productName }: { productName: string }) {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="space-y-12">
      <div>
        <h2 className="font-display text-2xl">Reviews</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Verified impressions from LUMINA collectors.
        </p>
      </div>

      <ul className="space-y-8">
        {MOCK.map((r) => (
          <li key={r.id} className="border-b border-border/50 pb-8 last:border-0">
            <div className="flex flex-wrap items-center gap-3">
              <StarRating rating={r.rating} />
              <span className="font-medium">{r.title}</span>
              <span className="text-xs text-muted-foreground">{r.date}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">by {r.author}</p>
            <p className="mt-3 leading-relaxed">{r.body}</p>
          </li>
        ))}
      </ul>

      <div className="rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-md">
        <h3 className="font-display text-xl">Write a review</h3>
        {!submitted ? (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <input type="hidden" name="product" value={productName} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="rv-name">Name</Label>
                <Input id="rv-name" required className="mt-2" />
              </div>
              <div>
                <Label htmlFor="rv-email">Email</Label>
                <Input id="rv-email" type="email" required className="mt-2" />
              </div>
            </div>
            <div>
              <Label htmlFor="rv-body">Your experience</Label>
              <Textarea id="rv-body" required className="mt-2" rows={4} />
            </div>
            <Button type="submit">Submit review</Button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-navy-brand">
            Thank you — your note will appear after moderation.
          </p>
        )}
      </div>
    </div>
  );
}
