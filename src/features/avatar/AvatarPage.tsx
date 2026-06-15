import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore, regionPercentileFor, regionTier } from "../../app/store";
import type { MuscleGroup, StatTab } from "../../domain/types";
import { AvatarSVG } from "../../components/AvatarSVG";
import { TierBadge } from "../../components/TierBadge";
import { StatBar } from "../../components/StatBar";
import { nextTierThreshold } from "../../domain/tiers";
import { EngineView } from "./EngineView";

const REGION_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  core: "Core",
  engine: "Engine",
};

export function AvatarPage() {
  const exercises = useAppStore((s) => s.exercises);
  const prs = useAppStore((s) => s.prs);
  const initialized = useAppStore((s) => s.initialized);
  const navigate = useNavigate();

  const [tab, setTab] = useState<StatTab>("true");
  const [view, setView] = useState<"front" | "back" | "engine">("front");

  if (!initialized) {
    return <p className="text-center" style={{ color: "var(--text-muted)" }}>Loading…</p>;
  }

  const regions: MuscleGroup[] =
    view === "front"
      ? ["shoulders", "chest", "arms", "core", "legs"]
      : view === "back"
        ? ["shoulders", "back", "arms", "legs"]
        : ["engine"];

  const regionPcts = new Map<MuscleGroup, number>();
  for (const r of regions) {
    regionPcts.set(r, regionPercentileFor(prs, exercises, r, tab));
  }

  return (
    <div className="space-y-4">
      <Tabs
        options={[
          { id: "true", label: "True 1RM" },
          { id: "e1rm", label: "e1RM" },
        ]}
        value={tab}
        onChange={(v) => setTab(v as StatTab)}
      />
      <Tabs
        options={[
          { id: "front", label: "Front" },
          { id: "back", label: "Back" },
          { id: "engine", label: "Engine" },
        ]}
        value={view}
        onChange={(v) => setView(v as "front" | "back" | "engine")}
        small
      />

      {view === "engine" ? (
        <EngineView tab={tab} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
          <div className="aspect-[1/2] max-w-xs mx-auto">
            <AvatarSVG
              view={view}
              regionPercentiles={regionPcts}
              onRegionClick={(r) => navigate(`/region/${r}`)}
              tab={tab}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-2 sm:max-w-xs">
            {regions.map((r) => {
              const pct = regionPcts.get(r) ?? 0;
              const tier = regionTier(pct);
              return (
                <button
                  key={r}
                  onClick={() => navigate(`/region/${r}`)}
                  className="text-left rounded-lg p-3 border hover:scale-[1.01] transition"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">{REGION_LABELS[r]}</span>
                    {pct > 0 && <TierBadge tier={tier} size="sm" />}
                  </div>
                  {pct > 0 ? (
                    <StatBar
                      percentile={pct}
                      tier={tier}
                      nextTier={nextTierThreshold(pct)}
                      showLabel
                    />
                  ) : (
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      Untrained — log a PR to begin.
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface TabsProps {
  options: { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  small?: boolean;
}
function Tabs({ options, value, onChange, small }: TabsProps) {
  return (
    <div
      className={`inline-flex rounded-lg p-1 border ${small ? "text-sm" : ""}`}
      style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          onClick={() => onChange(opt.id)}
          className={`px-3 py-1.5 rounded-md transition ${
            value === opt.id ? "font-semibold" : "opacity-70 hover:opacity-100"
          }`}
          style={
            value === opt.id
              ? { background: "var(--surface)", color: "var(--accent)" }
              : { color: "var(--text)" }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
