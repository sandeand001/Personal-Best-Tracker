import type { Tier } from "../domain/types";
import { tierColorVar } from "./tier-utils";

interface StatBarProps {
  percentile: number;
  tier: Tier;
  nextTier?: number | null;
  showLabel?: boolean;
}

export function StatBar({ percentile, tier, nextTier, showLabel }: StatBarProps) {
  const fill = Math.max(0, Math.min(100, percentile));
  return (
    <div className="w-full">
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: "color-mix(in srgb, var(--text-muted) 18%, transparent)" }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${fill}%`,
            background: tierColorVar(tier),
            boxShadow:
              percentile >= 80
                ? `0 0 calc(8px * var(--glow-strength, 0)) ${tierColorVar(tier)}`
                : undefined,
          }}
        />
      </div>
      {showLabel && (
        <div className="text-xs mt-1 flex justify-between" style={{ color: "var(--text-muted)" }}>
          <span>{percentile.toFixed(1)}th percentile</span>
          {nextTier != null && <span>→ {nextTier.toFixed(0)}th</span>}
        </div>
      )}
    </div>
  );
}
