import { useRef, useState } from "react";
import { useAppStore } from "../../app/store";
import { exportAll, importAll } from "../../data/export-import";
import type { Theme } from "../../domain/types";

export function SettingsPage() {
  const settings = useAppStore((s) => s.settings);
  const updateSettings = useAppStore((s) => s.updateSettings);
  const resetAllData = useAppStore((s) => s.resetAllData);
  const refreshAll = useAppStore((s) => s.refreshAll);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    const blob = await exportAll();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pr-tracker-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File) => {
    try {
      const result = await importAll(file, importMode);
      setImportMsg(`Imported ${result.importedPRs} PRs, ${result.importedAchievements} achievements.`);
      await refreshAll();
    } catch (err) {
      setImportMsg(`Import failed: ${(err as Error).message}`);
    }
  };

  const handleReset = async () => {
    if (!confirm("Erase ALL data? This cannot be undone.")) return;
    if (!confirm("Are you absolutely sure?")) return;
    await resetAllData();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Settings</h1>

      <Section title="Units">
        <Row label="Weight">
          <select
            value={settings.units.weight}
            onChange={(e) => updateSettings({ units: { ...settings.units, weight: e.target.value as "lb" | "kg" } })}
            className="px-2 py-1 rounded border"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
          >
            <option value="lb">lb</option>
            <option value="kg">kg</option>
          </select>
        </Row>
        <Row label="Distance">
          <select
            value={settings.units.distance}
            onChange={(e) => updateSettings({ units: { ...settings.units, distance: e.target.value as "mi" | "km" } })}
            className="px-2 py-1 rounded border"
            style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
          >
            <option value="mi">mi</option>
            <option value="km">km</option>
          </select>
        </Row>
      </Section>

      <Section title="Theme">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {(["light", "dark", "techno", "system"] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => updateSettings({ theme: t })}
              className="px-3 py-2 rounded border capitalize"
              style={{
                borderColor: settings.theme === t ? "var(--accent)" : "var(--border)",
                color: settings.theme === t ? "var(--accent)" : "var(--text)",
                background: "var(--surface)",
                fontWeight: settings.theme === t ? 600 : 400,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Haptics">
        <Row label="Enable haptic feedback on PR">
          <input
            type="checkbox"
            checked={settings.hapticsEnabled}
            onChange={(e) => updateSettings({ hapticsEnabled: e.target.checked })}
          />
        </Row>
      </Section>

      <Section title="Backup">
        <button
          onClick={handleExport}
          className="px-4 py-2 rounded border"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
        >
          Export PRs (JSON)
        </button>
        <div className="mt-3">
          <Row label="Import mode">
            <select
              value={importMode}
              onChange={(e) => setImportMode(e.target.value as "merge" | "replace")}
              className="px-2 py-1 rounded border"
              style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--text)" }}
            >
              <option value="merge">Merge</option>
              <option value="replace">Replace</option>
            </select>
          </Row>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="mt-2"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImportFile(f);
            }}
          />
          {importMsg && <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>{importMsg}</p>}
        </div>
      </Section>

      <Section title="Danger zone">
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded border font-semibold"
          style={{ borderColor: "var(--tier-bronze)", color: "var(--tier-bronze)", background: "transparent" }}
        >
          Reset all data
        </button>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>{title}</h2>
      <div className="rounded-lg border p-4 space-y-2" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        {children}
      </div>
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</span>
      <div>{children}</div>
    </div>
  );
}
