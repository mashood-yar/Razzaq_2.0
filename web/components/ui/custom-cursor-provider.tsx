"use client";

import { useEffect, useState } from "react";
import { CustomCursor } from "@/components/ui/custom-cursor";

export function CustomCursorProvider() {
  const [isTouch, setIsTouch] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const update = () => setIsTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (isTouch) return null;
  return <CustomCursor />;
}
