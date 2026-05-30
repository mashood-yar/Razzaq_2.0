"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-[11px] font-medium uppercase tracking-[0.2em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "min-h-[52px] bg-gold-warm px-10 text-noir hover:bg-gold-bright",
        secondary:
          "min-h-[52px] border border-noir-muted bg-transparent px-10 text-text-secondary hover:border-gold-warm hover:text-foreground",
        ghost:
          "rounded-none text-text-secondary hover:bg-accent hover:text-foreground",
        gold:
          "min-h-[52px] bg-gold-warm px-10 text-noir hover:bg-gold-bright",
        outline:
          "min-h-[52px] border border-noir-muted bg-transparent px-10 text-foreground hover:border-gold-warm hover:text-gold-bright",
        link: "normal-case tracking-normal text-gold-bright underline-offset-4 hover:underline active:scale-100",
        "link-ghost":
          "min-h-11 gap-1.5 rounded-none border-0 border-b border-muted-foreground bg-transparent px-0 pb-0.5 text-[11px] font-medium uppercase tracking-[0.15em] text-text-secondary hover:border-gold-warm hover:bg-transparent hover:text-gold-bright active:scale-100 [&_svg]:size-3",
        destructive:
          "min-h-[52px] bg-destructive px-10 text-destructive-foreground hover:bg-destructive/90",
      },
      size: {
        default: "min-h-[52px] px-10",
        sm: "min-h-10 px-5 text-[10px]",
        lg: "min-h-14 px-12 text-xs",
        icon: "h-12 w-12 p-0 normal-case tracking-normal",
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
