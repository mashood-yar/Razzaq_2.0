import { cn } from "@/lib/utils";
import {
  type HighlightLabel,
  highlightBadgeContent,
  highlightLabelText,
} from "@/lib/product-highlights";

export function HighlightBadge({
  label,
  className,
}: {
  label: HighlightLabel;
  className?: string;
}) {
  const content = highlightBadgeContent(label);
  const ariaLabel = highlightLabelText(label);

  if (content.variant === "pill") {
    return (
      <div
        className={cn("highlight-badge-pill", className)}
        role="status"
        aria-label={ariaLabel}
      >
        <span className="highlight-badge-pill__dot" aria-hidden />
        <span className="highlight-badge-pill__text">{content.text}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "highlight-badge-seal",
        label === "premium" && "highlight-badge-seal--premium",
        label === "on-sale" && "highlight-badge-seal--sale",
        className,
      )}
      role="status"
      aria-label={ariaLabel}
    >
      <span className="highlight-badge-seal__line1">{content.line1}</span>
      <span className="highlight-badge-seal__line2">{content.line2}</span>
    </div>
  );
}
