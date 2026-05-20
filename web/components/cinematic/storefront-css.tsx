"use client";

import { useMemo } from "react";
import { motion, type MotionStyle, type MotionValue } from "framer-motion";
import { GoldBrandText } from "@/components/brand/gold-brand-text";

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function useStarField(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${seededRandom(i) * 100}%`,
        top: `${seededRandom(i + 40) * 58}%`,
        size: seededRandom(i + 80) > 0.85 ? 3 : seededRandom(i + 120) > 0.6 ? 2 : 1,
        delay: `${seededRandom(i + 160) * 5}s`,
        duration: `${2 + seededRandom(i + 200) * 4}s`,
      })),
    [count],
  );
}

type LayerMotion = {
  scale?: MotionValue<number>;
  y?: MotionValue<string | number>;
};

export type StorefrontExteriorProps = {
  parallaxY?: MotionValue<string>;
  skyLayer?: LayerMotion;
  cityLayer?: LayerMotion;
  groundLayer?: LayerMotion;
  facadeLayer?: LayerMotion;
  windowsLayer?: LayerMotion;
  doorsLayer?: LayerMotion;
  signageOpacity?: MotionStyle["opacity"];
  smoothLeftX?: MotionValue<string>;
  smoothRightX?: MotionValue<string>;
  panelScale?: MotionValue<number>;
  panelY?: MotionValue<string>;
  lightBandWidth?: MotionValue<string>;
  lightBandOpacity?: MotionValue<number>;
  isUnlatching?: boolean;
  groundReflectionOpacity?: MotionValue<number>;
  lightRayOpacity?: MotionValue<number>;
  goldGlowOpacity?: MotionValue<number>;
  goldGlowScale?: MotionValue<number>;
};

function layerStyle(layer?: LayerMotion): MotionStyle | undefined {
  if (!layer?.scale && !layer?.y) return undefined;
  return {
    scale: layer.scale,
    y: layer.y,
    willChange: "transform",
  };
}

export function StorefrontExterior({
  parallaxY,
  skyLayer,
  cityLayer,
  groundLayer,
  facadeLayer,
  windowsLayer,
  doorsLayer,
  signageOpacity,
  smoothLeftX,
  smoothRightX,
  panelScale,
  panelY,
  lightBandWidth,
  lightBandOpacity,
  isUnlatching,
  groundReflectionOpacity,
  lightRayOpacity,
  goldGlowOpacity,
  goldGlowScale,
}: StorefrontExteriorProps) {
  const stars = useStarField(80);

  return (
    <motion.div
      className="absolute inset-0 h-screen w-screen overflow-hidden will-change-transform"
      style={{ y: parallaxY }}
    >
      {/* Layer 1 — Night sky */}
      <motion.div
        className="absolute inset-x-0 top-0 h-[60%]"
        style={layerStyle(skyLayer)}
        aria-hidden
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-[#020818] via-[#061220] to-[#0A1628]"
          style={layerStyle(skyLayer)}
        />
        <div className="absolute inset-0 overflow-hidden">
          {stars.map((s) => (
            <span
              key={s.id}
              className="cinematic-star absolute rounded-full bg-white"
              style={{
                left: s.left,
                top: s.top,
                width: s.size,
                height: s.size,
                animationDelay: s.delay,
                animationDuration: s.duration,
                boxShadow:
                  s.size >= 3 ? "0 0 6px 1px rgba(255,255,255,0.4)" : undefined,
              }}
            />
          ))}
        </div>
        {/* Moon */}
        <motion.div
          className="absolute right-[12%] top-[10%] h-[72px] w-[72px] rounded-full sm:h-[88px] sm:w-[88px]"
          style={layerStyle(skyLayer)}
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#F5EDD6] via-[#E8D5A8] to-[#C4A86A]"
            style={{
              boxShadow:
                "0 0 40px 12px rgba(232,213,168,0.25), 0 0 80px 24px rgba(212,168,50,0.12), inset -8px -8px 16px rgba(0,0,0,0.15)",
            }}
          />
          <div
            className="absolute left-[18%] top-[22%] h-[14%] w-[14%] rounded-full bg-[#D4C49A]/40"
            aria-hidden
          />
          <motion.div
            className="absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(212,168,50,0.08)_0%,transparent_70%)]"
            aria-hidden
          />
        </motion.div>
      </motion.div>

      {/* Layer 2 — Distant city silhouette */}
      <motion.div
        className="absolute inset-x-0 top-[38%] h-[14%]"
        style={layerStyle(cityLayer)}
        aria-hidden
      >
        <div
          className="h-full w-full opacity-90"
          style={{
            background: "#0A1628",
            clipPath:
              "polygon(0% 100%, 0% 55%, 4% 40%, 7% 55%, 10% 35%, 14% 50%, 18% 28%, 22% 45%, 26% 32%, 30% 48%, 34% 25%, 38% 42%, 42% 30%, 46% 50%, 50% 22%, 54% 38%, 58% 28%, 62% 45%, 66% 32%, 70% 48%, 74% 26%, 78% 40%, 82% 30%, 86% 52%, 90% 35%, 94% 48%, 98% 38%, 100% 55%, 100% 100%)",
            filter: "drop-shadow(0 -4px 12px rgba(0,0,0,0.5))",
          }}
        />
        <motion.div
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#1B3A4B]/60 to-transparent"
          style={layerStyle(cityLayer)}
        />
      </motion.div>

      {/* Layer 3 — Wet cobblestone street */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[28%]"
        style={layerStyle(groundLayer)}
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #0C1419 0%, #121C24 35%, #1A242C 100%)",
          }}
        />
        {/* Cobblestone grid */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 22px 14px at 28px 18px, #1E2A34 0%, #141E28 55%, #0E161E 100%),
              radial-gradient(ellipse 22px 14px at 68px 18px, #1A2630 0%, #121C26 55%, #0C141C 100%),
              radial-gradient(ellipse 22px 14px at 48px 42px, #182430 0%, #101A24 55%, #0A1218 100%)
            `,
            backgroundSize: "56px 36px",
            backgroundPosition: "0 0, 0 0, 0 0",
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 54px, rgba(0,0,0,0.25) 54px, rgba(0,0,0,0.25) 56px), repeating-linear-gradient(0deg, transparent 0px, transparent 34px, rgba(0,0,0,0.2) 34px, rgba(0,0,0,0.2) 36px)",
          }}
        />
        {/* Wet sheen */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[55%]"
          style={{
            opacity: groundReflectionOpacity,
            background:
              "linear-gradient(180deg, rgba(180,200,220,0.08) 0%, rgba(15,25,35,0.25) 50%, transparent 100%)",
          }}
        />
        {/* Window ground reflections — scaleY(-1) */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-[2%] flex -translate-x-1/2 items-start gap-[72px]"
          style={{ opacity: groundReflectionOpacity }}
          aria-hidden
        >
          <div
            className="h-[60px] w-[140px] origin-top scale-y-[-1] opacity-50 blur-[2px]"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(212,168,50,0.45) 0%, rgba(180,130,40,0.15) 40%, transparent 75%)",
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
            }}
          />
          <div className="w-[300px]" aria-hidden />
          <div
            className="h-[60px] w-[140px] origin-top scale-y-[-1] opacity-50 blur-[2px]"
            style={{
              background:
                "radial-gradient(ellipse at 50% 100%, rgba(212,168,50,0.45) 0%, rgba(180,130,40,0.15) 40%, transparent 75%)",
              maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)",
            }}
          />
        </motion.div>
        {/* Door gold streak on ground */}
        <motion.div
          className="absolute left-1/2 top-[4%] h-[35%] w-[120px] -translate-x-1/2"
          style={{ opacity: groundReflectionOpacity }}
          aria-hidden
        >
          <div
            className="h-full w-full blur-md"
            style={{
              background:
                "linear-gradient(180deg, rgba(212,168,50,0.35) 0%, rgba(212,168,50,0.12) 40%, transparent 100%)",
            }}
          />
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-[6%] h-[28%] w-[70%] -translate-x-1/2 blur-xl"
          style={{
            opacity: groundReflectionOpacity,
            background:
              "radial-gradient(ellipse at center top, rgba(212,168,50,0.18) 0%, transparent 65%)",
          }}
        />
      </motion.div>

      {/* Golden light flood + light rays (scroll 30–45%) */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-[52%] z-[5] h-[55vmin] w-[min(90vw,520px)] -translate-x-1/2"
        style={{ opacity: goldGlowOpacity, scale: goldGlowScale }}
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 55% 70% at 50% 35%, rgba(212,168,50,0.55) 0%, rgba(212,168,50,0.18) 35%, rgba(15,25,35,0.05) 55%, transparent 72%)",
          }}
        />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-[30%] h-[42%] w-px origin-top -translate-x-1/2"
            style={{
              opacity: lightRayOpacity,
              transform: `rotate(${-28 + i * 11}deg)`,
              background:
                "linear-gradient(180deg, rgba(212,168,50,0.5) 0%, rgba(212,168,50,0.08) 70%, transparent 100%)",
              filter: "blur(0.5px)",
            }}
          />
        ))}
      </motion.div>

      {/* Layer 4–7 — Full-width building facade (55% top → bottom) */}
      <motion.div
        className="absolute left-0 right-0 top-[55%] w-screen"
        style={{ ...layerStyle(facadeLayer), transformStyle: "preserve-3d", perspective: 800 }}
      >
        {/* Stone facade — full viewport width, no rounded corners */}
        <motion.div
          className="relative w-full shadow-[0_-12px_80px_rgba(0,0,0,0.65),0_20px_60px_rgba(0,0,0,0.5)]"
          style={{
            ...layerStyle(facadeLayer),
            background:
              "repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0px, rgba(0,0,0,0.08) 1px, transparent 1px, transparent 48px), repeating-linear-gradient(0deg, #0D1B2A 0px, #0D1B2A 32px, #0F2235 32px, #0F2235 64px), linear-gradient(180deg, #152A3C 0%, #0D1B2A 45%, #0A1520 100%)",
          }}
        >
          {/* Cornice */}
          <div
            className="absolute -top-[10px] left-0 right-0 h-[14px]"
            style={{
              background:
                "linear-gradient(180deg, #243D52 0%, #1B3344 40%, #0D1B2A 100%)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
            aria-hidden
          >
            <div
              className="absolute inset-x-0 bottom-0 h-[3px]"
              style={{
                background:
                  "repeating-linear-gradient(90deg, #D4A832 0px, #D4A832 8px, #8B6914 8px, #8B6914 16px)",
                opacity: 0.35,
              }}
            />
          </div>

          {/* Pilasters */}
          <div
            className="absolute bottom-0 left-[6%] top-0 w-[28px]"
            style={{
              background:
                "linear-gradient(90deg, #0A1520 0%, #122436 40%, #0A1520 100%)",
              boxShadow: "inset -2px 0 6px rgba(0,0,0,0.4), inset 2px 0 4px rgba(255,255,255,0.03)",
            }}
            aria-hidden
          />
          <div
            className="absolute bottom-0 right-[6%] top-0 w-[28px]"
            style={{
              background:
                "linear-gradient(90deg, #0A1520 0%, #122436 40%, #0A1520 100%)",
              boxShadow: "inset -2px 0 4px rgba(255,255,255,0.03), inset 2px 0 6px rgba(0,0,0,0.4)",
            }}
            aria-hidden
          />

          {/* Signage + sconces */}
          <motion.div
            className="relative z-20 flex justify-center pb-4 pt-10"
            style={{ opacity: signageOpacity }}
          >
            <div className="flex items-start gap-8 sm:gap-14">
              <SconceLight side="left" />
              <BrassSign />
              <SconceLight side="right" />
            </div>
          </motion.div>

          {/* Windows + entrance row */}
          <motion.div
            className="relative z-10 flex items-end justify-center gap-6 px-4 pb-2 sm:gap-10"
            style={layerStyle(windowsLayer)}
          >
            <WindowPanel side="left" />
            <EntranceBlock
              doorsLayer={doorsLayer}
              smoothLeftX={smoothLeftX}
              smoothRightX={smoothRightX}
              panelScale={panelScale}
              panelY={panelY}
              lightBandWidth={lightBandWidth}
              lightBandOpacity={lightBandOpacity}
              isUnlatching={isUnlatching}
            />
            <WindowPanel side="right" />
          </motion.div>

          {/* Welcome mat + address */}
          <div className="relative z-10 mx-auto flex max-w-[920px] flex-col items-center pb-6 pt-2">
            <div
              className="relative h-[18px] w-[300px]"
              style={{
                background:
                  "repeating-linear-gradient(90deg, #1A0F0A 0px, #1A0F0A 6px, #2C1810 6px, #2C1810 12px), linear-gradient(180deg, #2C1810 0%, #1A0F0A 100%)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,168,50,0.15)",
                border: "1px solid rgba(212,168,50,0.2)",
              }}
              aria-label="Welcome mat"
            >
              <span
                className="absolute inset-0 flex items-center justify-center font-body text-[8px] tracking-[0.35em] text-[#D4A832]/50"
                aria-hidden
              >
                WELCOME
              </span>
            </div>
            <div
              className="mt-3 flex h-[36px] w-[36px] items-center justify-center border border-[#D4A832]/30 bg-[#0D1B2A]/80 font-display text-sm font-semibold text-[#D4A832]"
              style={{
                boxShadow: "0 0 12px rgba(212,168,50,0.15), inset 0 0 8px rgba(0,0,0,0.4)",
              }}
              aria-label="Address number 01"
            >
              01
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Layer 8 — Fog, vignette */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[6] h-[35%] bg-gradient-to-t from-[#0F1923]/95 via-[#0F1923]/40 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[7] bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(2,8,24,0.65)_100%)]"
        aria-hidden
      />
    </motion.div>
  );
}

function BrassSign() {
  return (
    <div
      className="relative flex h-[70px] w-[400px] max-w-[72vw] flex-col items-center justify-center"
      style={{
        background:
          "linear-gradient(180deg, #3D3020 0%, #2A2218 30%, #1A1510 70%, #2A2218 100%)",
        border: "2px solid #8B6914",
        boxShadow:
          "0 4px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,168,50,0.3), inset 0 -2px 6px rgba(0,0,0,0.5), 0 0 30px rgba(212,168,50,0.12)",
      }}
      aria-hidden
    >
      {/* Corner screws */}
      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        <div
          key={pos}
          className={`absolute h-[6px] w-[6px] rounded-full bg-gradient-to-br from-[#D4A832] to-[#5C4A1A] ${
            pos === "tl"
              ? "left-2 top-2"
              : pos === "tr"
                ? "right-2 top-2"
                : pos === "bl"
                  ? "bottom-2 left-2"
                  : "bottom-2 right-2"
          }`}
          style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5), 0 0 4px rgba(212,168,50,0.3)" }}
        />
      ))}
      <p
        className="font-display text-xl font-semibold tracking-[0.28em] text-[#D4A832] sm:text-2xl"
        style={{
          fontFamily: "var(--font-fraunces, Fraunces, Georgia, serif)",
          textShadow: "0 0 20px rgba(212,168,50,0.4), 0 2px 6px rgba(0,0,0,0.8)",
        }}
      >
        RAZZAQ LUXE
      </p>
      <p
        className="mt-0.5 font-body text-[9px] tracking-[0.22em] text-[#B8961E]/80 sm:text-[10px]"
        style={{ textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}
      >
        FRAGRANCE &amp; LIFESTYLE
      </p>
    </div>
  );
}

