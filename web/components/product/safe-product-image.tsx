"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useState } from "react";
import { getProductImageUrl, PRODUCT_PLACEHOLDER_SRC } from "@/lib/product-image";

export type SafeProductImageProps = Omit<ImageProps, "src"> & {
  src: string | null | undefined;
};

/** `next/image` with empty/invalid `src` normalization and one-shot fallback if the URL fails to load. */
export function SafeProductImage({ src, onError, alt = "", ...rest }: SafeProductImageProps) {
  const [broken, setBroken] = useState(false);
  const resolved = broken ? PRODUCT_PLACEHOLDER_SRC : getProductImageUrl(src);

  const handleError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (!broken) setBroken(true);
      onError?.(e);
    },
    [broken, onError],
  );

  return <Image {...rest} src={resolved} alt={alt} onError={handleError} />;
}
