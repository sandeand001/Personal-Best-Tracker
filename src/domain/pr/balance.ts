/**
 * Balance score (1-5 dots): how evenly developed are the contributing lifts in a region?
 * Computed as average / max across the contributing lift percentiles, bucketed.
 * - 5: nearly identical (avg/max >= 0.85)
 * - 4: well-rounded (>= 0.70)
 * - 3: moderate (>= 0.55)
 * - 2: lopsided (>= 0.40)
 * - 1: extreme specialist (< 0.40 or only one lift)
 */
export function balanceScore(percentiles: ReadonlyArray<number>): 1 | 2 | 3 | 4 | 5 {
  if (percentiles.length <= 1) return 1;
  const max = Math.max(...percentiles);
  if (max <= 0) return 1;
  const avg = percentiles.reduce((a, b) => a + b, 0) / percentiles.length;
  const ratio = avg / max;
  if (ratio >= 0.85) return 5;
  if (ratio >= 0.7) return 4;
  if (ratio >= 0.55) return 3;
  if (ratio >= 0.4) return 2;
  return 1;
}
