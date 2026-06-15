import { db, DEFAULT_SETTINGS, type SettingsState } from "../db";

export const settingsRepo = {
  async get(): Promise<SettingsState> {
    const row = await db.settings.get("singleton");
    return row?.value ?? DEFAULT_SETTINGS;
  },
  async set(state: SettingsState): Promise<void> {
    await db.settings.put({ key: "singleton", value: state });
  },
  async update(patch: Partial<SettingsState>): Promise<SettingsState> {
    const cur = await this.get();
    const next: SettingsState = {
      ...cur,
      ...patch,
      units: { ...cur.units, ...(patch.units ?? {}) },
    };
    await this.set(next);
    return next;
  },
};
