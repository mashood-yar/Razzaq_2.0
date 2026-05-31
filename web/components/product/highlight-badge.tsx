import { cn } from "@/lib/utils";
import {
  type HighlightLabel,
  highlightBadgeContent,
  highlightLabelText,
} from "@/lib/product-highlights";

const SEAL_MODIFIERS: Partial<Record<HighlightLabel, string>> = {
  premium: "highlight-badge-seal--premium",
  "on-sale": "highlight-badge-seal--sale",
  "new-arrival": "highlight-badge-seal--new",
};

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
        SEAL_MODIFIERS[label],
        className,
      )}
      role="status"
      aria-label={ariaLabel}
    >
      <div className="highlight-badge-seal__scallop" aria-hidden />
      <div className="highlight-badge-seal__body">
        <span className="highlight-badge-seal__line1">{content.line1}</span>
        <span className="highlight-badge-seal__line2">{content.line2}</span>
      </div>
    </div>
  );
}
