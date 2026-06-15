import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store";
import { TierBadge } from "../../components/TierBadge";
import { tierForPercentile } from "../../domain/tiers";
import { kgToLb, secToHmsString, mToMi } from "../../domain/units/conversions";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function ExerciseDetailPage() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const exercises = useAppStore((s) => s.exercises);
  const allPRs = useAppStore((s) => s.prs);
  const settings = useAppStore((s) => s.settings);
  const deletePR = useAppStore((s) => s.deletePR);
  const navigate = useNavigate();

  const exercise = exercises.find((e) => e.id === exerciseId);
  const prs = allPRs.filter((p) => p.exerciseId === exerciseId).sort((a, b) => a.achievedAt - b.achievedAt);

  if (!exercise) return <p>Exercise not found.</p>;

  const isStrength = exercise.unitMode === "wxr";
  const repBrackets = [1, 3, 5, 8, 12] as const;

  const formatWeight = (kg?: number) =>
    kg == null ? "—" : settings.units.weight === "lb" ? `${kgToLb(kg).toFixed(1)} lb` : `${kg.toFixed(1)} kg`;
  const formatDistance = (m?: number) =>
    m == null ? "—" : settings.units.distance === "mi" ? `${mToMi(m).toFixed(2)} mi` : `${(m / 1000).toFixed(2)} km`;

  const chartData = prs.map((p) => ({
    date: new Date(p.achievedAt).toLocaleDateString(),
    e1rm: p.e1rmKg ? (settings.units.weight === "lb" ? kgToLb(p.e1rmKg) : p.e1rmKg) : null,
    weight: p.weightKg ? (settings.units.weight === "lb" ? kgToLb(p.weightKg) : p.weightKg) : null,
    time: p.timeSec ?? null,
    distance: p.distanceM ?? null,
    watts: p.watts ?? null,
  }));

  return (
    <div className="space-y-4">
      <button onClick={() => navigate(-1)} className="text-sm" style={{ color: "var(--accent)" }}>← Back</button>
      <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{exercise.name}</h1>

      {prs.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No PRs yet for this exercise.</p>
      ) : (
        <>
          {isStrength && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {repBrackets.map((rb) => {
                const best = prs
                  .filter((p) => p.reps != null && p.reps >= rb && p.weightKg != null)
                  .reduce((m, p) => (p.weightKg && p.weightKg > m ? p.weightKg : m), 0);
                return (
                  <div
                    key={rb}
                    className="rounded border p-2 text-center"
                    style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  >
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>{rb}RM</div>
                    <div className="font-bold">{best > 0 ? formatWeight(best) : "—"}</div>
                  </div>
                );
              })}
            </div>
          )}

          {chartData.length >= 2 && (
            <div className="rounded-lg border p-2" style={{ borderColor: "var(--border)", background: "var(--surface)", height: 220 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)" }} />
                  {isStrength && <Line type="monotone" dataKey="e1rm" stroke="var(--accent)" name="e1RM" />}
                  {isStrength && <Line type="monotone" dataKey="weight" stroke="var(--tier-platinum)" name="Weight" />}
                  {!isStrength && <Line type="monotone" dataKey="time" stroke="var(--accent)" name="Time" />}
                  {!isStrength && <Line type="monotone" dataKey="watts" stroke="var(--tier-gold)" name="Watts" />}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          <h2 className="text-lg font-semibold">All PRs</h2>
          <div className="space-y-2">
            {prs.slice().reverse().map((p) => (
              <div
                key={p.id}
                className="rounded-lg border p-3"
                style={{ borderColor: "var(--border)", background: "var(--surface)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium">
                      {isStrength
                        ? `${formatWeight(p.weightKg)} × ${p.reps}`
                        : p.timeSec != null
                          ? secToHmsString(p.timeSec)
                          : p.watts
                            ? `${p.watts} W`
                            : p.distanceM
                              ? formatDistance(p.distanceM)
                              : "—"}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {new Date(p.achievedAt).toLocaleString()} · {p.prSlots.join(", ")}
                    </div>
                    {p.notes && <div className="text-xs italic mt-1" style={{ color: "var(--text-muted)" }}>{p.notes}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    {p.tierTrue && <TierBadge tier={p.tierTrue} size="sm" />}
                    <button
                      onClick={() => {
                        if (confirm("Delete this PR? Stats will recompute.")) deletePR(p.id);
                      }}
                      className="text-xs"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Helper just to satisfy unused-import lint
void tierForPercentile;
