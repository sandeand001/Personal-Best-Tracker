import { create } from "zustand";
import { db } from "../data/db";
import type { ExerciseDef, MuscleGroup, PRRecord, StatTab, Tier } from "../domain/types";
import type { SettingsState } from "../data/db";
import { DEFAULT_SETTINGS } from "../data/db";
import { tierForPercentile } from "../domain/tiers";
import { lookupPercentile } from "../domain/percentiles/lookup";
import type { PercentileTable } from "../domain/percentiles/types";
import { PERCENTILE_TABLES } from "../data/seed/percentile-registry";
import { SEED_ACHIEVEMENTS } from "../data/seed/achievements";
import type { AchievementDef } from "../domain/achievements/rules";
import { evaluateRule } from "../domain/achievements/rules";
import { settingsRepo } from "../data/repos/settings-repo";
import { prRepo } from "../data/repos/pr-repo";
import { exerciseRepo } from "../data/repos/exercise-repo";
import { achievementRepo } from "../data/repos/achievement-repo";
import { ensureSeeded } from "../data/seed/loader";
import { resolvePercentileExerciseId } from "../domain/exercises/variants";
import { regionPercentile } from "../domain/pr/rollup";

interface CelebrationItem {
  id: string;
  kind: "pr" | "achievement";
  pr?: PRRecord;
  exerciseName?: string;
  achievement?: AchievementDef;
  tier?: Tier;
  percentile?: number;
}

interface AppStore {
  initialized: boolean;
  exercises: ExerciseDef[];
  prs: PRRecord[];
  unlockedAchievements: Set<string>;
  settings: SettingsState;
  celebrationQueue: CelebrationItem[];

  init(): Promise<void>;
  refreshAll(): Promise<void>;

  addCustomExercise(def: ExerciseDef): Promise<void>;

  /** Persist a PR record (assumed already PR-validated) and run achievement checks. */
  submitPR(record: PRRecord, exerciseName: string): Promise<void>;
  editPR(id: string, patch: Partial<PRRecord>): Promise<void>;
  deletePR(id: string): Promise<void>;
  resetAllData(): Promise<void>;

  updateSettings(patch: Partial<SettingsState>): Promise<void>;

  dequeueCelebration(): void;
}

function getPercentileTable(exerciseId: string): PercentileTable | null {
  return PERCENTILE_TABLES[exerciseId] ?? null;
}

export const useAppStore = create<AppStore>((set, get) => ({
  initialized: false,
  exercises: [],
  prs: [],
  unlockedAchievements: new Set(),
  settings: DEFAULT_SETTINGS,
  celebrationQueue: [],

  async init() {
    await ensureSeeded();
    await get().refreshAll();
    set({ initialized: true });
  },

  async refreshAll() {
    const [exercises, prs, ua, settings] = await Promise.all([
      exerciseRepo.getAll(),
      prRepo.getAll(),
      achievementRepo.getAll(),
      settingsRepo.get(),
    ]);
    set({
      exercises,
      prs,
      unlockedAchievements: new Set(ua.map((u) => u.achievementId)),
      settings,
    });
  },

  async addCustomExercise(def: ExerciseDef) {
    await exerciseRepo.addCustom(def);
    set({ exercises: [...get().exercises, def] });
  },

  async submitPR(record, exerciseName) {
    await prRepo.add(record);
    const newPRs = [record, ...get().prs];

    const newCelebrations: CelebrationItem[] = [];

    const def = get().exercises.find((e) => e.id === record.exerciseId);
    if (def) {
      const tabUsed: StatTab =
        record.percentileTrue != null && record.percentileE1rm == null
          ? "true"
          : "e1rm";
      const tier = tabUsed === "true" ? record.tierTrue : record.tierE1rm;
      const pct = tabUsed === "true" ? record.percentileTrue : record.percentileE1rm;
      newCelebrations.push({
        id: `pr-${record.id}`,
        kind: "pr",
        pr: record,
        exerciseName,
        tier,
        percentile: pct,
      });
    }

    const ctx = buildRuleEvalContext(newPRs, get().exercises);
    const newlyUnlocked: string[] = [];
    for (const ach of SEED_ACHIEVEMENTS) {
      if (get().unlockedAchievements.has(ach.id)) continue;
      const result = evaluateRule(ach.rule, ctx);
      if (result.unlocked) {
        await achievementRepo.unlock({ achievementId: ach.id, unlockedAt: Date.now() });
        newlyUnlocked.push(ach.id);
        newCelebrations.push({
          id: `ach-${ach.id}`,
          kind: "achievement",
          achievement: ach,
        });
      }
    }

    const updatedUnlocked = new Set(get().unlockedAchievements);
    newlyUnlocked.forEach((id) => updatedUnlocked.add(id));

    set({
      prs: newPRs,
      unlockedAchievements: updatedUnlocked,
      celebrationQueue: [...get().celebrationQueue, ...newCelebrations],
    });
  },

  async editPR(id, patch) {
    await prRepo.update(id, patch);
    await get().refreshAll();
  },

  async deletePR(id) {
    await prRepo.remove(id);
    await get().refreshAll();
  },

  async resetAllData() {
    await db.delete();
    await db.open();
    set({
      exercises: [],
      prs: [],
      unlockedAchievements: new Set(),
      settings: DEFAULT_SETTINGS,
      celebrationQueue: [],
      initialized: false,
    });
    await get().init();
  },

  async updateSettings(patch) {
    const next = await settingsRepo.update(patch);
    set({ settings: next });
  },

  dequeueCelebration() {
    const [, ...rest] = get().celebrationQueue;
    set({ celebrationQueue: rest });
  },
}));

