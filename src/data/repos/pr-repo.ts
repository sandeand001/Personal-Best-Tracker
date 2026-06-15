import { db } from "../db";
import type { PRRecord } from "../../domain/types";

export const prRepo = {
  async add(record: PRRecord): Promise<void> {
    await db.prs.add(record);
  },
  async update(id: string, patch: Partial<PRRecord>): Promise<void> {
    await db.prs.update(id, patch);
  },
  async remove(id: string): Promise<void> {
    await db.prs.delete(id);
  },
  async getById(id: string): Promise<PRRecord | undefined> {
    return db.prs.get(id);
  },
  async getAll(): Promise<PRRecord[]> {
    return db.prs.orderBy("achievedAt").reverse().toArray();
  },
  async byExercise(exerciseId: string): Promise<PRRecord[]> {
    return db.prs.where("exerciseId").equals(exerciseId).toArray();
  },
  async clear(): Promise<void> {
    await db.prs.clear();
  },
};
