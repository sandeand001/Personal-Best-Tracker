import { describe, it, expect } from "vitest";
import { evaluateRule, type RuleEvalContext } from "./rules";
import type { PRRecord, Tier, MuscleGroup } from "../types";

function ctx(prs: PRRecord[], extras: Partial<RuleEvalContext> = {}): RuleEvalContext {
  return {
    allPRs: prs,
    regionPercentiles: new Map<MuscleGroup, number>(),
    exerciseTierCounts: new Map<Tier, number>(),
    now: Date.now(),
    ...extras,
  };
}

const pr = (overrides: Partial<PRRecord> = {}): PRRecord => ({
  id: "p1",
  exerciseId: "bench",
  achievedAt: Date.now(),
  prSlots: [],
  ...overrides,
});

describe("evaluateRule lift-threshold", () => {
  it("true1rm unlocks when a 1-rep set meets threshold", () => {
    const r = evaluateRule(
      { kind: "lift-threshold", exerciseId: "bench", mode: "true1rm", minWeightKg: 100 },
      ctx([pr({ weightKg: 110, reps: 1 })])
    );
    expect(r.unlocked).toBe(true);
  });
  it("true1rm does not unlock from a multi-rep set", () => {
    const r = evaluateRule(
      { kind: "lift-threshold", exerciseId: "bench", mode: "true1rm", minWeightKg: 100 },
      ctx([pr({ weightKg: 110, reps: 5 })])
    );
    expect(r.unlocked).toBe(false);
  });
  it("e1rm unlocks from a high enough e1rm", () => {
    const r = evaluateRule(
      { kind: "lift-threshold", exerciseId: "bench", mode: "e1rm", minWeightKg: 110 },
      ctx([pr({ weightKg: 100, reps: 5, e1rmKg: 116.67 })])
    );
    expect(r.unlocked).toBe(true);
  });
});

describe("evaluateRule pr-count", () => {
  it("counts all PRs", () => {
    const r = evaluateRule(
      { kind: "pr-count", min: 3 },
      ctx([pr(), pr({ id: "2" }), pr({ id: "3" })])
    );
    expect(r.unlocked).toBe(true);
    expect(r.progress).toEqual({ current: 3, target: 3 });
  });
});

describe("evaluateRule tier-coverage", () => {
  it("all regions at min tier unlocks", () => {
    const map = new Map<MuscleGroup, number>([
      ["chest", 50],
      ["back", 50],
    ]);
    const r = evaluateRule(
      { kind: "tier-coverage", minTier: "silver", regions: ["chest", "back"] },
      ctx([], { regionPercentiles: map })
    );
    expect(r.unlocked).toBe(true);
  });
  it("missing region keeps locked", () => {
    const map = new Map<MuscleGroup, number>([
      ["chest", 50],
      ["back", 30],
    ]);
    const r = evaluateRule(
      { kind: "tier-coverage", minTier: "silver", regions: ["chest", "back"] },
      ctx([], { regionPercentiles: map })
    );
    expect(r.unlocked).toBe(false);
    expect(r.progress).toEqual({ current: 1, target: 2 });
  });
});

describe("evaluateRule discovery-first-pr", () => {
  it("any: unlocks on first PR", () => {
    expect(
      evaluateRule({ kind: "discovery-first-pr", scope: "any" }, ctx([pr()]))
        .unlocked
    ).toBe(true);
  });
});

describe("evaluateRule triathlete", () => {
  it("requires run + bike + swim PRs", () => {
    const prs = [
      pr({ exerciseId: "run-5K" }),
      pr({ id: "2", exerciseId: "bike-ftp" }),
      pr({ id: "3", exerciseId: "swim-100m" }),
    ];
    expect(evaluateRule({ kind: "triathlete" }, ctx(prs)).unlocked).toBe(true);
  });
  it("missing one keeps locked", () => {
    const prs = [pr({ exerciseId: "run-5K" }), pr({ id: "2", exerciseId: "bike-ftp" })];
    expect(evaluateRule({ kind: "triathlete" }, ctx(prs)).unlocked).toBe(false);
  });
});
