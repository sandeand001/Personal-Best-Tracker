import type { PercentileTable } from "../../domain/percentiles/types";

/**
 * Stub percentile tables for the curated Ranked exercises.
 * Three anchor points each: roughly 10th, 50th, 90th percentile.
 * Values in canonical units: kg for weights, sec for times, watts for power, m for distances.
 *
 * These are PLACEHOLDERS — replaced in the research phase with real OpenPowerlifting,
 * Strength Level, Concept2, Strava, etc. distributions. confidence: "stub".
 */
const stub = (
  exerciseId: string,
  direction: "asc" | "desc",
  p10: number,
  p50: number,
  p90: number
): PercentileTable => ({
  exerciseId,
  direction,
  points: [
    { value: p10, percentile: 10 },
    { value: p50, percentile: 50 },
    { value: p90, percentile: 90 },
  ],
  confidence: "stub",
});

// kg conversions: 1 plate = 45 lb ≈ 20.4 kg; bar = 45 lb ≈ 20.4 kg
// "1-plate" bench = 135 lb ≈ 61 kg; "2-plate" = 225 ≈ 102; "3-plate" = 315 ≈ 143; "4-plate" = 405 ≈ 184; "5-plate" = 495 ≈ 225

export const STUB_PERCENTILE_TABLES: Record<string, PercentileTable> = {
  // CHEST
  "bench-barbell": stub("bench-barbell", "asc", 45, 90, 150),
  "bench-incline-barbell": stub("bench-incline-barbell", "asc", 35, 70, 120),
  "dip-weighted": stub("dip-weighted", "asc", 0, 25, 60),
  "push-up-weighted": stub("push-up-weighted", "asc", 0, 15, 45),

  // BACK
  "deadlift-conventional": stub("deadlift-conventional", "asc", 70, 140, 220),
  "deadlift-sumo": stub("deadlift-sumo", "asc", 70, 140, 220),
  "deadlift-trap-bar": stub("deadlift-trap-bar", "asc", 80, 150, 230),
  "row-barbell": stub("row-barbell", "asc", 40, 80, 130),
  "row-tbar": stub("row-tbar", "asc", 45, 85, 140),
  "pull-up-weighted": stub("pull-up-weighted", "asc", 0, 25, 60),
  "chin-up-weighted": stub("chin-up-weighted", "asc", 0, 30, 65),
  "lat-pulldown": stub("lat-pulldown", "asc", 35, 70, 110),

  // SHOULDERS
  "ohp-standing-barbell": stub("ohp-standing-barbell", "asc", 30, 60, 100),
  "ohp-seated-db": stub("ohp-seated-db", "asc", 12, 25, 45), // per dumbbell
  "push-press": stub("push-press", "asc", 40, 75, 120),
  "lateral-raise-db": stub("lateral-raise-db", "asc", 5, 12, 25), // per dumbbell

  // ARMS
  "curl-barbell": stub("curl-barbell", "asc", 20, 40, 65),
  "curl-db": stub("curl-db", "asc", 8, 18, 32), // per dumbbell
  "close-grip-bench": stub("close-grip-bench", "asc", 40, 80, 130),
  "skullcrusher": stub("skullcrusher", "asc", 20, 40, 65),
  "tricep-extension-cable": stub("tricep-extension-cable", "asc", 20, 45, 75),

  // LEGS
  "squat-back-barbell": stub("squat-back-barbell", "asc", 60, 120, 200),
  "squat-front-barbell": stub("squat-front-barbell", "asc", 50, 100, 160),
  "rdl-barbell": stub("rdl-barbell", "asc", 60, 120, 190),
  "leg-press": stub("leg-press", "asc", 100, 200, 350),
  "lunge-walking-db": stub("lunge-walking-db", "asc", 10, 22, 40), // per dumbbell
  "leg-curl": stub("leg-curl", "asc", 30, 60, 100),
  "leg-extension": stub("leg-extension", "asc", 35, 70, 120),
  "calf-raise": stub("calf-raise", "asc", 60, 120, 200),

  // CORE — duration-hold and reps tables
  "plank-weighted": stub("plank-weighted", "asc", 30, 90, 240), // sec
  "hanging-leg-raise-weighted": stub("hanging-leg-raise-weighted", "asc", 0, 10, 25),
  "ab-wheel-rollout": stub("ab-wheel-rollout", "asc", 0, 5, 15),
  "l-sit-weighted": stub("l-sit-weighted", "asc", 5, 20, 60), // sec

  // RUN — desc direction (lower time = higher percentile). Times in seconds.
  "run-1mi": stub("run-1mi", "desc", 12 * 60, 9 * 60, 6 * 60),
  "run-5K": stub("run-5K", "desc", 35 * 60, 27 * 60, 19 * 60),
  "run-10K": stub("run-10K", "desc", 75 * 60, 56 * 60, 40 * 60),
  "run-half-marathon": stub("run-half-marathon", "desc", 165 * 60, 120 * 60, 90 * 60),
  "run-marathon": stub("run-marathon", "desc", 360 * 60, 270 * 60, 195 * 60),
  "run-longest-distance": stub("run-longest-distance", "asc", 3000, 10000, 30000), // meters

  // BIKE
  "bike-ftp": stub("bike-ftp", "asc", 130, 220, 320),
  "bike-5min-watts": stub("bike-5min-watts", "asc", 180, 290, 420),
  "bike-40K-tt": stub("bike-40K-tt", "desc", 90 * 60, 70 * 60, 55 * 60),
  "bike-longest-ride": stub("bike-longest-ride", "asc", 20000, 60000, 160000),

  // ROW (Concept2-leaning anchors)
  "row-500m": stub("row-500m", "desc", 130, 105, 85), // sec
  "row-2K": stub("row-2K", "desc", 9 * 60, 7.5 * 60, 6.5 * 60),
  "row-5K": stub("row-5K", "desc", 24 * 60, 20 * 60, 17 * 60),
  "row-30min": stub("row-30min", "asc", 5500, 7000, 8500), // m covered
  "row-60min": stub("row-60min", "asc", 11000, 13500, 16000),

  // SWIM
  "swim-100m": stub("swim-100m", "desc", 150, 110, 75),
  "swim-500m": stub("swim-500m", "desc", 720, 540, 400),
  "swim-1500m": stub("swim-1500m", "desc", 2400, 1800, 1320),
};
