"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export function ProductGallery({
  images,
  productName,
}: {
  images: string[];
  productName: string;
}) {
  const [main, setMain] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <button
          type="button"
          className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted ring-offset-4 ring-offset-background transition-shadow hover:ring-2 hover:ring-gold/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          onClick={() => setLightbox(true)}
          aria-label={`Open ${productName} image gallery`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={main}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0"
            >
              <Image
                src={images[main]}
                alt={productName}
                fill
                className="object-cover"
                sizes="(max-width:1024px) 100vw, 50vw"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </button>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setMain(i)}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg ring-2 ring-offset-2 ring-offset-background transition-all ${main === i ? "ring-gold" : "ring-transparent opacity-70 hover:opacity-100"}`}
              aria-label={`View image ${i + 1}`}
              aria-current={main === i}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      </div>

      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="max-w-5xl border-none bg-transparent p-0 shadow-none">
          <DialogTitle className="sr-only">Enlarged view of {productName}</DialogTitle>
          <div className="relative aspect-[3/4] max-h-[85vh] w-full overflow-hidden rounded-xl bg-black">
            <Image
              src={images[main]}
              alt={productName}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
