/** Formats a number as Naira with thousands separators, e.g. 49000 → "₦49,000". */
export function formatNaira(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}

/** "Free" for free beats, otherwise the Naira price. */
export function priceLabel(beat: { isFree?: boolean; price: number }): string {
  return beat.isFree ? "Free" : formatNaira(beat.price);
}

/**
 * Turns a Supabase public URL into a force-download link. Appending `?download`
 * makes Storage serve `Content-Disposition: attachment` so the file saves to the
 * device instead of streaming (the `download` HTML attr is ignored cross-origin).
 */
export function forceDownloadUrl(url: string): string {
  if (!url) return url;
  return url + (url.includes("?") ? "&" : "?") + "download";
}
