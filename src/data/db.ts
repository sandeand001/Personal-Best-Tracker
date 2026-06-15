import Dexie, { type Table } from "dexie";
import type { ExerciseDef, PRRecord, Theme, WeightUnit, DistanceUnit } from "../domain/types";

export interface SettingsState {
  units: {
    weight: WeightUnit;
    distance: DistanceUnit;
    pace: "min/mi" | "min/km";
  };
  theme: Theme;
  hapticsEnabled: boolean;
}

export const DEFAULT_SETTINGS: SettingsState = {
  units: { weight: "lb", distance: "mi", pace: "min/mi" },
  theme: "system",
  hapticsEnabled: true,
};

export interface UserAchievementRecord {
  achievementId: string;
  unlockedAt: number;
  /** Snapshot of relevant context at unlock time (for display). */
  snapshot?: Record<string, unknown>;
}

interface SettingsRow {
  key: "singleton";
  value: SettingsState;
}

interface MetaRow {
  key: "singleton";
  schemaVersion: number;
  exercisesSeededAt?: number;
  achievementsSeededAt?: number;
}

export const CURRENT_SCHEMA_VERSION = 1;

export class PRTrackerDB extends Dexie {
  prs!: Table<PRRecord, string>;
  exercises!: Table<ExerciseDef, string>;
  userAchievements!: Table<UserAchievementRecord, string>;
  settings!: Table<SettingsRow, string>;
  schemaMeta!: Table<MetaRow, string>;

  constructor() {
    super("pr-tracker");
    this.version(1).stores({
      prs: "id, exerciseId, achievedAt",
      exercises: "id, muscleGroup, ranked, isVariant, parentExerciseId, custom",
      userAchievements: "achievementId, unlockedAt",
      settings: "key",
      schemaMeta: "key",
    });
  }
}

export const db = new PRTrackerDB();
