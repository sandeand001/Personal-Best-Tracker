import type { ExerciseDef } from "../../domain/types";

/**
 * Curated Ranked exercises for v1. Each gets a percentile reference table.
 * All entries: custom=false, isVariant=false (Variant tier deferred).
 */
export const SEED_EXERCISES: ExerciseDef[] = [
  // CHEST (4)
  { id: "bench-barbell", name: "Barbell Bench Press", category: "strength", muscleGroup: "chest", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "bench-incline-barbell", name: "Incline Barbell Bench", category: "strength", muscleGroup: "chest", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "dip-weighted", name: "Weighted Dip", category: "strength", muscleGroup: "chest", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "push-up-weighted", name: "Weighted Push-up", category: "strength", muscleGroup: "chest", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },

  // BACK (8)
  { id: "deadlift-conventional", name: "Conventional Deadlift", category: "strength", muscleGroup: "back", subMuscle: "lower-back", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "deadlift-sumo", name: "Sumo Deadlift", category: "strength", muscleGroup: "back", subMuscle: "lower-back", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "deadlift-trap-bar", name: "Trap Bar Deadlift", category: "strength", muscleGroup: "back", subMuscle: "lower-back", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "row-barbell", name: "Barbell Row", category: "strength", muscleGroup: "back", subMuscle: "upper-back", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "row-tbar", name: "T-Bar Row", category: "strength", muscleGroup: "back", subMuscle: "upper-back", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "pull-up-weighted", name: "Weighted Pull-up", category: "strength", muscleGroup: "back", subMuscle: "upper-back", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "chin-up-weighted", name: "Weighted Chin-up", category: "strength", muscleGroup: "back", subMuscle: "upper-back", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "lat-pulldown", name: "Lat Pulldown", category: "strength", muscleGroup: "back", subMuscle: "upper-back", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },

  // SHOULDERS (4)
  { id: "ohp-standing-barbell", name: "Standing OHP", category: "strength", muscleGroup: "shoulders", subMuscle: "front-delts", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "ohp-seated-db", name: "Seated DB Press", category: "strength", muscleGroup: "shoulders", subMuscle: "front-delts", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "push-press", name: "Push Press", category: "strength", muscleGroup: "shoulders", subMuscle: "front-delts", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "lateral-raise-db", name: "DB Lateral Raise", category: "strength", muscleGroup: "shoulders", subMuscle: "side-delts", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },

  // ARMS (5)
  { id: "curl-barbell", name: "Barbell Curl", category: "strength", muscleGroup: "arms", subMuscle: "biceps", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "curl-db", name: "DB Curl", category: "strength", muscleGroup: "arms", subMuscle: "biceps", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "close-grip-bench", name: "Close-Grip Bench", category: "strength", muscleGroup: "arms", subMuscle: "triceps", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "skullcrusher", name: "Skullcrusher", category: "strength", muscleGroup: "arms", subMuscle: "triceps", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "tricep-extension-cable", name: "Cable Tricep Extension", category: "strength", muscleGroup: "arms", subMuscle: "triceps", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },

  // LEGS (8)
  { id: "squat-back-barbell", name: "Back Squat", category: "strength", muscleGroup: "legs", subMuscle: "quads", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "squat-front-barbell", name: "Front Squat", category: "strength", muscleGroup: "legs", subMuscle: "quads", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "rdl-barbell", name: "Romanian Deadlift", category: "strength", muscleGroup: "legs", subMuscle: "hamstrings", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "leg-press", name: "Leg Press", category: "strength", muscleGroup: "legs", subMuscle: "quads", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "lunge-walking-db", name: "DB Walking Lunge", category: "strength", muscleGroup: "legs", subMuscle: "glutes", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "leg-curl", name: "Leg Curl", category: "strength", muscleGroup: "legs", subMuscle: "hamstrings", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "leg-extension", name: "Leg Extension", category: "strength", muscleGroup: "legs", subMuscle: "quads", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "calf-raise", name: "Calf Raise", category: "strength", muscleGroup: "legs", subMuscle: "calves", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },

  // CORE (4)
  { id: "plank-weighted", name: "Weighted Plank", category: "time-hold", muscleGroup: "core", subMuscle: "abs", ranked: true, isVariant: false, custom: false, unitMode: "duration-hold" },
  { id: "hanging-leg-raise-weighted", name: "Weighted Hanging Leg Raise", category: "strength", muscleGroup: "core", subMuscle: "abs", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "ab-wheel-rollout", name: "Ab Wheel Rollout", category: "strength", muscleGroup: "core", subMuscle: "abs", ranked: true, isVariant: false, custom: false, unitMode: "wxr" },
  { id: "l-sit-weighted", name: "Weighted L-Sit", category: "time-hold", muscleGroup: "core", subMuscle: "abs", ranked: true, isVariant: false, custom: false, unitMode: "duration-hold" },

  // ENGINE: RUN (6)
  { id: "run-1mi", name: "1 Mile Run", category: "cardio", muscleGroup: "engine", subMuscle: "run", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },
  { id: "run-5K", name: "5K Run", category: "cardio", muscleGroup: "engine", subMuscle: "run", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },
  { id: "run-10K", name: "10K Run", category: "cardio", muscleGroup: "engine", subMuscle: "run", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },
  { id: "run-half-marathon", name: "Half Marathon", category: "cardio", muscleGroup: "engine", subMuscle: "run", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },
  { id: "run-marathon", name: "Marathon", category: "cardio", muscleGroup: "engine", subMuscle: "run", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },
  { id: "run-longest-distance", name: "Longest Run", category: "cardio", muscleGroup: "engine", subMuscle: "run", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },

  // ENGINE: BIKE (4)
  { id: "bike-ftp", name: "FTP (20-min Power)", category: "cardio", muscleGroup: "engine", subMuscle: "bike", ranked: true, isVariant: false, custom: false, unitMode: "watts" },
  { id: "bike-5min-watts", name: "5-Min Max Watts", category: "cardio", muscleGroup: "engine", subMuscle: "bike", ranked: true, isVariant: false, custom: false, unitMode: "watts" },
  { id: "bike-40K-tt", name: "40K Time Trial", category: "cardio", muscleGroup: "engine", subMuscle: "bike", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },
  { id: "bike-longest-ride", name: "Longest Ride", category: "cardio", muscleGroup: "engine", subMuscle: "bike", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },

  // ENGINE: ROW (5)
  { id: "row-500m", name: "500m Row", category: "cardio", muscleGroup: "engine", subMuscle: "row", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },
  { id: "row-2K", name: "2K Row", category: "cardio", muscleGroup: "engine", subMuscle: "row", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },
  { id: "row-5K", name: "5K Row", category: "cardio", muscleGroup: "engine", subMuscle: "row", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },
  { id: "row-30min", name: "30-Min Row", category: "cardio", muscleGroup: "engine", subMuscle: "row", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },
  { id: "row-60min", name: "60-Min Row", category: "cardio", muscleGroup: "engine", subMuscle: "row", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },

  // ENGINE: SWIM (3)
  { id: "swim-100m", name: "100m Freestyle", category: "cardio", muscleGroup: "engine", subMuscle: "swim", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },
  { id: "swim-500m", name: "500m Freestyle", category: "cardio", muscleGroup: "engine", subMuscle: "swim", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },
  { id: "swim-1500m", name: "1500m Freestyle", category: "cardio", muscleGroup: "engine", subMuscle: "swim", ranked: true, isVariant: false, custom: false, unitMode: "time-distance" },
];

/** For each cardio exercise, the canonical PR slot it produces. */
export const EXERCISE_TO_CARDIO_SLOT: Record<string, string> = {
  "run-1mi": "1mi",
  "run-5K": "5K",
  "run-10K": "10K",
  "run-half-marathon": "half-marathon",
  "run-marathon": "marathon",
  "run-longest-distance": "longest-distance",
  "bike-ftp": "ftp",
  "bike-5min-watts": "5min-watts",
  "bike-40K-tt": "40K-tt",
  "bike-longest-ride": "longest-distance",
  "row-500m": "row-500m",
  "row-2K": "row-2K",
  "row-5K": "row-5K",
  "row-30min": "row-30min",
  "row-60min": "row-60min",
  "swim-100m": "swim-100m",
  "swim-500m": "swim-500m",
  "swim-1500m": "swim-1500m",
};
