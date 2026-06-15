import { useState } from "react";
import { useAppStore } from "../../app/store";
import { SEED_ACHIEVEMENTS } from "../../data/seed/achievements";
import type { AchievementDef } from "../../domain/achievements/rules";

type FilterStatus = "all" | "unlocked" | "in-progress" | "hidden";

export function AchievementsPage() {
  const unlocked = useAppStore((s) => s.unlockedAchievements);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [category, setCategory] = useState<string | "all">("all");

  const allCategories = Array.from(new Set(SEED_ACHIEVEMENTS.map((a) => a.category)));

  const visible = SEED_ACHIEVEMENTS.filter((a) => {
    if (category !== "all" && a.category !== category) return false;
    const isUnlocked = unlocked.has(a.id);
    if (filter === "unlocked") return isUnlocked;
    if (filter === "hidden") return a.hidden && !isUnlocked;
    if (filter === "in-progress") return !isUnlocked && !a.hidden;
    return true;
  });

  const stats = {
    total: SEED_ACHIEVEMENTS.length,
    earned: SEED_ACHIEVEMENTS.filter((a) => unlocked.has(a.id)).length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Achievements</h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          {stats.earned}/{stats.total}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "unlocked", "in-progress", "hidden"] as FilterStatus[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs ${filter === f ? "font-semibold" : "opacity-70"}`}
            style={{
              border: `1px solid ${filter === f ? "var(--accent)" : "var(--border)"}`,
              color: filter === f ? "var(--accent)" : "var(--text)",
              background: filter === f ? "color-mix(in srgb, var(--accent) 10%, transparent)" : "transparent",
            }}
          >
            {f.replace("-", " ")}
          </button>
        ))}
      </div>

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="px-3 py-1.5 rounded border text-sm"
        style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
      >
        <option value="all">All categories</option>
        {allCategories.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visible.map((a) => (
          <AchievementCard key={a.id} achievement={a} unlocked={unlocked.has(a.id)} />
        ))}
        {visible.length === 0 && (
          <p className="col-span-full text-center" style={{ color: "var(--text-muted)" }}>
            No achievements match.
          </p>
        )}
      </div>
    </div>
  );
}

function AchievementCard({ achievement, unlocked }: { achievement: AchievementDef; unlocked: boolean }) {
  const showHidden = achievement.hidden && !unlocked;
  return (
    <div
      className="rounded-lg border p-4 transition"
      style={{
        borderColor: unlocked ? "var(--accent)" : "var(--border)",
        background: "var(--surface)",
        opacity: unlocked ? 1 : 0.7,
      }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-semibold">{showHidden ? "???" : achievement.title}</span>
        <span className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {achievement.rarity}
        </span>
      </div>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        {showHidden ? "Hidden achievement — earn to reveal." : achievement.description}
      </p>
      {unlocked && (
        <p className="text-xs mt-2" style={{ color: "var(--accent)" }}>✓ Unlocked</p>
      )}
    </div>
  );
}
