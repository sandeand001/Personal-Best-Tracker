import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../app/store";
import { buildPRFromEntry } from "../../app/pr-builder";
import type { Entry, ExerciseDef } from "../../domain/types";
import { lbToKg, miToM, parseHmsToSec } from "../../domain/units/conversions";

export function LogPRPage() {
  const exercises = useAppStore((s) => s.exercises);
  const prs = useAppStore((s) => s.prs);
  const submitPR = useAppStore((s) => s.submitPR);
  const settings = useAppStore((s) => s.settings);
  const navigate = useNavigate();

  const [pickedExercise, setPickedExercise] = useState<ExerciseDef | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      exercises
        .filter((e) => !e.custom)
        .filter((e) => e.name.toLowerCase().includes(search.toLowerCase())),
    [exercises, search]
  );

  if (!pickedExercise) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Log a PR</h1>
        <input
          type="text"
          placeholder="Search exercises…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
          className="w-full px-3 py-2 rounded-lg border outline-none focus:ring-2"
          style={{
            borderColor: "var(--border)",
            background: "var(--surface)",
            color: "var(--text)",
          }}
        />
        <div className="space-y-1 max-h-[60vh] overflow-y-auto">
          {filtered.map((e) => (
            <button
              key={e.id}
              onClick={() => setPickedExercise(e)}
              className="w-full text-left px-3 py-2 rounded border hover:opacity-80"
              style={{ borderColor: "var(--border)", background: "var(--surface)" }}
            >
              <div className="text-sm font-medium">{e.name}</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                {e.muscleGroup} · {e.unitMode}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <EntryForm
      exercise={pickedExercise}
      onCancel={() => setPickedExercise(null)}
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

interface EntryFormProps {
  exercise: ExerciseDef;
  onSubmit: (entry: Entry, notes?: string) => Promise<void>;
  onCancel: () => void;
  error: string | null;
  weightUnit: "lb" | "kg";
  distanceUnit: "mi" | "km";
}
function EntryForm({ exercise, onSubmit, onCancel, error, weightUnit, distanceUnit }: EntryFormProps) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [time, setTime] = useState("");
  const [distance, setDistance] = useState("");
  const [watts, setWatts] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const achievedAt = date ? new Date(date).getTime() : Date.now();
    const entry: Entry = { exerciseId: exercise.id, achievedAt };

    try {
      if (exercise.unitMode === "wxr") {
        const w = parseFloat(weight);
        const r = parseInt(reps, 10);
        if (!w || !r) return;
        entry.weightKg = weightUnit === "lb" ? lbToKg(w) : w;
        entry.reps = r;
      } else if (exercise.unitMode === "time-distance") {
        if (time) entry.timeSec = parseHmsToSec(time);
        if (distance) {
          const d = parseFloat(distance);
          entry.distanceM = distanceUnit === "mi" ? miToM(d) : d * 1000;
        }
      } else if (exercise.unitMode === "time") {
        if (time) entry.timeSec = parseHmsToSec(time);
      } else if (exercise.unitMode === "watts") {
        const w = parseFloat(watts);
        if (!w) return;
        entry.watts = w;
      } else if (exercise.unitMode === "duration-hold") {
        if (time) entry.timeSec = parseHmsToSec(time);
      }
    } catch {
      return;
    }
    await onSubmit(entry, notes || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{exercise.name}</h1>
        <button type="button" onClick={onCancel} className="text-sm" style={{ color: "var(--accent)" }}>Change</button>
      </div>

      {exercise.unitMode === "wxr" && (
        <>
          <Field label={`Weight (${weightUnit})`}>
            <input
              type="number"
              step="0.5"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2 rounded border outline-none"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
            />
          </Field>
          <Field label="Reps">
            <input
              type="number"
              inputMode="numeric"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              required
              className="w-full px-3 py-2 rounded border outline-none"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
            />
          </Field>
        </>
      )}

      {(exercise.unitMode === "time-distance" || exercise.unitMode === "time" || exercise.unitMode === "duration-hold") && (
        <Field label="Time (mm:ss or h:mm:ss)">
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 22:30"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-3 py-2 rounded border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
          />
        </Field>
      )}

      {exercise.unitMode === "time-distance" && (
        <Field label={`Distance (${distanceUnit})`}>
          <input
            type="number"
            step="0.01"
            inputMode="decimal"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full px-3 py-2 rounded border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
          />
        </Field>
      )}

      {exercise.unitMode === "watts" && (
        <Field label="Watts">
          <input
            type="number"
            inputMode="numeric"
            value={watts}
            onChange={(e) => setWatts(e.target.value)}
            required
            className="w-full px-3 py-2 rounded border outline-none"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
          />
        </Field>
      )}

      <Field label="Date">
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 rounded border outline-none"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
        />
      </Field>

      <Field label="Notes (optional)">
        <input
          type="text"
          value={notes}
          maxLength={200}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 rounded border outline-none"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
        />
      </Field>

      {error && (
        <div className="rounded p-3 text-sm" style={{ background: "color-mix(in srgb, var(--tier-bronze) 15%, transparent)", color: "var(--tier-bronze)" }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full py-3 rounded-lg font-bold transition"
        style={{ background: "var(--accent)", color: "var(--bg)" }}
      >
        Submit PR
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm block mb-1" style={{ color: "var(--text-muted)" }}>{label}</span>
      {children}
    </label>
  );
}
