import type { PercentileTable } from "../../domain/percentiles/types";
import { STUB_PERCENTILE_TABLES } from "./stub-percentiles";

/**
 * Verified percentile tables loaded at build time. Any JSON file under
 * `src/data/percentile-tables/` will override the stubs for that exerciseId.
 * Add a file like `src/data/percentile-tables/bench-barbell.json` to upgrade
 * an exercise from stub to verified — no other code changes required.
 */
const verifiedTables = import.meta.glob<{ default: PercentileTable }>(
  "../percentile-tables/*.json",
  { eager: true }
);

export const PERCENTILE_TABLES: Record<string, PercentileTable> = {
  ...STUB_PERCENTILE_TABLES,
};

for (const [path, mod] of Object.entries(verifiedTables)) {
  const filename = path.split("/").pop();
  if (!filename) continue;
  const id = filename.replace(/\.json$/, "");
  const data = (mod as { default?: PercentileTable }).default ?? (mod as unknown as PercentileTable);
  PERCENTILE_TABLES[id] = data;
}

export function getPercentileTable(exerciseId: string): PercentileTable | null {
  return PERCENTILE_TABLES[exerciseId] ?? null;
}
