"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="relative flex min-h-[100dvh] flex-col justify-start pt-32 sm:justify-end sm:pt-0 overflow-hidden bg-obsidian">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          className="h-full w-full object-cover brightness-50"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
        >
          <source src="/hero-final-bg.mp4" type="video/mp4" />
        </video>
        {/* Dark cinematic gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent"
          aria-hidden
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 pb-12 sm:px-12 sm:pb-24 lg:px-24">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          <motion.p
            variants={itemVariants}
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-gold"
          >
            New Collection — SS 2025
          </motion.p>
          <motion.h1
            variants={itemVariants}
            className="font-display text-[clamp(1.5rem,2.5vw,2.5rem)] leading-[1.05] tracking-tight text-ivory italic max-w-2xl"
          >
            The Art of Quiet Luxury
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-lg tracking-wide text-smoke max-w-xl font-light"
          >
            Handcrafted pieces for those who know.
          </motion.p>
          <motion.div variants={itemVariants} className="mt-8">
            <Link href="/shop" className="btn-ghost">
              Explore Collection
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
