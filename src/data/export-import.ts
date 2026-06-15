import { db, CURRENT_SCHEMA_VERSION, type SettingsState } from "./db";
import type { PRRecord } from "../domain/types";

export interface ExportPayload {
  schemaVersion: number;
  exportedAt: number;
  prs: PRRecord[];
  userAchievements: Array<{ achievementId: string; unlockedAt: number; snapshot?: Record<string, unknown> }>;
  settings: SettingsState;
  /** Custom user-created exercises only — seeded ones rebuild from app code. */
  customExercises: import("../domain/types").ExerciseDef[];
}

export async function exportAll(): Promise<Blob> {
  const [prs, userAchievements, settingsRow, allExercises] = await Promise.all([
    db.prs.toArray(),
    db.userAchievements.toArray(),
    db.settings.get("singleton"),
    db.exercises.toArray(),
  ]);
  const customExercises = allExercises.filter((e) => e.custom);
  const payload: ExportPayload = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: Date.now(),
    prs,
    userAchievements,
    settings: settingsRow?.value ?? {
      units: { weight: "lb", distance: "mi", pace: "min/mi" },
      theme: "system",
      hapticsEnabled: true,
    },
    customExercises,
  };
  return new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
}

export type ImportMode = "merge" | "replace";

export interface ImportResult {
  importedPRs: number;
  importedAchievements: number;
  importedCustomExercises: number;
  schemaVersion: number;
}

export async function importAll(file: File, mode: ImportMode): Promise<ImportResult> {
  const text = await file.text();
  let payload: ExportPayload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error("Invalid JSON file");
  }
  if (typeof payload.schemaVersion !== "number") {
    throw new Error("Missing schemaVersion in import file");
  }
  if (payload.schemaVersion > CURRENT_SCHEMA_VERSION) {
    throw new Error(
      `Import schema v${payload.schemaVersion} is newer than app schema v${CURRENT_SCHEMA_VERSION}. Update the app first.`
    );
  }

  if (mode === "replace") {
    await db.prs.clear();
    await db.userAchievements.clear();
    await db.exercises.where("custom").equals(1).delete();
  }

  await db.prs.bulkPut(payload.prs);
  await db.userAchievements.bulkPut(payload.userAchievements);
  if (payload.customExercises?.length) {
    await db.exercises.bulkPut(payload.customExercises);
  }
  if (payload.settings) {
    await db.settings.put({ key: "singleton", value: payload.settings });
  }

  return {
    importedPRs: payload.prs.length,
    importedAchievements: payload.userAchievements.length,
    importedCustomExercises: payload.customExercises?.length ?? 0,
    schemaVersion: payload.schemaVersion,
  };
}
