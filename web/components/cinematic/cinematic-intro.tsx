"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import type { LegacyProduct } from "@/lib/products";
import { GoldDustParticles } from "@/components/cinematic/gold-dust-particles";
import { CinematicProductCard } from "@/components/cinematic/cinematic-product-card";
import {
  StorefrontExterior,
  StorefrontInterior,
} from "@/components/cinematic/storefront-css";

type CinematicIntroProps = {
  products: LegacyProduct[];
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setIsMobile(mq.matches || reduced.matches);
    update();
    mq.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      mq.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);

  return isMobile;
}

function CinematicIntroPlaceholder() {
  return (
    <p className="font-display text-2xl text-[#D4A832] animate-pulse">RAZZAQ LUXE</p>
  );
}

function ScrollMouseHint() {
  return (
    <motion.div className="flex flex-col items-center gap-3" aria-hidden>
      <span className="font-body text-[10px] font-medium uppercase tracking-[0.35em] text-[#D4A832]/70">
        Scroll to enter
      </span>
      <motion.div
        className="relative flex h-10 w-6 items-start justify-center rounded-full border-2 border-[#D4A832]/70 pt-1.5"
        style={{ opacity: 0.7 }}
      >
        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-[#D4A832]"
          animate={{ y: [0, 14, 0], opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
      <motion.div
        className="h-6 w-px bg-gradient-to-b from-[#D4A832]/70 to-transparent"
        animate={{ opacity: [0.35, 0.85, 0.35], scaleY: [0.85, 1.1, 0.85] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

function CinematicIntroContent({ products }: CinematicIntroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isUnlatching, setIsUnlatching] = useState(false);
  const unlatchTriggered = useRef(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { scrollYProgress } = useScroll(
    isMounted && containerRef.current
      ? { target: containerRef, offset: ["start start", "end end"] }
      : {},
  );

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.28 && !unlatchTriggered.current) {
      unlatchTriggered.current = true;
      setIsUnlatching(true);
      window.setTimeout(() => setIsUnlatching(false), 400);
    }
  });

  // Parallax dolly — layers scale 0–30%
  const parallaxY = useTransform(smoothProgress, [0, 0.3], ["0vh", "-8vh"]);
  const skyScale = useTransform(smoothProgress, [0, 0.3], [1, 1.05]);
  const cityScale = useTransform(smoothProgress, [0, 0.3], [1, 1.1]);
  const groundScale = useTransform(smoothProgress, [0, 0.3], [1, 1.12]);
  const facadeScale = useTransform(smoothProgress, [0, 0.3], [1, 1.3]);
  const windowsScale = useTransform(smoothProgress, [0, 0.3], [1, 1.4]);
  const doorsScale = useTransform(smoothProgress, [0, 0.3], [1, 1.8]);

  const signageOpacity = useTransform(smoothProgress, [0.15, 0.28], [1, 0]);

  // Scene 3: sliding shutter panels
  const leftPanelX = useTransform(smoothProgress, [0.3, 0.55], ["0%", "-100%"]);
  const rightPanelX = useTransform(smoothProgress, [0.3, 0.55], ["0%", "100%"]);
  const panelScale = useTransform(smoothProgress, [0.3, 0.55], [1, 0.98]);
  const panelY = useTransform(smoothProgress, [0.3, 0.55], ["0%", "-5%"]);

  const smoothLeftX = useSpring(leftPanelX, { stiffness: 60, damping: 25, restDelta: 0.001 });
  const smoothRightX = useSpring(rightPanelX, { stiffness: 60, damping: 25, restDelta: 0.001 });

  const goldGlowOpacity = useTransform(smoothProgress, [0.35, 0.45, 0.6], [0, 0.7, 0.2]);
  const lightBandWidth = useTransform(smoothProgress, [0.3, 0.55], ["0px", "100vw"]);
  const lightBandOpacity = useTransform(
    smoothProgress,
    [0.3, 0.4, 0.55, 0.65],
    [0, 0.8, 0.6, 0],
  );

  const goldGlowScale = useTransform(smoothProgress, [0.15, 0.45], [0.8, 1.4]);
  const groundReflectionOpacity = useTransform(smoothProgress, [0.28, 0.45], [0.35, 1]);
  const lightRayOpacity = useTransform(smoothProgress, [0.3, 0.42, 0.52], [0, 0.75, 0]);

  // Scene 4: crossfade exterior → interior
  const exteriorOpacity = useTransform(smoothProgress, [0.42, 0.55], [1, 0]);
  const interiorOpacity = useTransform(smoothProgress, [0.45, 0.6], [0, 1]);
  const interiorBlurPx = useTransform(smoothProgress, [0.45, 0.58], [10, 0]);
  const interiorFilter = useTransform(interiorBlurPx, (v) => `blur(${v}px)`);

  // Scene 5: products
  const productsOpacity = useTransform(smoothProgress, [0.58, 0.65], [0, 1]);
  const product1Scale = useTransform(smoothProgress, [0.6, 0.72], [0.3, 1]);
  const product2Scale = useTransform(smoothProgress, [0.64, 0.76], [0.3, 1]);
  const product3Scale = useTransform(smoothProgress, [0.68, 0.8], [0.3, 1]);

  // Scene 6: extra products + fade out
  const extraProductsOpacity = useTransform(smoothProgress, [0.78, 0.88], [0, 1]);
  const cinematicFadeOut = useTransform(smoothProgress, [0.88, 1], [1, 0]);

  // Particles scenes 3–5
  const particlesOpacity = useTransform(
    smoothProgress,
    [0.3, 0.35, 0.58, 0.68],
    [0, 1, 1, 0],
  );

  // Scroll hint & skip
  const scrollHintOpacity = useTransform(smoothProgress, [0, 0.1, 0.15], [1, 1, 0]);
  const skipOpacity = useTransform(smoothProgress, [0, 0.05, 0.88, 0.95], [0, 1, 1, 0]);
  const cinematicPointerEvents = useTransform(cinematicFadeOut, (v) =>
    v < 0.05 ? "none" : "auto",
  );

  const skip = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const top = el.offsetTop + el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, []);

  const featured = products.slice(0, 3);
  const extras = products.slice(3, 6);

  if (isMobile === null || isMobile) return null;

  return (
    <div ref={containerRef} className="relative" style={{ height: "600vh" }}>
      <motion.div
        className="sticky top-0 z-40 h-screen w-screen overflow-hidden bg-[#020818]"
        style={
          isMounted
            ? { opacity: cinematicFadeOut, pointerEvents: cinematicPointerEvents }
            : undefined
        }
      >
        {!isMounted ? (
          <motion.div className="flex h-full w-full items-center justify-center" aria-hidden>
            <CinematicIntroPlaceholder />
          </motion.div>
        ) : (
          <>
            {/* Exterior scene */}
            <motion.div className="absolute inset-0 z-10" style={{ opacity: exteriorOpacity }}>
              <StorefrontExterior
                parallaxY={parallaxY}
                skyLayer={{ scale: skyScale }}
                cityLayer={{ scale: cityScale }}
                groundLayer={{ scale: groundScale }}
                facadeLayer={{ scale: facadeScale }}
                windowsLayer={{ scale: windowsScale }}
                doorsLayer={{ scale: doorsScale }}
                signageOpacity={signageOpacity}
                smoothLeftX={smoothLeftX}
                smoothRightX={smoothRightX}
                panelScale={panelScale}
                panelY={panelY}
                lightBandWidth={lightBandWidth}
                lightBandOpacity={lightBandOpacity}
                isUnlatching={isUnlatching}
                groundReflectionOpacity={groundReflectionOpacity}
                lightRayOpacity={lightRayOpacity}
                goldGlowOpacity={goldGlowOpacity}
                goldGlowScale={goldGlowScale}
              />
            </motion.div>

            {/* Interior scene */}
            <StorefrontInterior
              style={{ opacity: interiorOpacity }}
              filter={interiorFilter}
            />

            {/* Gold dust */}
            <GoldDustParticles opacity={particlesOpacity} />

            {/* Product cards on display table */}
            <motion.div
              className="pointer-events-auto absolute inset-0 z-20 flex items-center justify-center pt-[20vh]"
              style={{ opacity: productsOpacity }}
            >
              <div className="relative mx-auto w-[min(94vw,780px)] px-4">
                <div
                  className="absolute -inset-x-6 -bottom-4 h-8 rounded-[50%] bg-black/50 blur-xl"
                  aria-hidden
                />
                <div
                  className="relative rounded-lg border border-[#D4A832]/30 px-4 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:px-6 sm:py-10"
                  style={{
                    background:
                      "linear-gradient(180deg, #2C1810 0%, #1A0F0A 50%, #120A06 100%)",
                  }}
                >
                  <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#D4A832]/45 to-transparent" />
                  <div className="mx-auto grid w-full grid-cols-3 gap-3 sm:gap-5">
                    {featured[0] && (
                      <CinematicProductCard product={featured[0]} scale={product1Scale} />
                    )}
                    {featured[1] && (
                      <CinematicProductCard
                        product={featured[1]}
                        scale={product2Scale}
                        className="mt-8"
                      />
                    )}
                    {featured[2] && (
                      <CinematicProductCard product={featured[2]} scale={product3Scale} />
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Scene 6 extra products */}
            {extras.length > 0 && (
              <motion.div
                className="pointer-events-auto absolute inset-x-0 bottom-[12vh] z-20 flex justify-center gap-4 px-4"
                style={{ opacity: extraProductsOpacity }}
              >
                {extras.map((p) => (
                  <CinematicProductCard
                    key={p.id}
                    product={p}
                    scale={product3Scale}
                    className="w-[120px] sm:w-[140px]"
                  />
                ))}
              </motion.div>
            )}

            {/* Scroll hint */}
            <motion.div
              className="pointer-events-none absolute bottom-10 left-1/2 z-50 -translate-x-1/2"
              style={{ opacity: scrollHintOpacity }}
            >
              <ScrollMouseHint />
            </motion.div>

            {/* Skip button */}
            <motion.button
              type="button"
              onClick={skip}
              className="fixed bottom-6 right-6 z-[60] rounded-full border border-[#D4A832]/30 bg-[#1B262C]/60 px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-[#D4A832] backdrop-blur-sm transition-colors hover:border-[#D4A832]/60 hover:bg-[#16213E]/80"
              style={{ opacity: skipOpacity }}
              aria-label="Skip cinematic intro"
            >
              Skip
            </motion.button>
          </>
        )}
      </motion.div>
    </div>
  );
}

function CinematicIntroLoading() {
  return (
    <div className="relative" style={{ height: "600vh" }}>
      <div className="sticky top-0 z-40 flex h-screen w-full items-center justify-center overflow-hidden bg-[#1B262C]">
        <CinematicIntroPlaceholder />
      </div>
    </div>
  );
}

export const CinematicIntro = dynamic(
  () => Promise.resolve({ default: CinematicIntroContent }),
  {
    ssr: false,
    loading: CinematicIntroLoading,
  },
);
