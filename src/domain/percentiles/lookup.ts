import type { PercentileTable } from "./types";

/**
 * Look up the percentile for a value in a percentile table.
 * - "asc" direction: higher value = higher percentile (weights, distances, watts).
 * - "desc" direction: lower value = higher percentile (cardio times).
 *
 * Linear interpolation between adjacent points. Clamped to the endpoint
 * percentile when the value is outside the table's range.
 */
export function lookupPercentile(table: PercentileTable, value: number): number {
  const sorted = [...table.points].sort((a, b) => a.percentile - b.percentile);
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0].percentile;

  const isWorse = (v: number, ref: number) =>
    table.direction === "asc" ? v < ref : v > ref;
  const isBetter = (v: number, ref: number) =>
    table.direction === "asc" ? v > ref : v < ref;

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  if (isWorse(value, first.value)) return first.percentile;
  if (isBetter(value, last.value)) return last.percentile;

  for (let i = 0; i < sorted.length - 1; i++) {
    const a = sorted[i];
    const b = sorted[i + 1];
    const inSegment =
      table.direction === "asc"
        ? value >= a.value && value <= b.value
        : value <= a.value && value >= b.value;
    if (inSegment) {
      const span = b.value - a.value;
      if (span === 0) return b.percentile;
      const frac = (value - a.value) / span;
      const pct = a.percentile + frac * (b.percentile - a.percentile);
      return Math.max(0, Math.min(100, pct));
    }
  }
  return last.percentile;
}
