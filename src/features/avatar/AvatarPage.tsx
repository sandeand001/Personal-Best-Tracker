import { useState } from "react";
import { useAppStore, regionPercentileFor, regionTier, topContributingExercise } from "../../app/store";
import type { MuscleGroup, StatTab } from "../../domain/types";
import { AvatarBody } from "../../components/AvatarBody";
import { TierBadge } from "../../components/TierBadge";
import { StatBar } from "../../components/StatBar";
import { nextTierThreshold } from "../../domain/tiers";
import { EngineView } from "./EngineView";
import { RegionLogModal } from "./RegionLogModal";
import { formatPRValue } from "../../components/format";

const REGION_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  core: "Core",
  engine: "Engine",
};

/**
 * Approximate (top%, side, sideOffset) per region per view, used to position
 * floating callouts around the avatar without overlapping it.
 */
const FRONT_POSITIONS: Record<Exclude<MuscleGroup, "engine">, { top: string; side: "left" | "right" }> = {
  shoulders: { top: "4%", side: "left" },
  chest: { top: "14%", side: "right" },
  arms: { top: "32%", side: "left" },
  core: { top: "38%", side: "right" },
  legs: { top: "62%", side: "left" },
  back: { top: "0%", side: "right" }, // unused in front view
};

const BACK_POSITIONS: Record<Exclude<MuscleGroup, "engine">, { top: string; side: "left" | "right" }> = {
  shoulders: { top: "4%", side: "right" },
  back: { top: "20%", side: "right" },
  arms: { top: "32%", side: "left" },
  legs: { top: "62%", side: "right" },
  chest: { top: "0%", side: "left" }, // unused in back view
  core: { top: "0%", side: "left" }, // unused in back view
};

export function AvatarPage() {
  const exercises = useAppStore((s) => s.exercises);
  const prs = useAppStore((s) => s.prs);
  const settings = useAppStore((s) => s.settings);
  const initialized = useAppStore((s) => s.initialized);

  const [tab, setTab] = useState<StatTab>("true");
  const [view, setView] = useState<"front" | "back" | "engine">("front");
  const [modalRegion, setModalRegion] = useState<MuscleGroup | null>(null);

  if (!initialized) {
    return <p className="text-center" style={{ color: "var(--text-muted)" }}>Loading…</p>;
  }

  const regions: Exclude<MuscleGroup, "engine">[] =
    view === "front"
      ? ["shoulders", "chest", "arms", "core", "legs"]
      : view === "back"
        ? ["shoulders", "back", "arms", "legs"]
        : [];

  const allRegions: MuscleGroup[] = ["shoulders", "chest", "back", "arms", "core", "legs", "engine"];
  const regionPcts = new Map<MuscleGroup, number>();
  for (const r of allRegions) {
    regionPcts.set(r, regionPercentileFor(prs, exercises, r, tab));
  }

  const positions = view === "front" ? FRONT_POSITIONS : BACK_POSITIONS;

  return (
    <div className="space-y-4">
      <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
        Percentiles calibrated against healthy adults (ACSM-aligned norms)
      </p>
      <div className="flex flex-wrap gap-2">
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
      </div>

      {view === "engine" ? (
        <EngineView tab={tab} />
      ) : (
        <>
          {/* Floating layout — desktop/tablet */}
          <div className="hidden sm:block relative mx-auto" style={{ maxWidth: 720, minHeight: 600 }}>
            <div className="absolute inset-0 flex justify-center items-start pt-2">
              <AvatarBody
                view={view as "front" | "back"}
                regionPercentiles={regionPcts}
                onRegionClick={(r) => setModalRegion(r)}
              />
            </div>
            {regions.map((r) => {
              const pos = positions[r];
              const pct = regionPcts.get(r) ?? 0;
              const top = topContributingExercise(prs, exercises, r, tab);
              const topLabel = top ? `${top.exercise.name} · ${formatPRValue(top.bestPR, top.exercise, settings)}` : undefined;
              return (
                <button
                  key={r}
                  onClick={() => setModalRegion(r)}
                  className="absolute text-left rounded-lg p-3 border w-44 hover:scale-[1.02] transition"
                  style={{
                    top: pos.top,
                    [pos.side]: 0,
                    borderColor: "var(--border)",
                    background: "color-mix(in srgb, var(--surface) 92%, transparent)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <RegionCardContent region={r} percentile={pct} topPRLabel={topLabel} />
                </button>
              );
            })}
          </div>

          {/* Stacked layout — mobile */}
          <div className="sm:hidden space-y-3">
            <div className="max-w-xs mx-auto">
              <AvatarBody
                view={view as "front" | "back"}
                regionPercentiles={regionPcts}
                onRegionClick={(r) => setModalRegion(r)}
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              {regions.map((r) => {
                const pct = regionPcts.get(r) ?? 0;
                const top = topContributingExercise(prs, exercises, r, tab);
                const topLabel = top ? `${top.exercise.name} · ${formatPRValue(top.bestPR, top.exercise, settings)}` : undefined;
                return (
                  <button
                    key={r}
                    onClick={() => setModalRegion(r)}
                    className="text-left rounded-lg p-3 border"
                    style={{ borderColor: "var(--border)", background: "var(--surface)" }}
                  >
                    <RegionCardContent region={r} percentile={pct} topPRLabel={topLabel} />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <RegionLogModal
        region={modalRegion}
        tab={tab}
        onClose={() => setModalRegion(null)}
      />
    </div>
  );
}

function RegionCardContent({ region, percentile, topPRLabel }: { region: MuscleGroup; percentile: number; topPRLabel?: string }) {
  const tier = regionTier(percentile);
  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold text-sm">{REGION_LABELS[region]}</span>
        {percentile > 0 && <TierBadge tier={tier} size="sm" />}
      </div>
      {percentile > 0 ? (
        <>
          <StatBar
            percentile={percentile}
            tier={tier}
            nextTier={nextTierThreshold(percentile)}
            showLabel
          />
          {topPRLabel && (
            <p className="text-[11px] mt-1 truncate" style={{ color: "var(--text-muted)" }} title={topPRLabel}>
              🏆 {topPRLabel}
            </p>
          )}
        </>
      ) : (
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Tap to log a PR.
        </p>
      )}
    </>
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
