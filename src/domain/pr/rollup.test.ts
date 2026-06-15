import { describe, it, expect } from "vitest";
import { regionPercentile } from "./rollup";
import { balanceScore } from "./balance";

describe("regionPercentile", () => {
  it("max-of", () => {
    expect(regionPercentile([10, 50, 92, 33])).toBe(92);
  });
  it("empty -> 0", () => {
    expect(regionPercentile([])).toBe(0);
  });
});

describe("balanceScore", () => {
  it("single lift -> 1", () => {
    expect(balanceScore([90])).toBe(1);
  });
  it("identical lifts -> 5", () => {
    expect(balanceScore([90, 90, 90])).toBe(5);
  });
  it("specialist (one big, others zero) -> 1 or 2", () => {
    expect(balanceScore([90, 0, 0, 0])).toBeLessThanOrEqual(2);
  });
  it("well-rounded", () => {
    expect(balanceScore([80, 75, 78, 70])).toBeGreaterThanOrEqual(4);
  });
  it("all zeros -> 1", () => {
    expect(balanceScore([0, 0, 0])).toBe(1);
  });
});
