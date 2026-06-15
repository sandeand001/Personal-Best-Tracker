export const E1RM_REP_CAP = 8;

export function epley(weightKg: number, reps: number): number {
  if (!Number.isFinite(weightKg) || weightKg <= 0) {
    throw new RangeError(`weightKg must be positive: ${weightKg}`);
  }
  if (!Number.isInteger(reps) || reps < 1 || reps > E1RM_REP_CAP) {
    throw new RangeError(`reps must be an integer in [1, ${E1RM_REP_CAP}]: ${reps}`);
  }
  return weightKg * (1 + reps / 30);
}

export function isE1rmEligible(reps: number): boolean {
  return Number.isInteger(reps) && reps >= 1 && reps <= E1RM_REP_CAP;
}
