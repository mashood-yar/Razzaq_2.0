/** Best-effort carrier tracking URL for emails and UI. */
export function buildCourierTrackingUrl(
  courierName: string | null | undefined,
  trackingNumber: string | null | undefined,
  fallbackUrl: string | null | undefined,
): string | null {
  const fall = fallbackUrl?.trim();
  if (fall) return fall;
  const t = trackingNumber?.trim();
  if (!t) return null;
  const c = (courierName ?? "").toLowerCase();
  if (c.includes("tcs")) {
    return `https://www.tcsexpress.com/track/${encodeURIComponent(t)}`;
  }
  if (c.includes("leopard")) {
    return `https://www.leopardscourier.com.pk/track/${encodeURIComponent(t)}`;
  }
  if (c.includes("post") || c.includes("pakistan post")) {
    return `https://ep.gov.pk/track.asp?Itemcode=${encodeURIComponent(t)}`;
  }
  return null;
}