function SconceLight({ side }: { side: "left" | "right" }) {
  return (
    <div className="relative hidden h-[100px] w-[60px] sm:block" aria-hidden>
      {/* Wall glow */}
      <div
        className="absolute left-1/2 top-[18px] h-[50px] w-[40px] -translate-x-1/2 rounded-full blur-md"
        style={{
          background: "radial-gradient(ellipse, rgba(212,168,50,0.2) 0%, transparent 70%)",
        }}
      />
      {/* L-bracket arm */}
      <div
        className={`absolute top-[14px] h-[3px] w-[18px] bg-gradient-to-r from-[#8B6914] to-[#D4A832] ${
          side === "left" ? "left-[8px]" : "right-[8px]"
        }`}
        style={{ boxShadow: "0 0 6px rgba(212,168,50,0.4)" }}
      />
      <div
        className={`absolute top-[14px] h-[14px] w-[3px] bg-gradient-to-b from-[#D4A832] to-[#5C4A1A] ${
          side === "left" ? "left-[8px]" : "right-[8px]"
        }`}
      />
      {/* Hexagonal lantern shade */}
      <div
        className="absolute left-1/2 top-[26px] -translate-x-1/2"
        style={{
          width: 28,
          height: 32,
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          background: "linear-gradient(180deg, #3D3020 0%, #1A1510 60%, #2A2218 100%)",
          border: "1px solid #8B6914",
          boxShadow: "0 0 16px rgba(212,168,50,0.35), inset 0 0 12px rgba(212,168,50,0.15)",
        }}
      >
        {/* Bulb dot */}
        <div
          className="absolute left-1/2 top-[55%] h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5EDD6]"
          style={{ boxShadow: "0 0 10px 3px rgba(245,237,214,0.8), 0 0 20px 6px rgba(212,168,50,0.5)" }}
        />
      </div>
      {/* Downward light cone */}
      <div
        className="absolute left-1/2 top-[58px] h-[42px] w-[48px] -translate-x-1/2"
        style={{
          background:
            "conic-gradient(from 180deg at 50% 0%, transparent 120deg, rgba(212,168,50,0.25) 160deg, rgba(212,168,50,0.12) 200deg, transparent 240deg)",
          filter: "blur(2px)",
        }}
      />
      <div
        className="absolute left-1/2 top-[62px] h-[30px] w-[32px] -translate-x-1/2 blur-sm"
        style={{
          background: "radial-gradient(ellipse at top, rgba(212,168,50,0.3) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

function WindowPanel({ side }: { side: "left" | "right" }) {
  return (
    <div className="relative" style={{ width: 280, height: 380, maxWidth: "38vw", maxHeight: "52vw" }}>
      {/* Outer glow */}
      <div
        className="absolute -inset-3 rounded-sm blur-xl"
        style={{
          background: "radial-gradient(ellipse at center, rgba(212,168,50,0.2) 0%, transparent 70%)",
        }}
        aria-hidden
      />
      {/* Dark brass/gold frame */}
      <div
        className="absolute inset-0"
        style={{
          border: "4px solid",
          borderImage: "linear-gradient(180deg, #8B6914 0%, #D4A832 30%, #5C4A1A 70%, #8B6914 100%) 1",
          boxShadow:
            "0 0 32px rgba(212,168,50,0.25), 0 0 8px rgba(212,168,50,0.15), inset 0 0 0 2px rgba(92,74,26,0.6)",
        }}
      >
        {/* Amber radial glass */}
        <div
          className="absolute inset-[4px]"
          style={{
            background:
              "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(212,168,50,0.55) 0%, rgba(180,130,40,0.25) 35%, rgba(80,55,20,0.15) 60%, rgba(10,20,30,0.85) 100%)",
            boxShadow: "inset 0 0 40px rgba(212,168,50,0.2), inset 0 -20px 30px rgba(0,0,0,0.5)",
          }}
        >
          {/* 4-pane cross dividers */}
          <div className="absolute inset-0" aria-hidden>
            <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-gradient-to-b from-[#5C4A1A] via-[#8B6914] to-[#5C4A1A]" />
            <div className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 bg-gradient-to-r from-[#5C4A1A] via-[#8B6914] to-[#5C4A1A]" />
          </div>

          {/* Product/shelf silhouettes — dark navy shapes */}
          <div className="absolute inset-x-[12%] bottom-[14%] top-[18%]" aria-hidden>
            {/* Shelf */}
            <div
              className="absolute left-0 right-0 top-[38%] h-[3px] bg-[#0A1628]/90"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
            />
            <div
              className="absolute left-0 right-0 top-[68%] h-[3px] bg-[#0A1628]/90"
              style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
            />
            {/* Bottle silhouettes */}
            <div
              className={`absolute top-[22%] h-[14%] w-[12%] rounded-t-sm bg-[#0A1628] ${side === "left" ? "left-[18%]" : "right-[18%]"}`}
              style={{ clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" }}
            />
            <div
              className="absolute left-[38%] top-[20%] h-[16%] w-[10%] rounded-t-full bg-[#0A1628]"
            />
            <div
              className={`absolute top-[22%] h-[14%] w-[12%] rounded-t-sm bg-[#0A1628] ${side === "left" ? "right-[18%]" : "left-[18%]"}`}
              style={{ clipPath: "polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)" }}
            />
            {/* Box products on lower shelf */}
            <div className="absolute bottom-[8%] left-[15%] h-[18%] w-[22%] bg-[#0A1628]/95" />
            <div className="absolute bottom-[8%] left-[42%] h-[20%] w-[16%] bg-[#0A1628]/95" />
            <div className="absolute bottom-[8%] right-[15%] h-[16%] w-[20%] bg-[#0A1628]/95" />
          </div>
        </div>
      </div>

      {/* Ground reflection — blurred 80px glow below window */}
      <div
        className="absolute left-1/2 top-full h-[80px] w-[90%] -translate-x-1/2 scale-y-[-1] opacity-60 blur-[12px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(212,168,50,0.4) 0%, rgba(180,130,40,0.15) 45%, transparent 75%)",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)",
        }}
        aria-hidden
      />
    </div>
  );
}

type EntranceBlockProps = {
  doorsLayer?: LayerMotion;
  smoothLeftX?: MotionValue<string>;
  smoothRightX?: MotionValue<string>;
  panelScale?: MotionValue<number>;
  panelY?: MotionValue<string>;
  lightBandWidth?: MotionValue<string>;
  lightBandOpacity?: MotionValue<number>;
  isUnlatching?: boolean;
};

function EntranceBlock({
  doorsLayer,
  smoothLeftX,
  smoothRightX,
  panelScale,
  panelY,
  lightBandWidth,
  lightBandOpacity,
  isUnlatching,
}: EntranceBlockProps) {
  return (
    <motion.div
      className="relative flex flex-col items-center"
      style={layerStyle(doorsLayer)}
    >
      {/* Entrance canopy */}
      <div
        className="relative mb-0 h-[12px] w-[340px] max-w-[46vw]"
        style={{
          background: "linear-gradient(180deg, #1B3344 0%, #0D1B2A 100%)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          clipPath: "polygon(0 0, 100% 0, 96% 100%, 4% 100%)",
        }}
        aria-hidden
      />

      {/* Transom arched window */}
      <div
        className="relative z-10 -mb-[2px] h-[48px] w-[300px] max-w-[42vw] overflow-hidden"
        style={{
          clipPath: "ellipse(50% 100% at 50% 100%)",
          border: "3px solid #8B6914",
          borderBottom: "none",
          background:
            "radial-gradient(ellipse at 50% 80%, rgba(212,168,50,0.2) 0%, rgba(10,20,30,0.9) 70%)",
          boxShadow: "inset 0 0 24px rgba(212,168,50,0.12), 0 0 16px rgba(212,168,50,0.08)",
        }}
        aria-hidden
      >
        <div className="absolute inset-x-[20%] top-[30%] h-[2px] bg-[#8B6914]/40" />
      </div>

      {/* Gold ornate door frame */}
      <div
        className="relative p-[5px]"
        style={{
          background:
            "linear-gradient(180deg, #D4A832 0%, #8B6914 25%, #D4A832 50%, #5C4A1A 75%, #8B6914 100%)",
          boxShadow:
            "0 0 48px rgba(212,168,50,0.25), inset 0 0 20px rgba(0,0,0,0.3), 0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        {/* Arch above doors */}
        <div
          className="absolute -top-[18px] left-1/2 h-[24px] w-[calc(100%+10px)] -translate-x-1/2"
          style={{
            border: "4px solid #D4A832",
            borderBottom: "none",
            borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
            background: "linear-gradient(180deg, rgba(212,168,50,0.15) 0%, transparent 100%)",
            boxShadow: "0 0 20px rgba(212,168,50,0.2)",
          }}
          aria-hidden
        />

        <div
          className="relative overflow-hidden bg-[#0A1014]"
          style={{ width: 280, height: 320, maxWidth: "38vw", maxHeight: "44vw" }}
        >
          {/* Inner warm amber glow (visible when shutters open) */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(212,168,50,0.45) 0%, rgba(180,130,40,0.2) 40%, rgba(44,24,16,0.3) 70%, #0A1014 100%)",
            }}
            aria-hidden
          />

          {/* Light band behind panels */}
          <motion.div
            className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[120%] -translate-x-1/2 -translate-y-1/2"
            style={{
              width: lightBandWidth,
              opacity: lightBandOpacity,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(212,168,50,0.15) 35%, rgba(245,237,214,0.85) 50%, rgba(212,168,50,0.15) 65%, transparent 100%)",
              filter: "blur(8px)",
            }}
            aria-hidden
          />

          {/* Shutter container — bottom 75% of entrance */}
          <div className="absolute inset-x-0 bottom-0 z-10 h-[75%] overflow-hidden">
            {/* Center seam golden light strip */}
            <div
              className="pointer-events-none absolute inset-y-0 left-1/2 z-20 w-[3px] -translate-x-1/2"
              style={{
                background:
                  "linear-gradient(180deg, rgba(212,168,50,0.2) 0%, rgba(245,237,214,0.9) 45%, rgba(212,168,50,0.9) 55%, rgba(212,168,50,0.2) 100%)",
                boxShadow: "0 0 16px rgba(212,168,50,0.7), 0 0 32px rgba(212,168,50,0.35)",
              }}
              aria-hidden
            />

            {/* Left sliding panel */}
            <motion.div
              className="absolute inset-y-0 left-0 z-10 w-1/2 will-change-transform"
              style={{
                x: smoothLeftX,
                scale: panelScale,
                y: panelY,
                animation: isUnlatching ? "panelUnlatch 0.4s ease-in-out" : undefined,
              }}
            >
              <ShutterPanel side="left" />
            </motion.div>

            {/* Right sliding panel */}
            <motion.div
              className="absolute inset-y-0 right-0 z-10 w-1/2 will-change-transform"
              style={{
                x: smoothRightX,
                scale: panelScale,
                y: panelY,
                animation: isUnlatching ? "panelUnlatch 0.4s ease-in-out" : undefined,
              }}
            >
              <ShutterPanel side="right" />
            </motion.div>
          </div>
        </div>

        {/* Bottom light leak under door */}
        <div
          className="absolute -bottom-[2px] left-[8%] right-[8%] h-[4px] blur-sm"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(212,168,50,0.5) 30%, rgba(245,237,214,0.6) 50%, rgba(212,168,50,0.5) 70%, transparent)",
          }}
          aria-hidden
        />
      </div>

      {/* Stone threshold step */}
      <div
        className="relative -mt-[1px] h-[14px] w-[320px] max-w-[44vw]"
        style={{
          background:
            "linear-gradient(180deg, #243D52 0%, #1B3344 30%, #0D1B2A 70%, #0A1520 100%)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
        aria-hidden
      >
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent, rgba(212,168,50,0.3) 50%, transparent)" }}
        />
      </div>
    </motion.div>
  );
}

function ShutterPanel({ side }: { side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div className="relative h-full w-full">
      {/* Mahogany shutter face with slat lines */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, #4A2E20 0%, #3D2418 25%, #2C1810 60%, #1A0F0A 100%)",
          boxShadow: isLeft
            ? "inset -8px 0 20px rgba(0,0,0,0.5)"
            : "inset 8px 0 20px rgba(0,0,0,0.5)",
        }}
      >
        {/* Horizontal slat lines (20) */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage:
              "repeating-linear-gradient(180deg, transparent 0px, transparent 10px, rgba(0,0,0,0.35) 10px, rgba(0,0,0,0.35) 11px, rgba(255,255,255,0.03) 11px, rgba(255,255,255,0.03) 12px)",
            backgroundSize: "100% 12px",
          }}
          aria-hidden
        />
        {/* Vertical slat lines (8) */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 16px, rgba(0,0,0,0.3) 16px, rgba(0,0,0,0.3) 17.5px)",
            backgroundSize: "17.5px 100%",
          }}
          aria-hidden
        />

        {/* Gold edge trim on inner edge */}
        <div
          className={`absolute inset-y-[4%] w-[4px] ${isLeft ? "right-0" : "left-0"}`}
          style={{
            background:
              "linear-gradient(180deg, rgba(212,168,50,0.4) 0%, #D4A832 20%, #F5EDD6 50%, #D4A832 80%, rgba(212,168,50,0.4) 100%)",
            boxShadow: isLeft
              ? "0 0 12px rgba(212,168,50,0.7), 2px 0 8px rgba(212,168,50,0.4)"
              : "0 0 12px rgba(212,168,50,0.7), -2px 0 8px rgba(212,168,50,0.4)",
          }}
          aria-hidden
        />

        {/* Vertical RAZZAQ LUXE text */}
        <div
          className={`absolute inset-y-0 flex items-center ${isLeft ? "right-[18%]" : "left-[18%]"}`}
          aria-hidden
        >
          <span
            className="font-display text-[9px] font-semibold tracking-[0.35em] text-[#D4A832]/75 sm:text-[10px]"
            style={{
              writingMode: "vertical-rl",
              textOrientation: "mixed",
              transform: isLeft ? "rotate(180deg)" : undefined,
              textShadow: "0 0 10px rgba(212,168,50,0.35), 0 1px 4px rgba(0,0,0,0.8)",
            }}
          >
            RAZZAQ LUXE
          </span>
        </div>
      </div>
    </div>
  );
}

