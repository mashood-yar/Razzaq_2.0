"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

export type FeaturedCollectionItem = {
  title: string;
  href: string;
  image: string;
  eyebrow?: string;
};

const INTERVAL_MS = 3000;
const SLIDE_DURATION_MS = 400;

export function FeaturedCollectionsConveyor({
  items: initialItems,
}: {
  items: FeaturedCollectionItem[];
}) {
  const [order, setOrder] = useState<FeaturedCollectionItem[]>(initialItems);
  const [offsetPx, setOffsetPx] = useState(0);
  const [noTransition, setNoTransition] = useState(false);
  const [stepPx, setStepPx] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const slideActiveRef = useRef(false);

  useLayoutEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const lgMq = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setReduceMotion(motionMq.matches);
      setIsLargeScreen(lgMq.matches);
    };
    update();
    motionMq.addEventListener("change", update);
    lgMq.addEventListener("change", update);
    return () => {
      motionMq.removeEventListener("change", update);
      lgMq.removeEventListener("change", update);
    };
  }, []);

  const measureStep = useCallback(() => {
    const track = trackRef.current;
    if (!track?.firstElementChild) return;
    const first = track.firstElementChild as HTMLElement;
    const second = first.nextElementSibling as HTMLElement | null;
    const step = second
      ? second.offsetLeft - first.offsetLeft
      : first.getBoundingClientRect().width;
    if (step > 0) setStepPx(step);
  }, []);

  useLayoutEffect(() => {
    measureStep();
    const ro = new ResizeObserver(() => {
      if (!slideActiveRef.current) measureStep();
    });
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measureStep);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measureStep);
    };
  }, [measureStep, order]);

  useEffect(() => {
    if (reduceMotion || isLargeScreen || stepPx <= 0) return;

    const id = window.setInterval(() => {
      if (slideActiveRef.current) return;
      slideActiveRef.current = true;
      setNoTransition(false);
      setOffsetPx(-stepPx);
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [reduceMotion, isLargeScreen, stepPx, order]);

  function handleTransitionEnd(e: React.TransitionEvent<HTMLDivElement>) {
    if (e.propertyName !== "transform") return;
    if (offsetPx === 0) return;

    setNoTransition(true);
    setOrder((prev) => [...prev.slice(1), prev[0]]);
    setOffsetPx(0);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setNoTransition(false);
        slideActiveRef.current = false;
      });
    });
  }

  return (
    <div className="-mx-5 overflow-x-auto scroll-smooth px-5 pb-5 scrollbar-none sm:-mx-6 sm:px-6 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-2">
      <div
        ref={trackRef}
        className={cn(
          "flex gap-4 will-change-transform motion-reduce:transition-none lg:grid lg:grid-cols-4 lg:gap-5 lg:will-change-auto",
        )}
        style={
          isLargeScreen
            ? undefined
            : {
                transform: `translateX(${offsetPx}px)`,
                transition: noTransition
                  ? "none"
                  : `transform ${SLIDE_DURATION_MS}ms ease-in-out`,
              }
        }
        onTransitionEnd={isLargeScreen ? undefined : handleTransitionEnd}
      >
        {(isLargeScreen ? initialItems : order).map((c, idx) => (
          <motion.div
            key={`${c.href}-${c.title}`}
            className="min-w-[80vw] max-w-[320px] shrink-0 snap-center scroll-ml-5 lg:min-w-0 lg:max-w-none lg:snap-align-none"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-48px" }}
            transition={{ duration: 0.5, delay: idx * 0.07, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            <Link
              href={c.href}
              className="group relative block aspect-[3/4] overflow-hidden rounded-sm bg-noir-surface"
            >
              <Image
                src={c.image}
                alt=""
                fill
                className="object-cover brightness-[0.7] transition-[filter,transform] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] group-hover:brightness-[0.85] motion-reduce:transition-none"
                sizes="(max-width: 640px) 80vw, (max-width: 1024px) 25vw, 280px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A08]/85 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                {c.eyebrow && (
                  <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.2em] text-gold-warm">
                    {c.eyebrow}
                  </span>
                )}
                <span className="font-display text-[clamp(1.5rem,5vw,2rem)] font-light leading-tight text-foreground">
                  {c.title}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