// =============== Selectors / Derived state ===============

export function bestForExerciseSlot(
  prs: ReadonlyArray<PRRecord>,
  exerciseId: string,
  slot: string
): number | undefined {
  let best: number | undefined;
  for (const r of prs) {
    if (r.exerciseId !== exerciseId) continue;
    if (!r.prSlots.includes(slot)) continue;
    const v = valueForSlot(r, slot);
    if (v == null) continue;
    if (best == null || isBetter(slot, v, best)) best = v;
  }
  return best;
}

function valueForSlot(r: PRRecord, slot: string): number | undefined {
  if (slot === "e1RM") return r.e1rmKg;
  if (slot.endsWith("RM")) return r.weightKg;
  if (slot === "ftp" || slot === "5min-watts" || slot === "1min-watts") return r.watts;
  if (slot === "longest-distance" || slot === "longest-run" || slot === "longest-ride") return r.distanceM;
  if (slot === "longest-duration") return r.timeSec;
  // row-30min, row-60min: distance
  if (slot === "row-30min" || slot === "row-60min") return r.distanceM;
  // default: time-based slot
  return r.timeSec;
}

function isBetter(slot: string, candidate: number, current: number): boolean {
  // Time-based slots: lower is better
  const isTimeSlot =
    slot.startsWith("row-") &&
    slot !== "row-30min" &&
    slot !== "row-60min";
  const isRunOrSwimTime =
    slot === "1mi" ||
    slot === "5K" ||
    slot === "10K" ||
    slot === "half-marathon" ||
    slot === "marathon" ||
    slot === "40K-tt" ||
    slot.startsWith("swim-");
  if (isTimeSlot || isRunOrSwimTime) return candidate < current;
  return candidate > current;
}

/** Per-exercise best percentile for the given stat tab. */
export function exercisePercentile(
  prs: ReadonlyArray<PRRecord>,
  exercises: ReadonlyArray<ExerciseDef>,
  exerciseId: string,
  tab: StatTab
): number {
  const def = exercises.find((e) => e.id === exerciseId);
  if (!def) return 0;
  const tableExId = resolvePercentileExerciseId(def);
  if (!tableExId) return 0;
  const table = getPercentileTable(tableExId);
  if (!table) return 0;

  const exPRs = prs.filter((p) => p.exerciseId === exerciseId);
  if (exPRs.length === 0) return 0;

  if (def.unitMode === "wxr") {
    if (tab === "true") {
      const true1RM = exPRs
        .filter((r) => r.reps === 1 && r.weightKg != null)
        .reduce((m, r) => Math.max(m, r.weightKg ?? 0), 0);
      if (true1RM === 0) return 0;
      return lookupPercentile(table, true1RM);
    } else {
      const bestE1rm = exPRs.reduce((m, r) => Math.max(m, r.e1rmKg ?? 0), 0);
      if (bestE1rm === 0) return 0;
      return lookupPercentile(table, bestE1rm);
    }
  } else if (def.unitMode === "time-distance" || def.unitMode === "time") {
    // For time-PR exercises: best time
    const bestTime = exPRs.reduce(
      (m, r) => (r.timeSec != null && (m == null || r.timeSec < m) ? r.timeSec : m),
      undefined as number | undefined
    );
    if (bestTime != null) return lookupPercentile(table, bestTime);
    // distance-PR exercises (longest run/ride): best distance
    const bestDist = exPRs.reduce((m, r) => Math.max(m, r.distanceM ?? 0), 0);
    if (bestDist > 0) return lookupPercentile(table, bestDist);
    return 0;
  } else if (def.unitMode === "watts") {
    const best = exPRs.reduce((m, r) => Math.max(m, r.watts ?? 0), 0);
    if (best === 0) return 0;
    return lookupPercentile(table, best);
  } else if (def.unitMode === "duration-hold") {
    const best = exPRs.reduce((m, r) => Math.max(m, r.timeSec ?? 0), 0);
    if (best === 0) return 0;
    return lookupPercentile(table, best);
  }
  return 0;
}