type StorefrontInteriorProps = {
  style?: MotionStyle;
  filter?: MotionStyle["filter"];
};

export function StorefrontInterior({ style, filter }: StorefrontInteriorProps) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center will-change-transform"
      style={{ ...style, filter }}
    >
      {/* Ambient base */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0A1014] via-[#1A0F0A] to-[#0D1B2A]"
        aria-hidden
      />

      {/* Wood paneling back wall */}
      <div
        className="absolute inset-x-0 top-0 h-[55%]"
        style={{
          background:
            "repeating-linear-gradient(90deg, #1A0F0A 0px, #1A0F0A 48px, #2C1810 48px, #2C1810 50px), linear-gradient(180deg, #2C1810 0%, #1A0F0A 70%, #0D1B2A 100%)",
          boxShadow: "inset 0 -40px 80px rgba(0,0,0,0.5)",
        }}
        aria-hidden
      />

      {/* Ceiling spotlights */}
      <div className="absolute inset-x-0 top-0 flex justify-around px-[8%] pt-2" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="relative flex flex-col items-center">
            <motion.div className="h-3 w-8 rounded-full bg-[#1B262C] shadow-[0_2px_8px_rgba(0,0,0,0.6)]" />
            <div
              className="mt-1 h-24 w-px origin-top"
              style={{
                background:
                  "linear-gradient(180deg, rgba(212,168,50,0.35) 0%, rgba(212,168,50,0.05) 80%, transparent 100%)",
              }}
            />
            <div
              className="h-16 w-32 -translate-y-2 rounded-[50%] blur-lg"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(212,168,50,0.2) 0%, transparent 70%)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Distant blurred shelves */}
      <div className="absolute inset-x-[10%] top-[22%] flex justify-between opacity-40 blur-[3px]" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-28 w-[22%] rounded-sm border border-[#D4A832]/10 bg-gradient-to-b from-[#16213E]/60 to-[#0A1628]/80"
            style={{ boxShadow: "inset 0 0 20px rgba(0,0,0,0.4)" }}
          />
        ))}
      </div>

      {/* Reflective floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[48%]"
        style={{
          background:
            "linear-gradient(180deg, #0D1B2A 0%, #122436 30%, #1B262C 100%)",
        }}
        aria-hidden
      >
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "linear-gradient(180deg, rgba(212,168,50,0.06) 0%, transparent 30%), repeating-linear-gradient(90deg, transparent 0px, transparent 80px, rgba(255,255,255,0.02) 80px, rgba(255,255,255,0.02) 82px)",
          }}
        />
        {/* Ambient light pools */}
        <div
          className="absolute left-[20%] top-[30%] h-24 w-40 rounded-[50%] blur-2xl"
          style={{ background: "radial-gradient(ellipse, rgba(212,168,50,0.12) 0%, transparent 70%)" }}
        />
        <div
          className="absolute right-[18%] top-[40%] h-20 w-36 rounded-[50%] blur-2xl"
          style={{ background: "radial-gradient(ellipse, rgba(212,168,50,0.1) 0%, transparent 70%)" }}
        />
      </div>

      {/* Display room copy */}
      <motion.div className="relative z-10 mx-auto w-[min(94vw,900px)] px-4 pt-[14vh]">
        <p className="mb-6 text-center font-display text-2xl text-[#F3F4F1] sm:text-3xl">
          The <span className="text-[#D4A832]">Collection</span>
        </p>
        <p className="mb-10 text-center font-body text-sm text-[#8BA3B5]">
          <GoldBrandText text="Curated fragrances — crafted for the discerning." />
        </p>

        {/* Mahogany display table */}
        <div className="relative mx-auto max-w-3xl">
          <div
            className="absolute -inset-x-10 -bottom-6 h-10 rounded-[50%] bg-black/60 blur-2xl"
            aria-hidden
          />
          <div
            className="relative rounded-lg border border-[#D4A832]/35 px-6 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(212,168,50,0.2)]"
            style={{
              background:
                "linear-gradient(180deg, #2C1810 0%, #1A0F0A 55%, #120A06 100%)",
            }}
          >
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#D4A832]/50 to-transparent" />
            <motion.div id="cinematic-product-stage" className="min-h-[280px]" />
          </div>
        </div>
      </motion.div>

      {/* Side vignettes */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[18%] bg-gradient-to-r from-black/70 to-transparent"
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute inset-y-0 right-0 w-[18%] bg-gradient-to-l from-black/70 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(2,8,16,0.8)_100%)]"
        aria-hidden
      />
    </motion.div>
  );
}
