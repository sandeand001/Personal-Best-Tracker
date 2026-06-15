import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store";
import { buildPRFromEntry } from "../../app/pr-builder";
import type { ExerciseDef } from "../../domain/types";
import { ExercisePicker } from "./ExercisePicker";
import { EntryForm } from "./EntryForm";

export function LogPRPage() {
  const exercises = useAppStore((s) => s.exercises);
  const prs = useAppStore((s) => s.prs);
  const submitPR = useAppStore((s) => s.submitPR);
  const settings = useAppStore((s) => s.settings);
  const navigate = useNavigate();

  const [pickedExercise, setPickedExercise] = useState<ExerciseDef | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!pickedExercise) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Log a PR</h1>
        <ExercisePicker exercises={exercises} onPick={setPickedExercise} autoFocus />
      </div>
    );
  }

  return (
    <EntryForm
      exercise={pickedExercise}
      onChangeExercise={() => { setPickedExercise(null); setError(null); }}
      onSubmit={async (entry, notes) => {
        setError(null);
        const result = buildPRFromEntry(entry, exercises, prs, notes);
        if (!result.ok || !result.record) {
          setError(result.reason ?? "Could not log PR.");
          return;
        }
        await submitPR(result.record, pickedExercise.name);
        navigate("/");
      }}
      error={error}
      weightUnit={settings.units.weight}
      distanceUnit={settings.units.distance}
    />
  );
}
