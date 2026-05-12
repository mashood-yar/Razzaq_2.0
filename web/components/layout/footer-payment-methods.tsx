import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

function Chip({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  /** Fixed frame; artwork uses `h-full w-full` inside so there is no inner padding. */
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex overflow-hidden rounded border border-graphite p-0",
        className,
      )}
      aria-label={label}
      title={label}
    >
      {children}
    </span>
  );
}

/** Mastercard circles — brand colors */
function MastercardSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 32"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable={false}
    >
      <circle cx="19" cy="16" r="12" fill="#EB001B" />
      <circle cx="29" cy="16" r="12" fill="#F79E1B" fillOpacity={0.92} />
    </svg>
  );
}

/** Upaisa — simplified brand badge */
function UpaisaSvg({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 88 28"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable={false}
    >
      <rect width="88" height="28" rx="6" fill="#009639" />
      <text
        x="44"
        y="18.5"
        textAnchor="middle"
        fill="#fff"
        fontSize="11"
        fontWeight={700}
        fontFamily="system-ui, -apple-system, Segoe UI, sans-serif"
      >
        Upaisa
      </text>
    </svg>
  );
}

export function FooterPaymentMethods() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Chip label="Visa accepted" className="relative h-9 aspect-[780/500] shrink-0">
        <Image
          src="/payments/visa.png"
          alt=""
          fill
          sizes="56px"
          className="object-cover object-center"
          draggable={false}
        />
      </Chip>
      <Chip label="Mastercard accepted" className="h-9 aspect-[48/32] shrink-0">
        <MastercardSvg className="block h-full w-full" />
      </Chip>
      <Chip label="Upaisa accepted" className="h-9 aspect-[88/28] shrink-0">
        <UpaisaSvg className="block h-full w-full" />
      </Chip>
    </div>
  );
}
