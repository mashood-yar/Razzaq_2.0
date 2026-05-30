"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CustomCursor } from "@/components/ui/custom-cursor";

export function CustomCursorProvider() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  useEffect(() => {
    const hoverMq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => {
      setEnabled(hoverMq.matches && !motionMq.matches);
    };

    update();
    hoverMq.addEventListener("change", update);
    motionMq.addEventListener("change", update);
    return () => {
      hoverMq.removeEventListener("change", update);
      motionMq.removeEventListener("change", update);
    };
  }, []);

  if (isAdmin || !enabled) return null;
  return <CustomCursor />;
}
