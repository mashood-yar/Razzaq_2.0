"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "rzq-luxe-intro-v2";

export function IntroAnimation() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === "undefined") return;
    if (pathname?.startsWith("/admin")) return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    
    setShow(true);
    
    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, 4500); // 4.5 seconds total duration
    
    return () => clearTimeout(timer);
  }, [mounted, pathname]);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[var(--bg-void)] pointer-events-none"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
            className="flex flex-col items-center text-center"
          >
            <h1 className="font-display font-medium text-[2rem] md:text-[3.5rem] text-[var(--cream-bone)] tracking-[0.25em] uppercase leading-none">
              RAZZAQ LUXE
            </h1>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.2 }}
              className="font-body text-[11px] tracking-[0.4em] text-[var(--gold-warm)] mt-6 uppercase"
            >
              Extrait de Parfum
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
