"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { MagneticWrap } from "@/components/motion/magnetic-wrap";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gold text-obsidian hover:bg-gold-light/90 shadow-sm",
        secondary:
          "border border-gold/40 bg-transparent text-gold hover:bg-gold/10",
        ghost: "hover:bg-white/5 hover:text-foreground",
        outline:
          "border border-white/20 bg-transparent text-foreground hover:bg-white/5",
        link: "text-gold underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
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
  /** Subtle magnetic hover on CTAs. Default on for default / secondary / outline (non-icon). Set false to disable. */
  magnetic?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, magnetic, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const magneticOn =
      magnetic !== false &&
      !asChild &&
      variant !== "ghost" &&
      variant !== "link" &&
      size !== "icon";

    const node = (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );

    if (!magneticOn) return node;
    return <MagneticWrap strength={0.1}>{node}</MagneticWrap>;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
