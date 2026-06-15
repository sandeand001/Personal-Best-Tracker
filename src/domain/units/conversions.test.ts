import { describe, it, expect } from "vitest";
import {
  lbToKg,
  kgToLb,
  miToM,
  mToMi,
  secToHmsString,
  parseHmsToSec,
} from "./conversions";

describe("weight conversions", () => {
  it("round-trips", () => {
    expect(kgToLb(lbToKg(225))).toBeCloseTo(225, 6);
    expect(lbToKg(kgToLb(100))).toBeCloseTo(100, 6);
  });
  it("known anchors", () => {
    expect(lbToKg(225)).toBeCloseTo(102.058, 2);
  });
});

describe("distance conversions", () => {
  it("round-trips", () => {
    expect(mToMi(miToM(5))).toBeCloseTo(5, 6);
  });
});

describe("secToHmsString", () => {
  it.each([
    [0, "0:00"],
    [5, "0:05"],
    [65, "1:05"],
    [3600, "1:00:00"],
    [3725, "1:02:05"],
  ])("%i sec -> %s", (sec, str) => {
    expect(secToHmsString(sec)).toBe(str);
  });
});

describe("parseHmsToSec", () => {
  it.each([
    ["0:05", 5],
    ["1:05", 65],
    ["1:00:00", 3600],
    ["1:02:05", 3725],
  ])("%s -> %i", (str, sec) => {
    expect(parseHmsToSec(str)).toBe(sec);
  });
  it("round-trips through string", () => {
    expect(parseHmsToSec(secToHmsString(7325))).toBe(7325);
  });
  it("rejects bad input", () => {
    expect(() => parseHmsToSec("abc")).toThrow();
    expect(() => parseHmsToSec("1:2:3:4")).toThrow();
  });
});
