"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

/** Subtle magnetic pull toward cursor — keeps luxury restraint via low strength + soft spring. */
export function MagneticWrap({
  children,
  strength = 0.12,
}: {
  children: React.ReactElement<{ className?: string }>;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 20, mass: 0.06 });
  const sy = useSpring(y, { stiffness: 260, damping: 20, mass: 0.06 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  const childClass = children.props.className;
  const fullWidth =
    typeof childClass === "string" && /\bw-full\b/.test(childClass);

  return (
    <motion.span
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={cn(
        "will-change-transform min-w-0",
        fullWidth ? "flex w-full" : "inline-flex",
      )}
    >
      {children}
    </motion.span>
  );
}
