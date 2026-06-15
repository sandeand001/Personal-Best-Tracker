import { describe, it, expect } from "vitest";
import { detectPR } from "./detection";
import type { PRSlot } from "../types";

const empty = new Map<PRSlot, number>();

describe("detectPR strength (wxr)", () => {
  it("first ever bench: beats every applicable rep-bracket and e1RM", () => {
    const r = detectPR({
      entry: { exerciseId: "bench", achievedAt: 0, weightKg: 100, reps: 5 },
      unitMode: "wxr",
      existingBests: empty,
    });
    expect(r.slotsBeaten).toEqual(expect.arrayContaining(["1RM", "3RM", "5RM", "e1RM"]));
    expect(r.slotsBeaten).not.toContain("8RM");
    expect(r.slotsBeaten).not.toContain("12RM");
    expect(r.e1rmKg).toBeCloseTo(100 * (1 + 5 / 30));
  });

  it("does not beat existing higher 1RM", () => {
    const bests = new Map<PRSlot, number>([
      ["1RM", 200],
      ["3RM", 100],
      ["5RM", 100],
      ["e1RM", 230],
    ]);
    const r = detectPR({
      entry: { exerciseId: "bench", achievedAt: 0, weightKg: 150, reps: 5 },
      unitMode: "wxr",
      existingBests: bests,
    });
    expect(r.slotsBeaten).not.toContain("1RM");
    expect(r.slotsBeaten).toContain("3RM");
    expect(r.slotsBeaten).toContain("5RM");
  });

  it("rep cap on e1RM: 10-rep set produces no e1RM slot", () => {
    const r = detectPR({
      entry: { exerciseId: "bench", achievedAt: 0, weightKg: 100, reps: 10 },
      unitMode: "wxr",
      existingBests: empty,
    });
    expect(r.slotsBeaten).not.toContain("e1RM");
    expect(r.e1rmKg).toBeUndefined();
    expect(r.slotsBeaten).toContain("8RM");
  });

  it("invalid entry returns empty", () => {
    expect(
      detectPR({
        entry: { exerciseId: "bench", achievedAt: 0 },
        unitMode: "wxr",
        existingBests: empty,
      }).slotsBeaten
    ).toEqual([]);
  });
});

describe("detectPR cardio time", () => {
  it("faster time beats", () => {
    const bests = new Map<PRSlot, number>([["5K", 25 * 60]]);
    const r = detectPR({
      entry: { exerciseId: "run-5K", achievedAt: 0, timeSec: 22 * 60, distanceM: 5000 },
      unitMode: "time-distance",
      existingBests: bests,
      cardioSlot: "5K",
    });
    expect(r.slotsBeaten).toContain("5K");
  });

  it("slower time does not beat", () => {
    const bests = new Map<PRSlot, number>([["5K", 22 * 60]]);
    const r = detectPR({
      entry: { exerciseId: "run-5K", achievedAt: 0, timeSec: 25 * 60, distanceM: 5000 },
      unitMode: "time-distance",
      existingBests: bests,
      cardioSlot: "5K",
    });
    expect(r.slotsBeaten).not.toContain("5K");
  });
});

describe("detectPR watts", () => {
  it("higher watts beats", () => {
    const r = detectPR({
      entry: { exerciseId: "bike-ftp", achievedAt: 0, watts: 280 },
      unitMode: "watts",
      existingBests: new Map([["ftp", 250]]),
      cardioSlot: "ftp",
    });
    expect(r.slotsBeaten).toContain("ftp");
  });
});

describe("detectPR duration-hold", () => {
  it("longer hold beats", () => {
    const r = detectPR({
      entry: { exerciseId: "plank", achievedAt: 0, timeSec: 180 },
      unitMode: "duration-hold",
      existingBests: new Map([["longest-duration", 120]]),
    });
    expect(r.slotsBeaten).toContain("longest-duration");
  });
});
