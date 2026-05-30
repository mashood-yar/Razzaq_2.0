"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

type CursorMode = "default" | "link" | "product" | "cart" | "text";

type BurstParticle = {
  id: string;
  x: number;
  y: number;
  endX: number;
  endY: number;
  size: number;
  char: string;
  color: string;
};

const OCEAN_PRIMARY = "#0F4C75";
const OCEAN_MID = "#3282B8";
const OCEAN_LIGHT = "#BBE1FA";
const GOLD = "#D4A832";
const SPARKLE_COLORS = [GOLD, OCEAN_PRIMARY, OCEAN_MID, OCEAN_LIGHT];
const BURST_CHARS = ["✦", "✧", "·"] as const;
const LERP = 0.12;
const BURST_COUNT = 8;
const MODE_DETECT_MS = 100;

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input[type="submit"], input[type="button"], label[for], select, summary';

const TEXT_SELECTOR =
  "p, h1, h2, h3, h4, h5, h6, blockquote, li, td, th, figcaption, [contenteditable='true']";

function isAddToCartButton(el: Element): boolean {
  if (!(el instanceof HTMLButtonElement)) return false;
  return /add\s+to\s+cart/i.test(el.textContent ?? "");
}

function isProductImage(el: Element): boolean {
  if (!(el instanceof HTMLImageElement)) return false;
  return Boolean(el.closest('a[href*="/products/"]'));
}

function detectCursorMode(target: Element | null): CursorMode {
  if (!target || target === document.documentElement || target === document.body) {
    return "default";
  }

  let el: Element | null = target;
  let mode: CursorMode = "default";

  while (el && el !== document.body) {
    if (isAddToCartButton(el)) return "cart";
    if (isProductImage(el)) return "product";

    if (
      el.matches(INTERACTIVE_SELECTOR) &&
      (!(el instanceof HTMLLabelElement) || el.htmlFor)
    ) {
      mode = "link";
    }

    if (
      mode === "default" &&
      el.matches(TEXT_SELECTOR) &&
      !el.closest(INTERACTIVE_SELECTOR) &&
      !el.closest("button")
    ) {
      mode = "text";
    }

    el = el.parentElement;
  }

  return mode;
}

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

