import type { ExerciseDef } from "../types";

/**
 * Resolve which exercise's percentile table should be used to score a given exercise.
 * - Ranked exercise: returns its own id.
 * - Variant exercise: returns parentExerciseId (if set) — the variant's e1RM is scored
 *   against the parent's percentile table.
 * - Custom/unranked exercise: returns null — no percentile applies.
 */
export function resolvePercentileExerciseId(
  exercise: ExerciseDef
): string | null {
  if (exercise.custom) return null;
  if (exercise.isVariant && exercise.parentExerciseId) {
    return exercise.parentExerciseId;
  }
  return exercise.ranked ? exercise.id : null;
}
