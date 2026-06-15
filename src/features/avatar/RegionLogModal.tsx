import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore, regionPercentileFor, regionTier } from "../../app/store";
import { buildPRFromEntry } from "../../app/pr-builder";
import type { ExerciseDef, MuscleGroup, StatTab } from "../../domain/types";
import { ExercisePicker } from "../log-pr/ExercisePicker";
import { EntryForm } from "../log-pr/EntryForm";
import { TierBadge } from "../../components/TierBadge";
import { StatBar } from "../../components/StatBar";
import { nextTierThreshold } from "../../domain/tiers";

const REGION_LABELS: Record<MuscleGroup, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  arms: "Arms",
  legs: "Legs",
  core: "Core",
  engine: "Engine",
};

interface RegionLogModalProps {
  region: MuscleGroup | null;
  tab: StatTab;
  onClose: () => void;
}

export function RegionLogModal({ region, tab, onClose }: RegionLogModalProps) {
  const exercises = useAppStore((s) => s.exercises);
  const prs = useAppStore((s) => s.prs);
  const settings = useAppStore((s) => s.settings);
  const submitPR = useAppStore((s) => s.submitPR);
  const [picked, setPicked] = useState<ExerciseDef | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!region) return null;

  const pct = regionPercentileFor(prs, exercises, region, tab);
  const tier = regionTier(pct);

  const handleSubmit = async (entry: import("../../domain/types").Entry, notes?: string) => {
    setError(null);
    const result = buildPRFromEntry(entry, exercises, prs, notes);
    if (!result.ok || !result.record || !picked) {
      setError(result.reason ?? "Could not log PR.");
      return;
    }
    await submitPR(result.record, picked.name);
    onClose();
    setPicked(null);
  };

  return (
    <AnimatePresence>
      {region && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-6"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => { onClose(); setPicked(null); setError(null); }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="rounded-t-2xl sm:rounded-2xl p-5 pb-8 max-w-md w-full max-h-[90dvh] overflow-y-auto"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)",
          }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                  {REGION_LABELS[region]}
                </h2>
                {pct > 0 ? (
                  <div className="flex items-center gap-2 mt-1">
                    <TierBadge tier={tier} size="sm" />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {pct.toFixed(1)}th percentile
                    </span>
                  </div>
                ) : (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>Untrained</span>
                )}
              </div>
              <button
                onClick={() => { onClose(); setPicked(null); setError(null); }}
                className="text-2xl leading-none px-2"
                style={{ color: "var(--text-muted)" }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {pct > 0 && !picked && (
              <div className="mb-4">
                <StatBar percentile={pct} tier={tier} nextTier={nextTierThreshold(pct)} showLabel />
              </div>
            )}

            {!picked ? (
              <>
                <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
                  Pick an exercise to log a PR:
                </p>
                <ExercisePicker
                  exercises={exercises}
                  muscleGroup={region}
                  onPick={setPicked}
                  autoFocus
                />
                <Link
                  to={`/region/${region}`}
                  onClick={() => { onClose(); setPicked(null); }}
                  className="block text-center text-sm mt-4"
                  style={{ color: "var(--accent)" }}
                >
                  View full region details →
                </Link>
              </>
            ) : (
              <EntryForm
                exercise={picked}
                onChangeExercise={() => { setPicked(null); setError(null); }}
                onSubmit={handleSubmit}
                error={error}
                weightUnit={settings.units.weight}
                distanceUnit={settings.units.distance}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
