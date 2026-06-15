import type { MuscleGroup, PRRecord, Tier } from "../types";

export type AchievementCategory =
  | "plate-club"
  | "sub-x"
  | "concept2"
  | "power"
  | "bodyweight-plus"
  | "tier-coverage"
  | "volume"
  | "consistency"
  | "discovery"
  | "flavor";

export type AchievementRule =
  | {
      kind: "lift-threshold";
      exerciseId: string;
      mode: "true1rm" | "e1rm";
      minWeightKg: number;
    }
  | {
      kind: "cardio-time";
      exerciseId: string;
      slot: string;
      maxTimeSec: number;
    }
  | {
      kind: "cardio-distance";
      exerciseId: string;
      minDistanceM: number;
    }
  | {
      kind: "cardio-power";
      exerciseId: string;
      slot: string;
      minWatts: number;
    }
  | {
      kind: "duration-hold";
      exerciseId: string;
      minSeconds: number;
    }
  | { kind: "pr-count"; min: number }
  | {
      kind: "tier-coverage";
      minTier: Tier;
      regions: MuscleGroup[] | "all";
    }
  | {
      kind: "diamond-dozen";
      minTier: Tier;
      minCount: number;
    }
  | {
      kind: "discovery-first-pr";
      scope: "any" | "exercise" | "muscle-group";
      targetId?: string;
    }
  | { kind: "triathlete" }
  | { kind: "consistency-monthly"; consecutiveMonths: number }
  | { kind: "flavor-time-of-day"; startHour: number; endHour: number };

export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export interface AchievementDef {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  hidden: boolean;
  rarity: Rarity;
  rule: AchievementRule;
}

export interface RuleEvalContext {
  allPRs: ReadonlyArray<PRRecord>;
  /** Map of muscleGroup -> current percentile for the active stat tab. */
  regionPercentiles: ReadonlyMap<MuscleGroup, number>;
  /** Number of distinct exercises currently at >= each tier (computed once per check pass). */
  exerciseTierCounts: ReadonlyMap<Tier, number>;
  now: number;
}

export interface RuleEvalResult {
  unlocked: boolean;
  /** Optional progress display for partial achievements: 0..1. */
  progress?: { current: number; target: number };
}

const TIER_ORDER: ReadonlyArray<Tier> = [
  "iron",
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
  "mythic",
  "legend",
];

function tierAtLeast(actual: Tier, min: Tier): boolean {
  return TIER_ORDER.indexOf(actual) >= TIER_ORDER.indexOf(min);
}

function bestForExercise(
  prs: ReadonlyArray<PRRecord>,
  exerciseId: string
): PRRecord[] {
  return prs.filter((p) => p.exerciseId === exerciseId);
}

