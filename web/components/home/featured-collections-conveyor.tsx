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

  const trackRef = useRef<HTMLDivElement>(null);
  const slideActiveRef = useRef(false);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
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
    if (reduceMotion || stepPx <= 0) return;

    const id = window.setInterval(() => {
      if (slideActiveRef.current) return;
      slideActiveRef.current = true;
      setNoTransition(false);
      setOffsetPx(-stepPx);
    }, INTERVAL_MS);

    return () => clearInterval(id);
  }, [reduceMotion, stepPx, order]);

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
    <div className="overflow-hidden pb-2">
      <div
        ref={trackRef}
        className={cn("flex gap-4 will-change-transform motion-reduce:transition-none")}
        style={{
          transform: `translateX(${offsetPx}px)`,
          transition: noTransition
            ? "none"
            : `transform ${SLIDE_DURATION_MS}ms ease-in-out`,
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {order.map((c, idx) => (
          <motion.div
            key={`${c.href}-${c.title}`}
            className="min-w-0 flex-[1_1_0]"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-48px" }}
            transition={{ duration: 0.5, delay: idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              href={c.href}
              className="group relative block h-72 overflow-hidden rounded-2xl"
            >
              <Image
                src={c.image}
                alt=""
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                sizes="(max-width: 640px) 25vw, (max-width: 1024px) 22vw, 280px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <span className="absolute bottom-6 left-6 font-serif text-2xl text-white">
                {c.title}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
