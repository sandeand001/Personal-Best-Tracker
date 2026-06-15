export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "arms"
  | "legs"
  | "core"
  | "engine";

export type SubMuscle =
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "upper-back"
  | "lower-back"
  | "front-delts"
  | "side-delts"
  | "rear-delts"
  | "abs"
  | "run"
  | "bike"
  | "row"
  | "swim"
  | "other";

export type Tier =
  | "iron"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "mythic"
  | "legend";

export type RepBracket = 1 | 3 | 5 | 8 | 12;

export type ExerciseUnitMode =
  | "wxr"
  | "time"
  | "time-distance"
  | "watts"
  | "duration-hold";

export type ExerciseCategory = "strength" | "cardio" | "time-hold";

export type StatTab = "true" | "e1rm";
export type WeightUnit = "lb" | "kg";
export type DistanceUnit = "mi" | "km";
export type Theme = "light" | "dark" | "techno" | "system";

export type PRSlot = string;

export interface ExerciseDef {
  id: string;
  name: string;
  category: ExerciseCategory;
  muscleGroup: MuscleGroup;
  subMuscle?: SubMuscle;
  ranked: boolean;
  isVariant: boolean;
  parentExerciseId?: string;
  custom: boolean;
  unitMode: ExerciseUnitMode;
}

export interface Entry {
  exerciseId: string;
  achievedAt: number;
  weightKg?: number;
  reps?: number;
  timeSec?: number;
  distanceM?: number;
  watts?: number;
}

export interface PRRecord extends Entry {
  id: string;
  e1rmKg?: number;
  percentileTrue?: number;
  percentileE1rm?: number;
  tierTrue?: Tier;
  tierE1rm?: Tier;
  prSlots: PRSlot[];
  notes?: string;
  bodyweightKg?: number;
  locationTag?: string;
}
