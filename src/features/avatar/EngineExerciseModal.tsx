import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppStore } from "../../app/store";
import { buildPRFromEntry } from "../../app/pr-builder";
import type { ExerciseDef } from "../../domain/types";
import { EntryForm } from "../log-pr/EntryForm";

interface EngineExerciseModalProps {
  exercise: ExerciseDef | null;
  onClose: () => void;
}

export function EngineExerciseModal({ exercise, onClose }: EngineExerciseModalProps) {
  const exercises = useAppStore((s) => s.exercises);
  const prs = useAppStore((s) => s.prs);
  const settings = useAppStore((s) => s.settings);
  const submitPR = useAppStore((s) => s.submitPR);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (entry: import("../../domain/types").Entry, notes?: string) => {
    if (!exercise) return;
    setError(null);
    const result = buildPRFromEntry(entry, exercises, prs, notes);
    if (!result.ok || !result.record) {
      setError(result.reason ?? "Could not log PR.");
      return;
    }
    await submitPR(result.record, exercise.name);
    onClose();
  };

  return (
    <AnimatePresence>
      {exercise && (
        <motion.div
          key="bd"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-6"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={() => { onClose(); setError(null); }}
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
              <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                {exercise.name}
              </h2>
              <button
                onClick={() => { onClose(); setError(null); }}
                className="text-2xl leading-none px-2"
                style={{ color: "var(--text-muted)" }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <EntryForm
              exercise={exercise}
              onSubmit={handleSubmit}
              error={error}
              weightUnit={settings.units.weight}
              distanceUnit={settings.units.distance}
              compact
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
