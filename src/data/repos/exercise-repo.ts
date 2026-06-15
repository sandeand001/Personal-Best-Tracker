import { db } from "../db";
import type { ExerciseDef, MuscleGroup } from "../../domain/types";

export const exerciseRepo = {
  async getAll(): Promise<ExerciseDef[]> {
    return db.exercises.toArray();
  },
  async getById(id: string): Promise<ExerciseDef | undefined> {
    return db.exercises.get(id);
  },
  async byMuscleGroup(group: MuscleGroup): Promise<ExerciseDef[]> {
    return db.exercises.where("muscleGroup").equals(group).toArray();
  },
  async addCustom(def: ExerciseDef): Promise<void> {
    if (!def.custom) throw new Error("addCustom requires custom: true");
    await db.exercises.add(def);
  },
  async bulkUpsert(defs: ExerciseDef[]): Promise<void> {
    await db.exercises.bulkPut(defs);
  },
  async clear(): Promise<void> {
    await db.exercises.clear();
  },
};
