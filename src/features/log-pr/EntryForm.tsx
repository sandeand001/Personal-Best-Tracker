import { useState } from "react";
import type { Entry, ExerciseDef } from "../../domain/types";
import { lbToKg, miToM, parseHmsToSec } from "../../domain/units/conversions";

interface EntryFormProps {
  exercise: ExerciseDef;
  onSubmit: (entry: Entry, notes?: string) => Promise<void>;
  onChangeExercise?: () => void;
  error: string | null;
  weightUnit: "lb" | "kg";
  distanceUnit: "mi" | "km";
  /** When true, hide the title row (caller renders its own header). */
  compact?: boolean;
}

export function EntryForm({
  exercise,
  onSubmit,
  onChangeExercise,
  error,
  weightUnit,
  distanceUnit,
  compact,
}: EntryFormProps) {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [time, setTime] = useState("");
  const [distance, setDistance] = useState("");
  const [watts, setWatts] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const achievedAt = date ? new Date(date).getTime() : Date.now();
    const entry: Entry = { exerciseId: exercise.id, achievedAt };

    try {
      if (exercise.unitMode === "wxr") {
        const w = parseFloat(weight);
        const r = parseInt(reps, 10);
        if (!w || !r) { setSubmitting(false); return; }
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
        if (!w) { setSubmitting(false); return; }
        entry.watts = w;
      } else if (exercise.unitMode === "duration-hold") {
        if (time) entry.timeSec = parseHmsToSec(time);
      }
    } catch {
      setSubmitting(false);
      return;
    }
    await onSubmit(entry, notes || undefined);
    setSubmitting(false);
  };

  const inputClass = "w-full px-3 py-2 rounded border outline-none";
  const inputStyle = { borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!compact && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>{exercise.name}</h2>
          {onChangeExercise && (
            <button type="button" onClick={onChangeExercise} className="text-sm" style={{ color: "var(--accent)" }}>
              Change
            </button>
          )}
        </div>
      )}

      {exercise.unitMode === "wxr" && (
        <>
          <Field label={`Weight (${weightUnit})`}>
            <input type="number" step="0.5" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} required autoFocus className={inputClass} style={inputStyle} />
          </Field>
          <Field label="Reps">
            <input type="number" inputMode="numeric" value={reps} onChange={(e) => setReps(e.target.value)} required className={inputClass} style={inputStyle} />
          </Field>
        </>
      )}

      {(exercise.unitMode === "time-distance" || exercise.unitMode === "time" || exercise.unitMode === "duration-hold") && (
        <Field label="Time (mm:ss or h:mm:ss)">
          <input type="text" inputMode="numeric" placeholder="e.g. 22:30" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} style={inputStyle} />
        </Field>
      )}

      {exercise.unitMode === "time-distance" && (
        <Field label={`Distance (${distanceUnit})`}>
          <input type="number" step="0.01" inputMode="decimal" value={distance} onChange={(e) => setDistance(e.target.value)} className={inputClass} style={inputStyle} />
        </Field>
      )}

      {exercise.unitMode === "watts" && (
        <Field label="Watts">
          <input type="number" inputMode="numeric" value={watts} onChange={(e) => setWatts(e.target.value)} required className={inputClass} style={inputStyle} />
        </Field>
      )}

      <Field label="Date">
        <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} style={inputStyle} />
      </Field>

      <Field label="Notes (optional)">
        <input type="text" value={notes} maxLength={200} onChange={(e) => setNotes(e.target.value)} className={inputClass} style={inputStyle} />
      </Field>

      {error && (
        <div className="rounded p-3 text-sm" style={{ background: "color-mix(in srgb, var(--tier-bronze) 15%, transparent)", color: "var(--tier-bronze)" }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={submitting} className="w-full py-3 rounded-lg font-bold transition disabled:opacity-60" style={{ background: "var(--accent)", color: "var(--bg)" }}>
        {submitting ? "Submitting…" : "Submit PR"}
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
