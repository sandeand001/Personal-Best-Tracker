import { db, CURRENT_SCHEMA_VERSION } from "../db";
import { SEED_EXERCISES } from "./exercises";

/**
 * Idempotent seed: bulk-puts exercises and stamps schemaMeta.
 * Custom user-created exercises are preserved.
 */
export async function ensureSeeded(): Promise<void> {
  const meta = await db.schemaMeta.get("singleton");
  const needsExercises =
    !meta?.exercisesSeededAt || meta.schemaVersion < CURRENT_SCHEMA_VERSION;

  if (needsExercises) {
    await db.exercises.bulkPut(SEED_EXERCISES);
  }

  await db.schemaMeta.put({
    key: "singleton",
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exercisesSeededAt: meta?.exercisesSeededAt ?? Date.now(),
    achievementsSeededAt: meta?.achievementsSeededAt ?? Date.now(),
  });
}
