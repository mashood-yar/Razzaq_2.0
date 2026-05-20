"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-mid/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95 hover:scale-105",
  {
    variants: {
      variant: {
        default:
          "bg-ocean-primary text-primary-foreground shadow-ocean hover:bg-ocean-mid",
        secondary:
          "border-2 border-ocean-mid bg-transparent text-ocean-light hover:bg-ocean-mid/15 hover:scale-100",
        ghost:
          "text-ocean-light hover:bg-ocean-primary/30 hover:text-foreground rounded-full hover:scale-100",
        gold:
          "bg-gold text-ocean-deep shadow-ocean hover:bg-gold-light hover:text-ocean-deep",
        outline:
          "border-2 border-border-subtle bg-transparent text-foreground hover:border-ocean-mid hover:bg-ocean-surface/60",
        link: "text-ocean-light underline-offset-4 hover:underline hover:scale-100 active:scale-100",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "h-12 px-8",
        sm: "h-10 rounded-full px-5 text-xs",
        lg: "h-14 rounded-full px-10 text-base",
        icon: "h-12 w-12 rounded-full p-0 hover:scale-100 active:scale-100",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** @deprecated No-op — kept for call-site compatibility */
  magnetic?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
