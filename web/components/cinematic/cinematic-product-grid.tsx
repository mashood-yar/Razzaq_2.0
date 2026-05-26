"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { formatPKR } from "@/lib/utils";
import { Heart, Star } from "lucide-react";
import Image from "next/image";

export function CinematicProductGrid({ products }: { products: any[] }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.07 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 36 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-50px" }}
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[12px] lg:gap-6"
    >
      {products.map((p, i) => {
        return (
          <motion.div key={p.id} variants={item} className="flex flex-col group cursor-pointer">
            <Link href={`/products/${p.slug}`} className="block relative aspect-[2/3] w-full bg-[var(--bg-dusk)] rounded-[2px] overflow-hidden mb-3">
              <Image
                src={p.images?.[0]?.url || p.product_images?.[0]?.url || "/placeholder.jpg"}
                alt={p.name}
                fill
                className="object-cover transition-all duration-[380ms] saturate-[0.88] group-hover:saturate-100 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <button className="absolute top-2 right-2 w-[36px] h-[36px] bg-[var(--bg-obsidian)]/70 flex items-center justify-center rounded-[2px] z-10" onClick={(e) => { e.preventDefault(); }}>
                <Heart className="w-4 h-4 text-[var(--rose-dust)]" />
              </button>
            </Link>

            <div className="px-1 flex flex-col flex-1">
              <h3 className="font-display font-semibold text-[1.2rem] text-[var(--cream-bone)]">{p.name}</h3>
              <p className="font-body font-light text-[12px] text-[var(--cream-muted)] truncate mb-1">A cinematic experience</p>
              <div className="flex gap-0.5 mb-2">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-[var(--gold-earth)] fill-[var(--gold-earth)]" />)}
              </div>
              <div className="flex items-center gap-2 mb-3 mt-auto">
                <span className="font-body font-bold text-[1.125rem] text-[var(--gold-warm)]">
                  {formatPKR(p.price || p.price_pkr)}
                </span>
                {p.compareAtPrice && p.compareAtPrice > (p.price || p.price_pkr) && (
                  <span className="font-body font-light text-[0.875rem] text-[var(--cream-ghost)] line-through">
                    {formatPKR(p.compareAtPrice)}
                  </span>
                )}
              </div>
              <button className="w-full h-[44px] bg-[var(--gold-warm)] text-[var(--bg-void)] font-body font-semibold text-[10px] tracking-[0.2em] rounded-[2px] transition-colors hover:bg-[var(--gold-bright)]">
                ADD TO CART
              </button>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
