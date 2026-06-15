import type { Tier } from "../types";

const RANGES: ReadonlyArray<readonly [Tier, number, number]> = [
  ["iron", 0, 20],
  ["bronze", 20, 40],
  ["silver", 40, 60],
  ["gold", 60, 80],
  ["platinum", 80, 95],
  ["diamond", 95, 99],
  ["mythic", 99, 99.9],
  ["legend", 99.9, 100.0001],
];

export const TIERS: ReadonlyArray<Tier> = RANGES.map(([t]) => t);

export function tierForPercentile(percentile: number): Tier {
  if (!Number.isFinite(percentile) || percentile < 0 || percentile > 100) {
    throw new RangeError(`percentile out of range: ${percentile}`);
  }
  for (const [tier, lo, hi] of RANGES) {
    if (percentile >= lo && percentile < hi) return tier;
  }
  return "legend";
}

export function nextTierThreshold(percentile: number): number | null {
  for (const [, lo] of RANGES) {
    if (percentile < lo) return lo;
  }
  return null;
}

export function tierRange(tier: Tier): readonly [number, number] {
  const r = RANGES.find(([t]) => t === tier);
  if (!r) throw new Error(`unknown tier: ${tier}`);
  return [r[1], r[2]];
}
