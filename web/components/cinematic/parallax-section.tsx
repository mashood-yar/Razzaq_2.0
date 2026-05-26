"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ParallaxSection({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["20%", "-20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className || ""}`}>
      <motion.div style={{ y, opacity }} className="relative h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}
