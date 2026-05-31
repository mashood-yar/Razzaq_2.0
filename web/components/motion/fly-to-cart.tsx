"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

type FlyPayload = { imageUrl: string; startRect: DOMRect };

const FlyContext = createContext<(imageUrl: string, source: HTMLElement | null) => void>(
  () => {},
);

function getCartFlyAnchor(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const anchors = document.querySelectorAll<HTMLElement>("[data-cart-fly-anchor]");
  for (const el of anchors) {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) return el;
  }
  return null;
}

export function FlyToCartProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [fly, setFly] = useState<FlyPayload | null>(null);

  useEffect(() => setMounted(true), []);

  const runFly = useCallback((imageUrl: string, source: HTMLElement | null) => {
    if (!source || typeof window === "undefined") return;
    const anchor = getCartFlyAnchor();
    if (!anchor) return;
    setFly({ imageUrl, startRect: source.getBoundingClientRect() });
  }, []);

  return (
    <FlyContext.Provider value={runFly}>
      {children}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {fly ? (
              <FlyingThumb key={`${fly.imageUrl}-${fly.startRect.top}`} fly={fly} onDone={() => setFly(null)} />
            ) : null}
          </AnimatePresence>,
          document.body,
        )}
    </FlyContext.Provider>
  );
}

function FlyingThumb({
  fly,
  onDone,
}: {
  fly: FlyPayload;
  onDone: () => void;
}) {
  const anchor = getCartFlyAnchor();
  const fr = fly.startRect;
  const tr = anchor?.getBoundingClientRect();
  const startCx = fr.left + fr.width / 2;
  const startCy = fr.top + fr.height / 2;
  const endCx = tr ? tr.left + tr.width / 2 : startCx + 120;
  const endCy = tr ? tr.top + tr.height / 2 : startCy - 80;
  const dx = endCx - startCx;
  const dy = endCy - startCy;
  const w = Math.min(Math.max(fr.width * 0.45, 44), 76);
  const h = Math.min(Math.max(fr.height * 0.45, 52), 76);

  return (
    <motion.div
      layout={false}
      initial={{ opacity: 0.92, scale: 1, x: 0, y: 0 }}
      animate={{ opacity: 0, scale: 0.28, x: dx, y: dy }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={onDone}
      style={{
        position: "fixed",
        left: startCx,
        top: startCy,
        width: w,
        height: h,
        marginLeft: -w / 2,
        marginTop: -h / 2,
        zIndex: 100000,
        pointerEvents: "none",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 18px 48px rgba(0,0,0,0.55)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- ephemeral overlay; avoids Image remote config */}
      <img src={fly.imageUrl} alt="" className="h-full w-full object-cover" draggable={false} />
    </motion.div>
  );
}

export function useFlyToCart() {
  return useContext(FlyContext);
}
