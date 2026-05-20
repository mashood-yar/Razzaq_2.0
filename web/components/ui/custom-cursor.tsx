"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";

type CursorMode = "default" | "link" | "product" | "cart" | "text";

type Sparkle = {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
};

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
const SPARKLE_THROTTLE_MS = 50;
const MAX_SPARKLES = 12;
const BURST_COUNT = 8;

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

function StarShape({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden
      className="block"
    >
      <path d="M12 2l2.2 6.8H21l-5.6 4.1 2.1 6.9L12 15.8 6.5 19.8l2.1-6.9L3 8.8h6.8L12 2z" />
    </svg>
  );
}

export function CustomCursor() {
  const [dotPos, setDotPos] = useState({ x: -100, y: -100 });
  const [ringPos, setRingPos] = useState({ x: -100, y: -100 });
  const [mode, setMode] = useState<CursorMode>("default");
  const [visible, setVisible] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [bursts, setBursts] = useState<BurstParticle[]>([]);
  const [ringClickPulse, setRingClickPulse] = useState(false);

  const mouseRef = useRef({ x: -100, y: -100 });
  const ringRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(0);
  const lastSparkleRef = useRef(0);
  const sparkleColorIndex = useRef(0);
  const mountedRef = useRef(true);
  const clickPulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const removeSparkle = useCallback((id: string) => {
    if (!mountedRef.current) return;
    setSparkles((prev) => prev.filter((s) => s.id !== id));
  }, []);

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
    const tick = () => {
      const { x: mx, y: my } = mouseRef.current;
      ringRef.current.x += (mx - ringRef.current.x) * LERP;
      ringRef.current.y += (my - ringRef.current.y) * LERP;
      setRingPos({ x: ringRef.current.x, y: ringRef.current.y });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    const spawnSparkle = (x: number, y: number) => {
      const now = performance.now();
      if (now - lastSparkleRef.current < SPARKLE_THROTTLE_MS) return;
      lastSparkleRef.current = now;

      const color = SPARKLE_COLORS[sparkleColorIndex.current % SPARKLE_COLORS.length]!;
      sparkleColorIndex.current += 1;

      const sparkle: Sparkle = {
        id: `s-${now}-${Math.random().toString(36).slice(2, 8)}`,
        x: x + randomBetween(-8, 8),
        y: y + randomBetween(-8, 8),
        size: randomBetween(4, 10),
        color,
      };

      setSparkles((prev) => [...prev, sparkle].slice(-MAX_SPARKLES));
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setDotPos({ x: e.clientX, y: e.clientY });
      setVisible(true);

      const target = document.elementFromPoint(e.clientX, e.clientY);
      setMode(detectCursorMode(target));

      spawnSparkle(e.clientX, e.clientY);
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
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="custom-cursor-sparkle pointer-events-none fixed z-[99999] -translate-x-1/2 -translate-y-1/2 will-change-transform"
          style={{ left: s.x, top: s.y }}
          onAnimationEnd={() => removeSparkle(s.id)}
        >
          <StarShape size={s.size} color={s.color} />
        </div>
      ))}

      {bursts.map((b) => (
        <div
          key={b.id}
          className="custom-cursor-burst pointer-events-none fixed z-[99999] -translate-x-1/2 -translate-y-1/2 font-semibold leading-none will-change-transform"
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
        className="pointer-events-none fixed z-[99999] will-change-transform"
        style={{
          left: dotPos.x,
          top: dotPos.y,
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
        className="pointer-events-none fixed z-[99999] flex items-center justify-center will-change-transform"
        style={{
          left: ringPos.x,
          top: ringPos.y,
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
