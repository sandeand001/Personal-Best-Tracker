import type { Entry, ExerciseUnitMode, PRSlot, RepBracket } from "../types";
import { epley, isE1rmEligible } from "../epley";

export const REP_BRACKETS: ReadonlyArray<RepBracket> = [1, 3, 5, 8, 12];

export interface DetectionInput {
  entry: Entry;
  unitMode: ExerciseUnitMode;
  /** Map of slot id -> current best value (kg for weights, sec for times, watts for power, m for distance). */
  existingBests: ReadonlyMap<PRSlot, number>;
  /** For cardio entries with a single canonical slot (e.g., "5K", "ftp"), provide the slot id. */
  cardioSlot?: PRSlot;
  /** Optional list of canonical-distance slots an entry could simultaneously beat (e.g., a long run beats both "longest-run" and any shorter distance PRs at sub-pace). v1: not used; passed through for future. */
  additionalCardioSlots?: PRSlot[];
}

export interface DetectionResult {
  slotsBeaten: PRSlot[];
  e1rmKg?: number;
}

export function detectPR(input: DetectionInput): DetectionResult {
  const { entry, unitMode, existingBests, cardioSlot } = input;
  const slots: PRSlot[] = [];
  let e1rmKg: number | undefined;

  if (unitMode === "wxr") {
    if (entry.weightKg == null || entry.reps == null) return { slotsBeaten: [] };
    if (entry.weightKg <= 0 || entry.reps < 1) return { slotsBeaten: [] };

    for (const bracket of REP_BRACKETS) {
      if (entry.reps >= bracket) {
        const slot: PRSlot = `${bracket}RM`;
        const best = existingBests.get(slot) ?? 0;
        if (entry.weightKg > best) slots.push(slot);
      }
    }

    if (isE1rmEligible(entry.reps)) {
      e1rmKg = epley(entry.weightKg, entry.reps);
      const bestE1rm = existingBests.get("e1RM") ?? 0;
      if (e1rmKg > bestE1rm) slots.push("e1RM");
    }
  } else if (unitMode === "time-distance" || unitMode === "time") {
    if (cardioSlot && entry.timeSec != null) {
      const best = existingBests.get(cardioSlot);
      if (best == null || entry.timeSec < best) slots.push(cardioSlot);
    }
    if (entry.distanceM != null) {
      const best = existingBests.get("longest-distance") ?? 0;
      if (entry.distanceM > best) slots.push("longest-distance");
    }
  } else if (unitMode === "watts") {
    if (entry.watts != null && cardioSlot) {
      const best = existingBests.get(cardioSlot) ?? 0;
      if (entry.watts > best) slots.push(cardioSlot);
    }
  } else if (unitMode === "duration-hold") {
    if (entry.timeSec != null) {
      const best = existingBests.get("longest-duration") ?? 0;
      if (entry.timeSec > best) slots.push("longest-duration");
    }
  }

  return { slotsBeaten: slots, e1rmKg };
}
