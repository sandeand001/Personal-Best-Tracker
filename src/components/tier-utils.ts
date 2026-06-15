import type { Tier } from "../domain/types";

export const TIER_LABELS: Record<Tier, string> = {
  iron: "Iron",
  bronze: "Bronze",
  silver: "Silver",
  gold: "Gold",
  platinum: "Platinum",
  diamond: "Diamond",
  mythic: "Mythic",
  legend: "Legend",
};

export function tierColorVar(tier: Tier): string {
  return `var(--tier-${tier})`;
}
