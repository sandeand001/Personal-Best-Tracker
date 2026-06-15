import { detectPR } from "../domain/pr/detection";
import { lookupPercentile } from "../domain/percentiles/lookup";
import { tierForPercentile } from "../domain/tiers";
import type { Entry, ExerciseDef, PRRecord } from "../domain/types";
import { resolvePercentileExerciseId } from "../domain/exercises/variants";
import { STUB_PERCENTILE_TABLES } from "../data/seed/stub-percentiles";
import { EXERCISE_TO_CARDIO_SLOT } from "../data/seed/exercises";
import { bestForExerciseSlot } from "./store";

export interface BuildPRResult {
  ok: boolean;
  record?: PRRecord;
  reason?: string;
}

/**
 * Given an entry and the current PR list, run detection and produce a persistable PRRecord
 * (with percentile + tier filled in). Returns ok:false with reason when nothing was beaten.
 */
export function buildPRFromEntry(
  entry: Entry,
  exercises: ReadonlyArray<ExerciseDef>,
  prs: ReadonlyArray<PRRecord>,
  notes?: string,
  bodyweightKg?: number,
  locationTag?: string
): BuildPRResult {
  const def = exercises.find((e) => e.id === entry.exerciseId);
  if (!def) return { ok: false, reason: "Unknown exercise" };

  const cardioSlot = EXERCISE_TO_CARDIO_SLOT[entry.exerciseId];
  const slots = ["1RM", "3RM", "5RM", "8RM", "12RM", "e1RM", "longest-distance", "longest-duration"];
  if (cardioSlot) slots.push(cardioSlot);
  const existingBests = new Map<string, number>();
  for (const s of slots) {
    const v = bestForExerciseSlot(prs, entry.exerciseId, s);
    if (v != null) existingBests.set(s, v);
  }

  const detection = detectPR({
    entry,
    unitMode: def.unitMode,
    existingBests,
    cardioSlot,
  });

  if (detection.slotsBeaten.length === 0) {
    return { ok: false, reason: "Not a PR yet — keep grinding." };
  }

  // Compute percentile/tier for both stat tabs
  const tableExId = resolvePercentileExerciseId(def);
  const table = tableExId ? STUB_PERCENTILE_TABLES[tableExId] : null;

  let percentileTrue: number | undefined;
  let percentileE1rm: number | undefined;

  if (table) {
    if (def.unitMode === "wxr") {
      if (entry.reps === 1 && entry.weightKg) {
        percentileTrue = lookupPercentile(table, entry.weightKg);
      }
      if (detection.e1rmKg != null) {
        percentileE1rm = lookupPercentile(table, detection.e1rmKg);
      }
    } else if (def.unitMode === "time-distance" || def.unitMode === "time") {
      if (entry.timeSec != null) {
        const pct = lookupPercentile(table, entry.timeSec);
        percentileTrue = pct;
        percentileE1rm = pct;
      } else if (entry.distanceM != null) {
        const pct = lookupPercentile(table, entry.distanceM);
        percentileTrue = pct;
        percentileE1rm = pct;
      }
    } else if (def.unitMode === "watts" && entry.watts != null) {
      const pct = lookupPercentile(table, entry.watts);
      percentileTrue = pct;
      percentileE1rm = pct;
    } else if (def.unitMode === "duration-hold" && entry.timeSec != null) {
      const pct = lookupPercentile(table, entry.timeSec);
      percentileTrue = pct;
      percentileE1rm = pct;
    }
  }

  const record: PRRecord = {
    id: crypto.randomUUID(),
    ...entry,
    e1rmKg: detection.e1rmKg,
    percentileTrue,
    percentileE1rm,
    tierTrue: percentileTrue != null ? tierForPercentile(percentileTrue) : undefined,
    tierE1rm: percentileE1rm != null ? tierForPercentile(percentileE1rm) : undefined,
    prSlots: detection.slotsBeaten,
    notes,
    bodyweightKg,
    locationTag,
  };

  return { ok: true, record };
}
