import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) {
  const full = Math.floor(rating);
  const partial = rating - full >= 0.5;
  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < full
              ? "fill-gold text-gold"
              : i === full && partial
                ? "fill-gold/50 text-gold"
                : "text-white/20",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}
