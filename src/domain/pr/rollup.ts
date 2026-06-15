/**
 * Region percentile = max of contributing-lift percentiles. Returns 0 if none.
 */
export function regionPercentile(percentiles: ReadonlyArray<number>): number {
  if (percentiles.length === 0) return 0;
  return Math.max(...percentiles);
}
