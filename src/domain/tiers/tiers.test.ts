import { describe, it, expect } from "vitest";
import { tierForPercentile, nextTierThreshold } from "./index";

describe("tierForPercentile", () => {
  it.each([
    [0, "iron"],
    [19.99, "iron"],
    [20, "bronze"],
    [39.99, "bronze"],
    [40, "silver"],
    [60, "gold"],
    [80, "platinum"],
    [94.99, "platinum"],
    [95, "diamond"],
    [99, "mythic"],
    [99.9, "legend"],
    [100, "legend"],
  ])("p=%s -> %s", (p, t) => {
    expect(tierForPercentile(p)).toBe(t);
  });

  it("throws on out-of-range", () => {
    expect(() => tierForPercentile(-1)).toThrow();
    expect(() => tierForPercentile(101)).toThrow();
    expect(() => tierForPercentile(NaN)).toThrow();
  });
});

describe("nextTierThreshold", () => {
  it("returns the next breakpoint", () => {
    expect(nextTierThreshold(15)).toBe(20);
    expect(nextTierThreshold(50)).toBe(60);
    expect(nextTierThreshold(95)).toBe(99);
  });
  it("returns null at the top", () => {
    expect(nextTierThreshold(99.95)).toBeNull();
  });
});
