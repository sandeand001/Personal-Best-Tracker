import { describe, it, expect } from "vitest";
import { epley, isE1rmEligible, E1RM_REP_CAP } from "./index";

describe("epley", () => {
  it("returns weight at 1 rep", () => {
    expect(epley(100, 1)).toBeCloseTo(100 * (1 + 1 / 30));
  });
  it("scales monotonically with reps", () => {
    expect(epley(100, 5)).toBeGreaterThan(epley(100, 1));
    expect(epley(100, 8)).toBeGreaterThan(epley(100, 5));
  });
  it("rejects reps above cap", () => {
    expect(() => epley(100, E1RM_REP_CAP + 1)).toThrow();
  });
  it("rejects non-positive weight", () => {
    expect(() => epley(0, 1)).toThrow();
    expect(() => epley(-1, 1)).toThrow();
  });
});

describe("isE1rmEligible", () => {
  it("true within range", () => {
    for (let r = 1; r <= 8; r++) expect(isE1rmEligible(r)).toBe(true);
  });
  it("false outside range or non-integer", () => {
    expect(isE1rmEligible(0)).toBe(false);
    expect(isE1rmEligible(9)).toBe(false);
    expect(isE1rmEligible(1.5)).toBe(false);
  });
});
