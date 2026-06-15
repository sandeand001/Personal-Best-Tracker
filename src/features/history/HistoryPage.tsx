import { Link } from "react-router-dom";
import { useState } from "react";
import { useAppStore } from "../../app/store";
import { TierBadge } from "../../components/TierBadge";
import { kgToLb, secToHmsString, mToMi } from "../../domain/units/conversions";
import type { MuscleGroup } from "../../domain/types";

export function HistoryPage() {
  const exercises = useAppStore((s) => s.exercises);
  const prs = useAppStore((s) => s.prs);
  const settings = useAppStore((s) => s.settings);
  const [groupFilter, setGroupFilter] = useState<MuscleGroup | "all">("all");

  const filtered = prs.filter((p) => {
    if (groupFilter === "all") return true;
    const def = exercises.find((e) => e.id === p.exerciseId);
    return def?.muscleGroup === groupFilter;
  });

  const groups: (MuscleGroup | "all")[] = ["all", "chest", "back", "shoulders", "arms", "legs", "core", "engine"];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>History</h1>

      <div className="flex flex-wrap gap-2">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setGroupFilter(g)}
            className={`px-3 py-1 rounded-full text-xs ${groupFilter === g ? "font-semibold" : "opacity-70"}`}
            style={{
              border: `1px solid ${groupFilter === g ? "var(--accent)" : "var(--border)"}`,
              color: groupFilter === g ? "var(--accent)" : "var(--text)",
              background: groupFilter === g ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No PRs logged yet.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const def = exercises.find((e) => e.id === p.exerciseId);
            const valueLabel =
              def?.unitMode === "wxr" && p.weightKg != null
                ? `${settings.units.weight === "lb" ? kgToLb(p.weightKg).toFixed(1) + " lb" : p.weightKg.toFixed(1) + " kg"} × ${p.reps}`
                : p.timeSec != null
                  ? secToHmsString(p.timeSec)
                  : p.watts
                    ? `${p.watts} W`
                    : p.distanceM
                      ? settings.units.distance === "mi" ? `${mToMi(p.distanceM).toFixed(2)} mi` : `${(p.distanceM / 1000).toFixed(2)} km`
                      : "—";
            return (
              <Link
                key={p.id}
                to={`/exercise/${p.exerciseId}`}
                className="block rounded-lg border p-3"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium">{def?.name ?? p.exerciseId}</div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(p.achievedAt).toLocaleDateString()} · {valueLabel}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{p.prSlots.join(", ")}</div>
                  </div>
                  {p.tierTrue && <TierBadge tier={p.tierTrue} size="sm" />}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
