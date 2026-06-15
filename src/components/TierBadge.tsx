import type { Tier } from "../domain/types";
import { TIER_LABELS, tierColorVar } from "./tier-utils";

interface TierBadgeProps {
  tier: Tier;
  size?: "sm" | "md" | "lg";
}

export function TierBadge({ tier, size = "md" }: TierBadgeProps) {
  const sizeClass =
    size === "sm" ? "text-xs px-1.5 py-0.5" : size === "lg" ? "text-base px-3 py-1" : "text-sm px-2 py-0.5";
  return (
    <span
      className={`inline-block rounded font-semibold uppercase tracking-wide ${sizeClass}`}
      style={{
        color: tierColorVar(tier),
        border: `1px solid ${tierColorVar(tier)}`,
        background: `color-mix(in srgb, ${tierColorVar(tier)} 12%, transparent)`,
      }}
    >
      {TIER_LABELS[tier]}
    </span>
  );
}
