import { describe, it, expect } from "vitest";
import { lookupPercentile } from "./lookup";
import type { PercentileTable } from "./types";

const ascTable: PercentileTable = {
  exerciseId: "bench",
  direction: "asc",
  points: [
    { value: 60, percentile: 10 },
    { value: 100, percentile: 50 },
    { value: 140, percentile: 90 },
  ],
};

const descTable: PercentileTable = {
  exerciseId: "5K",
  direction: "desc",
  points: [
    { value: 30 * 60, percentile: 10 }, // 30:00 = 10th percentile (slow)
    { value: 25 * 60, percentile: 50 }, // 25:00 = 50th
    { value: 20 * 60, percentile: 90 }, // 20:00 = 90th (fast)
  ],
};

describe("lookupPercentile asc", () => {
  it("interpolates", () => {
    expect(lookupPercentile(ascTable, 80)).toBe(30);
    expect(lookupPercentile(ascTable, 120)).toBe(70);
  });
  it("clamps below min to lowest percentile", () => {
    expect(lookupPercentile(ascTable, 0)).toBe(10);
  });
  it("clamps above max to highest percentile", () => {
    expect(lookupPercentile(ascTable, 200)).toBe(90);
  });
  it("hits exact points", () => {
    expect(lookupPercentile(ascTable, 100)).toBe(50);
  });
});

describe("lookupPercentile desc (cardio times)", () => {
  it("faster time -> higher percentile", () => {
    expect(lookupPercentile(descTable, 22 * 60)).toBeCloseTo(74);
    expect(lookupPercentile(descTable, 28 * 60)).toBeCloseTo(26);
  });
  it("clamps above worst to lowest", () => {
    expect(lookupPercentile(descTable, 60 * 60)).toBe(10);
  });
  it("clamps below best to highest", () => {
    expect(lookupPercentile(descTable, 10 * 60)).toBe(90);
  });
});

describe("edge cases", () => {
  it("empty table returns 0", () => {
    expect(
      lookupPercentile(
        { exerciseId: "x", direction: "asc", points: [] },
        50
      )
    ).toBe(0);
  });
  it("single-point table returns that percentile", () => {
    expect(
      lookupPercentile(
        { exerciseId: "x", direction: "asc", points: [{ value: 100, percentile: 50 }] },
        200
      )
    ).toBe(50);
  });
});
