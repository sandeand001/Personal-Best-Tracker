import { describe, it, expect } from "vitest";
import { resolvePercentileExerciseId } from "./variants";
import type { ExerciseDef } from "../types";

const base: Omit<ExerciseDef, "id" | "ranked" | "isVariant" | "custom"> = {
  name: "x",
  category: "strength",
  muscleGroup: "chest",
  unitMode: "wxr",
};

describe("resolvePercentileExerciseId", () => {
  it("ranked -> own id", () => {
    expect(
      resolvePercentileExerciseId({
        ...base,
        id: "bench",
        ranked: true,
        isVariant: false,
        custom: false,
      })
    ).toBe("bench");
  });
  it("variant -> parent id", () => {
    expect(
      resolvePercentileExerciseId({
        ...base,
        id: "paused-bench",
        ranked: false,
        isVariant: true,
        parentExerciseId: "bench",
        custom: false,
      })
    ).toBe("bench");
  });
  it("custom -> null", () => {
    expect(
      resolvePercentileExerciseId({
        ...base,
        id: "zercher-squat",
        ranked: false,
        isVariant: false,
        custom: true,
      })
    ).toBeNull();
  });
  it("unranked non-variant non-custom -> null", () => {
    expect(
      resolvePercentileExerciseId({
        ...base,
        id: "x",
        ranked: false,
        isVariant: false,
        custom: false,
      })
    ).toBeNull();
  });
});
