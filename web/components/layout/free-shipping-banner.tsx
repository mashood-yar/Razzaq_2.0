"use client";

import { usePathname } from "next/navigation";

export function FreeShippingBanner() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <p className="shipping-banner" role="status">
      Free delivery on orders above PKR 5,000
    </p>
  );
}
