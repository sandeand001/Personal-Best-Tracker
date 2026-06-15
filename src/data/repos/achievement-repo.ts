import { db, type UserAchievementRecord } from "../db";

export const achievementRepo = {
  async getAll(): Promise<UserAchievementRecord[]> {
    return db.userAchievements.toArray();
  },
  async unlock(record: UserAchievementRecord): Promise<void> {
    await db.userAchievements.put(record);
  },
  async revoke(achievementId: string): Promise<void> {
    await db.userAchievements.delete(achievementId);
  },
  async isUnlocked(achievementId: string): Promise<boolean> {
    return (await db.userAchievements.get(achievementId)) !== undefined;
  },
  async clear(): Promise<void> {
    await db.userAchievements.clear();
  },
};
