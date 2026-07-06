/** Formats a number as Naira with thousands separators, e.g. 49000 → "₦49,000". */
export function formatNaira(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return `₦${Math.round(n).toLocaleString("en-NG")}`;
}
