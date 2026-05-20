"use client";

import { motion, type MotionValue } from "framer-motion";
import { useMemo } from "react";

type GoldDustParticlesProps = {
  opacity: MotionValue<number>;
};

const PARTICLE_COUNT = 32;

function seededRandom(seed: number) {
  const x = Math.sin(seed * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function GoldDustParticles({ opacity }: GoldDustParticlesProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        id: i,
        left: `${8 + seededRandom(i) * 84}%`,
        top: `${12 + seededRandom(i + 50) * 76}%`,
        size: 2 + seededRandom(i + 100) * 2,
        delay: seededRandom(i + 200) * 4,
        duration: 2.5 + seededRandom(i + 300) * 2,
        drift: (seededRandom(i + 400) - 0.5) * 40,
      })),
    [],
  );

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
      style={{ opacity }}
      aria-hidden
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-[#D4A832] will-change-transform"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            animation: `cinematic-dust-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            ["--dust-drift" as string]: `${p.drift}px`,
            boxShadow: "0 0 6px 1px rgba(212, 168, 50, 0.6)",
          }}
        />
      ))}
    </motion.div>
  );
}