/** Per-region percentile for the given stat tab (max-of contributing). */
export function regionPercentileFor(
  prs: ReadonlyArray<PRRecord>,
  exercises: ReadonlyArray<ExerciseDef>,
  region: MuscleGroup,
  tab: StatTab
): number {
  const contributing = exercises.filter(
    (e) => e.muscleGroup === region && e.ranked && !e.custom
  );
  const pcts = contributing.map((e) =>
    exercisePercentile(prs, exercises, e.id, tab)
  );
  return regionPercentile(pcts);
}

export function regionTier(percentile: number): Tier {
  return tierForPercentile(percentile);
}

/** Returns the contributing exercise with the highest percentile for the region. */
export function topContributingExercise(
  prs: ReadonlyArray<PRRecord>,
  exercises: ReadonlyArray<ExerciseDef>,
  region: MuscleGroup,
  tab: StatTab
): { exercise: ExerciseDef; percentile: number; bestPR: PRRecord } | null {
  const contributing = exercises.filter(
    (e) => e.muscleGroup === region && e.ranked && !e.custom
  );
  let best: { exercise: ExerciseDef; percentile: number; bestPR: PRRecord } | null = null;
  for (const ex of contributing) {
    const pct = exercisePercentile(prs, exercises, ex.id, tab);
    if (pct <= 0) continue;
    if (best && pct <= best.percentile) continue;
    // Find the actual PR record that drove this percentile.
    const exPRs = prs.filter((p) => p.exerciseId === ex.id);
    let topPR: PRRecord | undefined;
    if (ex.unitMode === "wxr") {
      if (tab === "true") {
        topPR = exPRs
          .filter((p) => p.reps === 1 && p.weightKg != null)
          .reduce<PRRecord | undefined>(
            (m, p) => (!m || (p.weightKg ?? 0) > (m.weightKg ?? 0) ? p : m),
            undefined
          );
      } else {
        topPR = exPRs.reduce<PRRecord | undefined>(
          (m, p) => (!m || (p.e1rmKg ?? 0) > (m.e1rmKg ?? 0) ? p : m),
          undefined
        );
      }
    } else if (ex.unitMode === "time-distance" || ex.unitMode === "time") {
      topPR = exPRs
        .filter((p) => p.timeSec != null)
        .reduce<PRRecord | undefined>(
          (m, p) => (!m || (p.timeSec ?? Infinity) < (m.timeSec ?? Infinity) ? p : m),
          undefined
        );
      if (!topPR) {
        topPR = exPRs.reduce<PRRecord | undefined>(
          (m, p) => (!m || (p.distanceM ?? 0) > (m.distanceM ?? 0) ? p : m),
          undefined
        );
      }
    } else if (ex.unitMode === "watts") {
      topPR = exPRs.reduce<PRRecord | undefined>(
        (m, p) => (!m || (p.watts ?? 0) > (m.watts ?? 0) ? p : m),
        undefined
      );
    } else if (ex.unitMode === "duration-hold") {
      topPR = exPRs.reduce<PRRecord | undefined>(
        (m, p) => (!m || (p.timeSec ?? 0) > (m.timeSec ?? 0) ? p : m),
        undefined
      );
    }
    if (!topPR) continue;
    best = { exercise: ex, percentile: pct, bestPR: topPR };
  }
  return best;
}

// =============== Achievement rule context builder ===============

function buildRuleEvalContext(
  prs: PRRecord[],
  exercises: ExerciseDef[]
): import("../domain/achievements/rules").RuleEvalContext {
  const regions: MuscleGroup[] = ["chest", "back", "shoulders", "arms", "legs", "core", "engine"];
  const regionPcts = new Map<MuscleGroup, number>();
  for (const r of regions) {
    // Use max(true, e1rm) for achievement-purposes
    const t = regionPercentileFor(prs, exercises, r, "true");
    const e = regionPercentileFor(prs, exercises, r, "e1rm");
    regionPcts.set(r, Math.max(t, e));
  }

  const tierCounts = new Map<Tier, number>();
  for (const e of exercises) {
    if (!e.ranked || e.custom) continue;
    const t = exercisePercentile(prs, exercises, e.id, "true");
    const eVal = exercisePercentile(prs, exercises, e.id, "e1rm");
    const best = Math.max(t, eVal);
    if (best <= 0) continue;
    const tier = tierForPercentile(best);
    const tiers: Tier[] = ["iron", "bronze", "silver", "gold", "platinum", "diamond", "mythic", "legend"];
    const idx = tiers.indexOf(tier);
    for (let i = 0; i <= idx; i++) {
      tierCounts.set(tiers[i], (tierCounts.get(tiers[i]) ?? 0) + 1);
    }
  }

  return {
    allPRs: prs,
    regionPercentiles: regionPcts,
    exerciseTierCounts: tierCounts,
    now: Date.now(),
  };
}
