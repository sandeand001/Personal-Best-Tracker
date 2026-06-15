import type { ExerciseDef, PRRecord } from "../domain/types";
import { kgToLb, mToMi, secToHmsString } from "../domain/units/conversions";
import type { SettingsState } from "../data/db";

/** Compact human-readable label for a PR record's value, e.g. "225 lb × 5" or "22:30". */
export function formatPRValue(
  pr: PRRecord,
  exercise: ExerciseDef,
  settings: SettingsState
): string {
  if (exercise.unitMode === "wxr" && pr.weightKg != null) {
    const w =
      settings.units.weight === "lb"
        ? `${kgToLb(pr.weightKg).toFixed(0)} lb`
        : `${pr.weightKg.toFixed(0)} kg`;
    return pr.reps ? `${w} × ${pr.reps}` : w;
  }
  if ((exercise.unitMode === "time-distance" || exercise.unitMode === "time") && pr.timeSec != null) {
    return secToHmsString(pr.timeSec);
  }
  if (exercise.unitMode === "time-distance" && pr.distanceM != null) {
    return settings.units.distance === "mi"
      ? `${mToMi(pr.distanceM).toFixed(2)} mi`
      : `${(pr.distanceM / 1000).toFixed(2)} km`;
  }
  if (exercise.unitMode === "watts" && pr.watts != null) {
    return `${pr.watts} W`;
  }
  if (exercise.unitMode === "duration-hold" && pr.timeSec != null) {
    return secToHmsString(pr.timeSec);
  }
  return "—";
}