export function CustomCursor() {
  const [mode, setMode] = useState<CursorMode>("default");
  const [visible, setVisible] = useState(false);
  const [bursts, setBursts] = useState<BurstParticle[]>([]);
  const [ringClickPulse, setRingClickPulse] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const ringPosRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(0);
  const mountedRef = useRef(true);
  const clickPulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastModeDetectRef = useRef(0);
  const pendingModeTargetRef = useRef<{ x: number; y: number } | null>(null);

  const removeBurst = useCallback((id: string) => {
    if (!mountedRef.current) return;
    setBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (clickPulseTimerRef.current) clearTimeout(clickPulseTimerRef.current);
    };
  }, []);

  useEffect(() => {
    let running = true;

    const applyRingPosition = (x: number, y: number) => {
      const ring = ringRef.current;
      if (!ring) return;
      ring.style.left = `${x}px`;
      ring.style.top = `${y}px`;
    };

    const tick = () => {
      if (!running) return;

      const { x: mx, y: my } = mouseRef.current;
      ringPosRef.current.x += (mx - ringPosRef.current.x) * LERP;
      ringPosRef.current.y += (my - ringPosRef.current.y) * LERP;
      applyRingPosition(ringPosRef.current.x, ringPosRef.current.y);

      const pending = pendingModeTargetRef.current;
      if (pending) {
        const now = performance.now();
        if (now - lastModeDetectRef.current >= MODE_DETECT_MS) {
          lastModeDetectRef.current = now;
          pendingModeTargetRef.current = null;
          const target = document.elementFromPoint(pending.x, pending.y);
          setMode(detectCursorMode(target));
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      if (running && document.visibilityState === "visible") {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const stopLoop = () => {
      cancelAnimationFrame(rafRef.current);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopLoop();
      } else {
        startLoop();
      }
    };

    startLoop();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      running = false;
      stopLoop();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const applyDotPosition = (x: number, y: number) => {
      const dot = dotRef.current;
      if (!dot) return;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      applyDotPosition(e.clientX, e.clientY);
      setVisible(true);
      pendingModeTargetRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    const onClick = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      const particles: BurstParticle[] = [];

      for (let i = 0; i < BURST_COUNT; i++) {
        const angle = (i / BURST_COUNT) * Math.PI * 2 + randomBetween(-0.2, 0.2);
        const distance = randomBetween(40, 80);
        particles.push({
          id: `b-${performance.now()}-${i}`,
          x,
          y,
          endX: x + Math.cos(angle) * distance,
          endY: y + Math.sin(angle) * distance,
          size: randomBetween(6, 14),
          char: pick(BURST_CHARS),
          color: pick(SPARKLE_COLORS),
        });
      }

      setBursts((prev) => [...prev, ...particles]);
      setRingClickPulse(true);
      if (clickPulseTimerRef.current) clearTimeout(clickPulseTimerRef.current);
      clickPulseTimerRef.current = setTimeout(() => setRingClickPulse(false), 400);
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("click", onClick);
    };
  }, []);

  const isLink = mode === "link";
  const isProduct = mode === "product";
  const isCart = mode === "cart";
  const isText = mode === "text";

  const ringSize = isProduct ? 56 : isLink ? 48 : 32;
  const ringBorderColor = isCart ? GOLD : isLink || isProduct ? OCEAN_MID : OCEAN_LIGHT;
  const ringBackground = isCart
    ? "rgba(212, 168, 50, 0.2)"
    : isLink
      ? "rgba(15, 76, 117, 0.2)"
      : "transparent";

  return (
    <div aria-hidden className="custom-cursor-root">
      {bursts.map((b) => (
        <div
          key={b.id}
          className="custom-cursor-burst pointer-events-none fixed z-[99999] -translate-x-1/2 -translate-y-1/2 font-semibold leading-none"
          style={
            {
              left: b.x,
              top: b.y,
              "--burst-x": `${b.endX - b.x}px`,
              "--burst-y": `${b.endY - b.y}px`,
              fontSize: b.size,
              color: b.color,
            } as CSSProperties
          }
          onAnimationEnd={() => removeBurst(b.id)}
        >
          {b.char}
        </div>
      ))}

      <div
        ref={dotRef}
        className="pointer-events-none fixed z-[99999]"
        style={{
          left: -100,
          top: -100,
          opacity: visible ? 1 : 0,
          transform: `translate(-50%, -50%) scale(${isLink ? 0 : 1})`,
          transition: "transform 180ms ease, opacity 120ms ease",
        }}
      >
        <span
          className="block rounded-full"
          style={{ width: 8, height: 8, backgroundColor: OCEAN_PRIMARY }}
        />
      </div>

      <div
        ref={ringRef}
        className="pointer-events-none fixed z-[99999] flex items-center justify-center"
        style={{
          left: -100,
          top: -100,
          opacity: visible ? (ringClickPulse ? undefined : 1) : 0,
          transform: isText
            ? "translate(-50%, -50%)"
            : `translate(-50%, -50%) scale(${ringClickPulse ? 2 : 1})`,
          width: isText ? 2 : ringSize,
          height: isText ? 24 : ringSize,
          borderRadius: isText ? 1 : "50%",
          borderWidth: isText ? 0 : 1.5,
          borderStyle: "solid",
          borderColor: ringBorderColor,
          backgroundColor: isText ? OCEAN_MID : ringBackground,
          transition:
            "width 200ms ease, height 200ms ease, border-radius 200ms ease, background-color 200ms ease, border-color 200ms ease",
          animation: ringClickPulse
            ? "custom-cursor-ring-pulse 400ms ease-out forwards"
            : undefined,
        }}
      >
        {isProduct && (
          <span
            className="text-[10px] font-semibold tracking-wide text-ocean-light"
            style={{ fontFamily: "var(--font-nunito), Nunito, sans-serif" }}
          >
            View
          </span>
        )}
      </div>
    </div>
  );
}
