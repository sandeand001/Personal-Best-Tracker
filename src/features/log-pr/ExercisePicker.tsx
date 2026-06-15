import { useMemo, useState } from "react";
import type { ExerciseDef, MuscleGroup } from "../../domain/types";

interface ExercisePickerProps {
  exercises: ExerciseDef[];
  /** When provided, only exercises matching this muscle group are shown. */
  muscleGroup?: MuscleGroup;
  onPick: (exercise: ExerciseDef) => void;
  autoFocus?: boolean;
}

export function ExercisePicker({ exercises, muscleGroup, onPick, autoFocus }: ExercisePickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return exercises
      .filter((e) => !e.custom)
      .filter((e) => (muscleGroup ? e.muscleGroup === muscleGroup : true))
      .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
  }, [exercises, muscleGroup, search]);

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder={muscleGroup ? `Search ${muscleGroup} exercises…` : "Search exercises…"}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        autoFocus={autoFocus}
        className="w-full px-3 py-2 rounded-lg border outline-none focus:ring-2"
        style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
      />
      <div className="space-y-1 max-h-[50vh] overflow-y-auto">
        {filtered.map((e) => (
          <button
            key={e.id}
            onClick={() => onPick(e)}
            className="w-full text-left px-3 py-2 rounded border hover:opacity-80"
            style={{ borderColor: "var(--border)", background: "var(--surface)" }}
          >
            <div className="text-sm font-medium">{e.name}</div>
            <div className="text-xs" style={{ color: "var(--text-muted)" }}>
              {e.muscleGroup} · {e.unitMode}
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-center py-4" style={{ color: "var(--text-muted)" }}>
            No matching exercises.
          </p>
        )}
      </div>
    </div>
  );
}
