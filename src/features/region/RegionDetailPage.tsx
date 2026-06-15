import { useParams, useNavigate, Link } from "react-router-dom";
import { useAppStore, exercisePercentile, regionPercentileFor, regionTier } from "../../app/store";
import type { MuscleGroup, StatTab } from "../../domain/types";
import { TierBadge } from "../../components/TierBadge";
import { StatBar } from "../../components/StatBar";
import { nextTierThreshold } from "../../domain/tiers";
import { balanceScore } from "../../domain/pr/balance";
import { useState } from "react";

const REGION_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  core: "Core",
  engine: "Engine",
};

export function RegionDetailPage() {
  const { region } = useParams<{ region: MuscleGroup }>();
  const exercises = useAppStore((s) => s.exercises);
  const prs = useAppStore((s) => s.prs);
  const navigate = useNavigate();
  const [tab, setTab] = useState<StatTab>("true");

  if (!region) return <p>Region not found.</p>;
  const r = region as MuscleGroup;

  const contributingExercises = exercises.filter(
    (e) => e.muscleGroup === r && e.ranked && !e.custom
  );

  const pct = regionPercentileFor(prs, exercises, r, tab);
  const tier = regionTier(pct);
  const exercisePcts = contributingExercises.map((e) => ({
    ex: e,
    pct: exercisePercentile(prs, exercises, e.id, tab),
  }));
  const trained = exercisePcts.filter((x) => x.pct > 0);
  const balance = balanceScore(trained.map((x) => x.pct));

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm" style={{ color: "var(--accent)" }}>← Back</button>

      <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
        {REGION_LABELS[r]}
      </h1>

      <div className="inline-flex rounded-lg p-1 border" style={{ borderColor: "var(--border)" }}>
        {(["true", "e1rm"] as StatTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1 rounded-md text-sm ${tab === t ? "font-semibold" : "opacity-70"}`}
            style={tab === t ? { color: "var(--accent)", background: "var(--surface)" } : { color: "var(--text)" }}
          >
            {t === "true" ? "True 1RM" : "e1RM"}
          </button>
        ))}
      </div>

      <div className="rounded-lg border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-3xl font-bold" style={{ color: "var(--text)" }}>{pct.toFixed(1)}<span className="text-base font-normal opacity-60"> percentile</span></span>
          {pct > 0 && <TierBadge tier={tier} size="lg" />}
        </div>
        {pct > 0 ? (
          <StatBar percentile={pct} tier={tier} nextTier={nextTierThreshold(pct)} showLabel />
        ) : (
          <p style={{ color: "var(--text-muted)" }}>No PRs in this region yet.</p>
        )}

        {trained.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
            <span>Balance:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((d) => (
                <span
                  key={d}
                  className="w-2 h-2 rounded-full"
                  style={{ background: d <= balance ? "var(--accent)" : "var(--border)" }}
                />
              ))}
            </div>
            <span>{balance}/5</span>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Contributing lifts</h2>
        <div className="space-y-2">
          {exercisePcts.map(({ ex, pct }) => {
            const tier = regionTier(pct);
            return (
              <Link
                to={`/exercise/${ex.id}`}
                key={ex.id}
                className="block rounded-lg border p-3 hover:scale-[1.01] transition"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span>{ex.name}</span>
                  {pct > 0 ? <TierBadge tier={tier} size="sm" /> : <span className="text-xs" style={{ color: "var(--text-muted)" }}>—</span>}
                </div>
                {pct > 0 && <StatBar percentile={pct} tier={tier} />}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