export function evaluateRule(
  rule: AchievementRule,
  ctx: RuleEvalContext
): RuleEvalResult {
  switch (rule.kind) {
    case "lift-threshold": {
      const records = bestForExercise(ctx.allPRs, rule.exerciseId);
      let best = 0;
      for (const r of records) {
        if (rule.mode === "true1rm") {
          if (r.reps === 1 && r.weightKg && r.weightKg > best) best = r.weightKg;
        } else {
          if (r.e1rmKg && r.e1rmKg > best) best = r.e1rmKg;
          else if (r.weightKg && r.reps === 1 && r.weightKg > best)
            best = r.weightKg;
        }
      }
      return {
        unlocked: best >= rule.minWeightKg,
        progress: { current: best, target: rule.minWeightKg },
      };
    }
    case "cardio-time": {
      const records = bestForExercise(ctx.allPRs, rule.exerciseId);
      let bestSec = Number.POSITIVE_INFINITY;
      for (const r of records) {
        if (r.timeSec != null && r.prSlots.includes(rule.slot)) {
          if (r.timeSec < bestSec) bestSec = r.timeSec;
        }
      }
      return {
        unlocked: bestSec <= rule.maxTimeSec,
        progress: Number.isFinite(bestSec)
          ? { current: bestSec, target: rule.maxTimeSec }
          : undefined,
      };
    }
    case "cardio-distance": {
      const records = bestForExercise(ctx.allPRs, rule.exerciseId);
      const best = records.reduce(
        (m, r) => Math.max(m, r.distanceM ?? 0),
        0
      );
      return {
        unlocked: best >= rule.minDistanceM,
        progress: { current: best, target: rule.minDistanceM },
      };
    }
    case "cardio-power": {
      const records = bestForExercise(ctx.allPRs, rule.exerciseId);
      const best = records.reduce(
        (m, r) =>
          r.prSlots.includes(rule.slot) ? Math.max(m, r.watts ?? 0) : m,
        0
      );
      return {
        unlocked: best >= rule.minWatts,
        progress: { current: best, target: rule.minWatts },
      };
    }
    case "duration-hold": {
      const records = bestForExercise(ctx.allPRs, rule.exerciseId);
      const best = records.reduce(
        (m, r) => Math.max(m, r.timeSec ?? 0),
        0
      );
      return {
        unlocked: best >= rule.minSeconds,
        progress: { current: best, target: rule.minSeconds },
      };
    }
    case "pr-count": {
      const count = ctx.allPRs.length;
      return {
        unlocked: count >= rule.min,
        progress: { current: count, target: rule.min },
      };
    }
    case "tier-coverage": {
      const regions =
        rule.regions === "all"
          ? (Array.from(ctx.regionPercentiles.keys()) as MuscleGroup[])
          : rule.regions;
      let covered = 0;
      for (const region of regions) {
        const pct = ctx.regionPercentiles.get(region) ?? 0;
        const tier = pct >= 99.9 ? "legend" : pct >= 99 ? "mythic" : pct >= 95 ? "diamond" : pct >= 80 ? "platinum" : pct >= 60 ? "gold" : pct >= 40 ? "silver" : pct >= 20 ? "bronze" : "iron";
        if (tierAtLeast(tier as Tier, rule.minTier)) covered++;
      }
      return {
        unlocked: covered === regions.length,
        progress: { current: covered, target: regions.length },
      };
    }
    case "diamond-dozen": {
      const count = ctx.exerciseTierCounts.get(rule.minTier) ?? 0;
      return {
        unlocked: count >= rule.minCount,
        progress: { current: count, target: rule.minCount },
      };
    }
    case "discovery-first-pr": {
      if (rule.scope === "any") {
        return { unlocked: ctx.allPRs.length >= 1 };
      }
      if (rule.scope === "exercise" && rule.targetId) {
        return {
          unlocked: ctx.allPRs.some((p) => p.exerciseId === rule.targetId),
        };
      }
      return { unlocked: false };
    }
    case "triathlete": {
      const exerciseIds = new Set(ctx.allPRs.map((p) => p.exerciseId));
      const hasRun = [...exerciseIds].some((id) => id.startsWith("run-"));
      const hasBike = [...exerciseIds].some((id) => id.startsWith("bike-"));
      const hasSwim = [...exerciseIds].some((id) => id.startsWith("swim-"));
      return { unlocked: hasRun && hasBike && hasSwim };
    }
    case "consistency-monthly": {
      const months = new Set<string>();
      for (const r of ctx.allPRs) {
        const d = new Date(r.achievedAt);
        months.add(`${d.getFullYear()}-${d.getMonth()}`);
      }
      let bestStreak = 0;
      let curStreak = 0;
      const sorted = [...months].sort();
      let prev: { y: number; m: number } | null = null;
      for (const key of sorted) {
        const [y, m] = key.split("-").map(Number);
        if (
          prev &&
          ((y === prev.y && m === prev.m + 1) ||
            (y === prev.y + 1 && prev.m === 11 && m === 0))
        ) {
          curStreak++;
        } else {
          curStreak = 1;
        }
        bestStreak = Math.max(bestStreak, curStreak);
        prev = { y, m };
      }
      return {
        unlocked: bestStreak >= rule.consecutiveMonths,
        progress: { current: bestStreak, target: rule.consecutiveMonths },
      };
    }
    case "flavor-time-of-day": {
      const hit = ctx.allPRs.some((r) => {
        const h = new Date(r.achievedAt).getHours();
        return rule.startHour <= rule.endHour
          ? h >= rule.startHour && h < rule.endHour
          : h >= rule.startHour || h < rule.endHour;
      });
      return { unlocked: hit };
    }
  }
}
