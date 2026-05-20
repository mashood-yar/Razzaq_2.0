"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "rzq-luxe-intro-session";
/** Tagline ends 7200ms; 1s hold; fade 1200ms → overlay gone at 9400ms */
const TOTAL_MS = 9400;
const SKIP_FADE_MS = 600;
const SKIP_BUTTON_DELAY_MS = 1200;
const MIST_MS = 1500;
const GOLD = "#C9A84C";

/** Full-screen luxury intro; once per tab session. Pure CSS motion + canvas mist. */
export function IntroAnimation() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  /** Browser `window.setTimeout` returns `number`; Node typings use `Timeout`. */
  const autoDoneRef = useRef<number | null>(null);
  const [play, setPlay] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [skipVisible, setSkipVisible] = useState(false);
  const [skipExiting, setSkipExiting] = useState(false);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setPlay(false);
    setSkipExiting(false);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;
    if (pathname?.startsWith("/admin")) return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setPlay(true);
  }, [mounted, pathname]);

  useEffect(() => {
    if (!play) return;
    autoDoneRef.current = window.setTimeout(dismiss, TOTAL_MS);
    return () => {
      if (autoDoneRef.current) {
        clearTimeout(autoDoneRef.current);
        autoDoneRef.current = null;
      }
    };
  }, [play, dismiss]);

  useEffect(() => {
    if (!play) return;
    setSkipVisible(false);
    const t = window.setTimeout(() => setSkipVisible(true), SKIP_BUTTON_DELAY_MS);
    return () => clearTimeout(t);
  }, [play]);

  const skipExit = useCallback(() => {
    if (autoDoneRef.current) {
      clearTimeout(autoDoneRef.current);
      autoDoneRef.current = null;
    }
    setSkipExiting(true);
    window.setTimeout(dismiss, SKIP_FADE_MS);
  }, [dismiss]);

  // Canvas mist 0–MIST_MS
  useEffect(() => {
    if (!play) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const puffs: { x: number; y: number; r: number; vy: number; vx: number; a: number }[] = [];
    for (let i = 0; i < 42; i++) {
      puffs.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: 40 + Math.random() * 120,
        vy: -0.15 - Math.random() * 0.35,
        vx: (Math.random() - 0.5) * 0.2,
        a: 0.03 + Math.random() * 0.05,
      });
    }

    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      if (elapsed < MIST_MS) {
        const fadeIn = Math.min(1, elapsed / 500);
        const mistAlpha = 0.12 * fadeIn * (1 - (elapsed / MIST_MS) * 0.3);
        for (const p of puffs) {
          p.y += p.vy * 1.2;
          p.x += p.vx + Math.sin(elapsed * 0.001 + p.r) * 0.15;
          if (p.y < -p.r) p.y = window.innerHeight + p.r;
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
          g.addColorStop(0, `rgba(201, 168, 76, ${p.a * mistAlpha})`);
          g.addColorStop(0.45, `rgba(201, 168, 76, ${p.a * 0.35 * mistAlpha})`);
          g.addColorStop(1, "rgba(0,0,0,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      if (elapsed < MIST_MS + 50) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [play]);

  if (!mounted || !play) return null;

  const lettersRazzaq = ["R", "A", "Z", "Z", "A", "Q"];
  const lettersLuxe = ["L", "U", "X", "E"];

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black",
        skipExiting ? "intro-skip-exit" : "intro-fade-end",
      )}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
      />

      <div className="relative z-[1] flex flex-col items-center px-6 text-center">
        <h1 className="m-0 flex flex-nowrap justify-center font-display font-normal tracking-normal text-[clamp(2.25rem,10vw,4.5rem)] leading-none max-sm:px-1">
          {lettersRazzaq.map((ch, i) => (
            <span
              key={`r-${i}`}
              className="intro-letter-r inline-block"
              style={{
                color: GOLD,
                animationDelay: `${1600 + i * 250}ms`,
              }}
            >
              {ch}
            </span>
          ))}
        </h1>

        <h2 className="mt-[clamp(0.5rem,2vw,0.75rem)] flex justify-center gap-x-[0.06em] font-display text-[clamp(1.25rem,5.5vw,2.25rem)] font-light uppercase leading-none tracking-[0.42em] text-white sm:tracking-[0.52em]">
          {lettersLuxe.map((ch, i) => (
            <span
              key={`l-${i}`}
              className="intro-letter-l inline-block"
              style={{
                animationDelay: `${3750 + i * 250}ms`,
              }}
            >
              {ch}
            </span>
          ))}
        </h2>

        <div className="intro-gold-line mt-[clamp(1rem,3vw,1.5rem)] h-px w-[min(70vw,17.5rem)] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

        <p className="intro-tagline mt-[clamp(0.75rem,2.5vw,1.125rem)] max-w-md font-sans text-[clamp(0.5rem,1.6vw,0.6875rem)] uppercase tracking-[0.45em] text-[#C9A84C]">
          Extrait de Parfum
        </p>
      </div>

      <button
        type="button"
        onClick={skipExit}
        aria-label="Skip introduction"
        className={cn(
          "absolute bottom-8 right-6 z-[2] text-xs font-medium uppercase tracking-widest text-[#C9A84C] transition-opacity duration-300",
          skipVisible
            ? "pointer-events-auto opacity-80 hover:opacity-100"
            : "pointer-events-none opacity-0",
        )}
      >
        Skip →
      </button>
    </div>
  );
}
