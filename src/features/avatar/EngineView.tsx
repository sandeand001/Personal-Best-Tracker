import { useNavigate } from "react-router-dom";
import { useAppStore, exercisePercentile, regionTier } from "../../app/store";
import type { StatTab } from "../../domain/types";
import { TierBadge } from "../../components/TierBadge";
import { StatBar } from "../../components/StatBar";

const SPORTS: { id: "run" | "bike" | "row" | "swim"; label: string; icon: string }[] = [
  { id: "run", label: "Run", icon: "🏃" },
  { id: "bike", label: "Bike", icon: "🚴" },
  { id: "row", label: "Row", icon: "🚣" },
  { id: "swim", label: "Swim", icon: "🏊" },
];

export function EngineView({ tab }: { tab: StatTab }) {
  const exercises = useAppStore((s) => s.exercises);
  const prs = useAppStore((s) => s.prs);
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {SPORTS.map((sport) => {
        const sportExercises = exercises.filter(
          (e) => e.muscleGroup === "engine" && e.subMuscle === sport.id
        );
        if (sportExercises.length === 0) return null;
        const sportPcts = sportExercises.map((e) =>
          exercisePercentile(prs, exercises, e.id, tab)
        );
        const max = Math.max(0, ...sportPcts);
        const tier = regionTier(max);
        return (
          <div
            key={sport.id}
            className="rounded-lg border p-4"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{sport.icon}</span>
                <span className="font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {sport.label}
                </span>
              </div>
              {max > 0 && <TierBadge tier={tier} />}
            </div>
            <div className="grid gap-2">
              {sportExercises.map((ex) => {
                const pct = exercisePercentile(prs, exercises, ex.id, tab);
                const exTier = regionTier(pct);
                return (
                  <button
                    key={ex.id}
                    onClick={() => navigate(`/exercise/${ex.id}`)}
                    className="text-left grid grid-cols-[1fr_auto] gap-2 items-center hover:opacity-80"
                  >
                    <div>
                      <div className="text-sm">{ex.name}</div>
                      {pct > 0 ? (
                        <StatBar percentile={pct} tier={exTier} />
                      ) : (
                        <div className="text-xs" style={{ color: "var(--text-muted)" }}>—</div>
                      )}
                    </div>
                    {pct > 0 && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{pct.toFixed(0)}th</span>}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
