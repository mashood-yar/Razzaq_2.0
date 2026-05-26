"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Star, ArrowRight, Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";

export function AtelierHomeClient({ bestSellers }: { bestSellers: Product[] }) {
  // Motion defaults
  const easeDrama = [0.87, 0, 0.13, 1];
  const easeReveal = [0.25, 0.46, 0.45, 0.94];

  const revealProps = {
    initial: { opacity: 0, y: 36 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px', amount: 0.12 },
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] }
  };

  return (
    <main className="flex flex-col w-full overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[100svh] w-full bg-[var(--bg-void)]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-final-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,7,5,0.88)] via-[rgba(8,7,5,0.2)] to-transparent pointer-events-none" />
        
        <div className="absolute bottom-0 w-full px-6 pb-24 sm:pb-32 lg:pb-16 flex flex-col justify-end h-[42%] lg:h-auto max-w-[1440px] mx-auto left-0 right-0">
          <motion.p 
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, ease: easeDrama }}
            className="font-display text-[10px] tracking-[0.4em] text-[var(--gold-warm)] mb-4 uppercase"
          >
            QUETTA · FRAGRANCE HOUSE · EST. 2024
          </motion.p>
          
          <h1 className="font-display font-light text-[2.5rem] lg:text-[4.5rem] leading-[1.05] text-[var(--cream-bone)] tracking-tight mb-5">
            <motion.span initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.25, ease: easeDrama }} className="block">The Art of</motion.span>
            <motion.span initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.35, ease: easeDrama }} className="block italic text-[var(--gold-pale)]">Quiet Luxury.</motion.span>
          </h1>

          <motion.p 
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.7, ease: easeDrama }}
            className="font-body text-[15px] font-light text-[var(--cream-muted)] max-w-[280px] leading-relaxed mb-8"
          >
            Premium fragrances — rooted in Balochistan, desired everywhere.
          </motion.p>

          <motion.div 
            initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.9, ease: easeDrama }}
            className="flex flex-col lg:flex-row gap-4 mb-5"
          >
            <Link href="/shop" className="btn-primary w-full lg:w-auto h-[52px] text-[11px] tracking-[0.22em] bg-[var(--gold-warm)] text-[var(--bg-void)]">
              DISCOVER THE COLLECTION
            </Link>
            <Link href="/about" className="btn-secondary w-full lg:w-auto h-[52px] text-[11px] tracking-[0.22em] border-[var(--border-mid)]">
              OUR STORY
            </Link>
          </motion.div>

          <motion.p 
            initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 1.1, ease: easeDrama }}
            className="font-body text-[13px] font-light text-[var(--cream-muted)]"
          >
            Trusted by 1,000+ fragrance lovers across Pakistan
          </motion.p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-60">
          <div className="w-[1px] h-[48px] bg-[var(--gold-warm)]/50" />
          <ChevronDown className="w-3 h-3 text-[var(--gold-warm)] animate-bounce mt-1" />
        </div>
      </section>

      {/* 2. SIGNATURE SCENTS MARQUEE */}
      <section className="w-full h-[52px] lg:h-[60px] bg-[var(--bg-obsidian)] border-y border-[var(--border-fine)] overflow-hidden flex items-center">
        <div className="flex animate-marquee-right whitespace-nowrap w-max">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div key={i} className="flex items-center gap-4 text-[14px] font-display text-[var(--cream-warm)] tracking-[0.1em] px-2">
              <span>SPORTY · <i className="text-[var(--cream-muted)]">fresh, athletic, bold</i></span>
              <span className="text-[var(--gold-warm)]/50">✦</span>
              <span>HABIBI · <i className="text-[var(--cream-muted)]">warm, oriental, enveloping</i></span>
              <span className="text-[var(--gold-warm)]/50">✦</span>
              <span>FLOURINE · <i className="text-[var(--cream-muted)]">floral, delicate, pure</i></span>
              <span className="text-[var(--gold-warm)]/50">✦</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SCENT QUIZ TEASER */}
      <section className="py-24 px-5 max-w-[1440px] mx-auto w-full border-t border-[var(--border-fine)]">
        <motion.div {...revealProps} className="w-full flex flex-col items-center text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex justify-center -mt-8 opacity-50" aria-hidden="true">
            <div className="w10 h10 rounded-full border border-[var(--gold-warm)]/40 absolute" />
            <div className="w10 h10 rounded-full border border-[var(--gold-warm)]/30 absolute ml-4" />
            <div className="w10 h10 rounded-full border border-[var(--gold-warm)]/20 absolute ml-8" />
          </div>
          <p className="font-body font-semibold text-[10px] tracking-[0.4em] text-[var(--gold-warm)] uppercase mb-4 z-10">THE RITUAL</p>
          <h2 className="font-display italic font-light text-[2.25rem] text-[var(--cream-bone)] mb-4 z-10">Find Your Signature</h2>
          <p className="font-body font-light text-[15px] text-[var(--cream-muted)] leading-[1.75] max-w-[340px] mb-8 z-10">
            Answer 5 questions. Discover the Razzaq Luxe fragrance built for you.
          </p>
          <button className="btn-primary w-full lg:w-auto h-[52px] z-10">
            BEGIN THE RITUAL →
          </button>
        </motion.div>
      </section>

      {/* 4. BEST SELLERS */}
      <section className="w-full bg-[var(--bg-obsidian)] pt-12 pb-10">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-12">
          <motion.div {...revealProps} className="mb-12">
            <p className="font-body font-semibold text-[10px] tracking-[0.45em] text-[var(--gold-warm)] uppercase mb-4">COVETED COMPOSITIONS</p>
            <h2 className="font-display font-light text-[var(--type-display)] text-[var(--cream-bone)]">The Icons</h2>
          </motion.div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[10px] lg:gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. FEATURED COLLECTIONS */}
      <section className="py-24 px-0 max-w-[1440px] mx-auto w-full lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 px-5 lg:px-0">
          {[
            { label: "FOR HIM", title: "The Gentleman", img: "/collection-1.jpg" },
            { label: "FOR HER", title: "The Feminine", img: "/collection-2.jpg" },
            { label: "UNISEX", title: "The Shared", img: "/collection-3.jpg" },
            { label: "LIMITED", title: "The Rare", img: "/collection-4.jpg" },
          ].map((col, i) => (
            <motion.div key={i} {...revealProps} transition={{ delay: i * 0.1, duration: 0.6 }} className="relative w-full aspect-[16/10] lg:aspect-[3/4] bg-[var(--bg-obsidian)] overflow-hidden group cursor-pointer lg:rounded-[4px]">
              <div className="absolute inset-0 bg-[var(--bg-void)]">
                {/* Fallback box if no image */}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(8,7,5,0.82)] to-transparent via-transparent" />
              <div className="absolute bottom-0 left-0 p-6 flex flex-col">
                <span className="font-body font-semibold text-[10px] tracking-[0.4em] text-[var(--gold-warm)] mb-1">{col.label}</span>
                <span className="font-display italic font-light text-[2.25rem] text-[var(--cream-bone)] mb-3">{col.title}</span>
                <div className="w-[36px] h-[2px] bg-[var(--gold-warm)] mb-4" />
                <span className="font-body font-normal text-[11px] tracking-[0.2em] text-[var(--cream-muted)] flex items-center gap-1 group-hover:text-[var(--gold-warm)] transition-colors">
                  EXPLORE <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. SALE BANNER */}
      <section className="w-full relative overflow-hidden py-24 px-6 border-y border-[var(--border-fine)]" style={{ background: 'linear-gradient(135deg, #1F0D08 0%, #2D1510 60%, #1A0A07 100%)' }}>
        <div className="absolute inset-0 opacity-[0.04] bg-[url('/arabesque.svg')] bg-repeat" aria-hidden="true" />
        <motion.div {...revealProps} className="relative z-10 max-w-2xl mx-auto flex flex-col items-center text-center">
          <span className="font-body font-semibold text-[10px] tracking-[0.45em] text-[var(--gold-warm)]/80 mb-4">LIMITED OFFER</span>
          <h2 className="font-display italic font-light text-[var(--type-display)] text-[var(--cream-bone)] mb-4">Wear the extraordinary.</h2>
          <p className="font-body font-light text-[15px] text-[var(--cream-muted)] mb-8">Complimentary shipping on all orders above PKR 5,000.</p>
          <button className="h-[52px] px-8 border border-[var(--cream-bone)]/60 text-[var(--cream-bone)] font-body text-[11px] font-semibold tracking-[0.2em] rounded-[2px] hover:bg-[var(--cream-bone)] hover:text-[#1A0A07] transition-colors">
            SHOP THE SALE →
          </button>
        </motion.div>
      </section>

      {/* 7. THE PALETTE (Scent Wheel) */}
      <section className="w-full bg-[var(--bg-void)] py-20 px-5 border-b border-[var(--border-fine)]">
        <motion.div {...revealProps} className="max-w-[1440px] mx-auto">
          <div className="mb-10 text-left lg:text-center">
            <span className="font-body font-semibold text-[10px] tracking-[0.4em] text-[var(--gold-warm)] mb-4 block">THE PALETTE</span>
            <h2 className="font-display italic font-light text-[var(--type-display)] text-[var(--cream-bone)] mb-4">Crafted with Purpose</h2>
            <p className="font-body font-light text-[15px] text-[var(--cream-muted)]">Our palette — premium materials orchestrated like art.</p>
          </div>
          
          <div className="flex flex-col lg:hidden">
            <div className="flex gap-6 border-b border-[var(--border-mid)] pb-2 mb-6 overflow-x-auto">
              {['TOP NOTES', 'HEART NOTES', 'BASE NOTES'].map((tab, i) => (
                <button key={tab} className={`font-body font-semibold text-[11px] tracking-[0.25em] whitespace-nowrap ${i === 0 ? 'text-[var(--gold-warm)] border-b-2 border-[var(--gold-warm)] pb-2' : 'text-[var(--cream-ghost)] pb-2'}`}>
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar">
              {['Bergamot', 'Citrus', 'Pink Pepper', 'Saffron'].map(note => (
                <div key={note} className="w-[100px] h-[68px] shrink-0 bg-[var(--bg-dusk)] border border-[var(--border-fine)] rounded-[4px] flex items-center justify-center">
                  <span className="font-body font-medium text-[12px] text-[var(--cream-warm)]">{note}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="hidden lg:flex justify-center items-center h-[500px] opacity-20 border border-[var(--gold-warm)] rounded-full w-[500px] mx-auto">
            <span className="font-display text-4xl text-[var(--gold-warm)]">RL Wheel</span>
          </div>
        </motion.div>
      </section>

      {/* 8. TESTIMONIALS */}
      <section className="w-full bg-[var(--bg-stone)] py-[72px] px-5 lg:py-[96px]">
        <motion.div {...revealProps} className="max-w-4xl mx-auto flex flex-col items-center relative">
          <span className="font-body font-semibold text-[10px] tracking-[0.4em] text-[var(--gold-warm)] mb-4 text-center">WHAT THEY SAY</span>
          <h2 className="font-display italic font-light text-[var(--type-display)] text-[var(--cream-bone)] text-center mb-16">Voices of Razzaq Luxe</h2>
          
          <div className="relative w-full max-w-[640px] px-4">
            <span className="absolute -top-12 -left-4 font-display text-[5rem] text-[var(--gold-deep)]/50 leading-none">"</span>
            <p className="font-display italic font-normal text-[1.5rem] lg:text-[1.875rem] text-[var(--cream-bone)] text-center leading-[1.65] mb-8">
              Every spray feels like a ceremony. The depth of the oud is unmatched by anything else I've worn this year.
            </p>
            <div className="flex flex-col items-center gap-3">
              <span className="font-body font-semibold text-[10px] tracking-[0.3em] text-[var(--gold-warm)]">— AISHA K., LAHORE</span>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-[14px] h-[14px] text-[var(--gold-earth)] fill-[var(--gold-earth)]" />)}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 9. UGC GRID */}
      <section className="py-24 max-w-[1440px] mx-auto px-1 w-full lg:px-12">
        <motion.div {...revealProps} className="mb-12 px-4 lg:px-0">
          <span className="font-body font-semibold text-[10px] tracking-[0.4em] text-[var(--gold-warm)] mb-4 block">THE COMMUNITY</span>
          <h2 className="font-display italic font-normal text-[var(--type-title)] text-[var(--cream-bone)] mb-3">As Seen on You</h2>
          <p className="font-body font-light text-[14px] text-[var(--cream-muted)]">Tag #RazzaqLuxe — we feature our community every week.</p>
        </motion.div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[4px]">
          {[1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`relative bg-[var(--bg-ash)] overflow-hidden group cursor-pointer ${
                i === 0 ? 'aspect-square' : 
                i === 1 ? 'aspect-[1/1.35]' : 
                i === 2 ? 'aspect-[1/1.35]' : 
                'aspect-square'
              }`}
            >
              <div className="absolute inset-0 bg-black/0 group-hover:bg-[rgba(8,7,5,0.5)] transition-colors duration-300 z-10 flex items-center justify-center">
                <span className="font-body font-semibold text-[13px] text-[var(--cream-bone)] opacity-0 group-hover:opacity-100 transition-opacity">#RazzaqLuxe</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. NEWSLETTER */}
      <section className="w-full bg-[var(--bg-void)] py-[96px] px-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-1 h-1 bg-[var(--gold-warm)]/25 rounded-full top-[20%] left-[10%] animate-pulse" />
          <div className="absolute w-1 h-1 bg-[var(--gold-warm)]/25 rounded-full top-[60%] right-[15%] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <motion.div {...revealProps} className="max-w-[540px] w-full text-center relative z-10">
          <h2 className="font-display italic font-light text-[var(--type-display)] text-[var(--cream-bone)] mb-4">The Razzaq Luxe Letter</h2>
          <p className="font-body font-light text-[15px] text-[var(--cream-muted)] leading-[1.8] mb-10">
            Fragrance notes. New arrivals. Stories from Quetta. Delivered monthly.
          </p>
          <form className="flex flex-col lg:flex-row w-full gap-4 lg:gap-0 lg:h-[52px]">
            <input 
              type="email" 
              placeholder="your@email.com" 
              className="w-full h-[52px] lg:h-full lg:rounded-r-none bg-[var(--bg-dusk)] border border-[var(--border-mid)] focus:border-[var(--border-glow)] outline-none px-4 text-[15px] font-light text-[var(--cream-bone)] placeholder-[var(--cream-ghost)] rounded-[2px]"
            />
            <button type="submit" className="w-full lg:w-[200px] h-[52px] lg:h-full lg:rounded-l-none bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-semibold text-[11px] tracking-[0.25em] rounded-[2px] shrink-0">
              JOIN THE CIRCLE
            </button>
          </form>
        </motion.div>
      </section>
      
    </main>
  );
}
