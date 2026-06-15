import type { AchievementDef } from "../../domain/achievements/rules";

/**
 * Helper for plate-club-style entries.
 * Plate values in lb with kg conversion (1 lb = 0.45359237 kg).
 */
const lbToKg = (lb: number) => lb * 0.45359237;

const plateClub = (
  exerciseId: string,
  exerciseLabel: string,
  plates: number
): AchievementDef => {
  const lb = 45 + plates * 90; // 45 lb bar + plates × 90 lb (45 lb each side)
  return {
    id: `plate-club-${exerciseId}-${plates}pl`,
    category: "plate-club",
    title: `${plates}-Plate ${exerciseLabel}`,
    description: `${exerciseLabel} ${lb} lb (${plates} 45 lb plates per side).`,
    hidden: false,
    rarity: plates >= 5 ? "mythic" : plates >= 4 ? "legendary" : plates >= 3 ? "epic" : plates >= 2 ? "rare" : "common",
    rule: {
      kind: "lift-threshold",
      exerciseId,
      mode: "true1rm",
      minWeightKg: lbToKg(lb),
    },
  };
};

const subTime = (
  id: string,
  exerciseId: string,
  slot: string,
  label: string,
  maxTimeSec: number,
  rarity: AchievementDef["rarity"]
): AchievementDef => ({
  id,
  category: exerciseId.startsWith("row-") ? "concept2" : "sub-x",
  title: label,
  description: `Complete ${slot} in under ${Math.floor(maxTimeSec / 60)}:${String(maxTimeSec % 60).padStart(2, "0")}.`,
  hidden: false,
  rarity,
  rule: { kind: "cardio-time", exerciseId, slot, maxTimeSec },
});

export const SEED_ACHIEVEMENTS: AchievementDef[] = [
  // ===== PLATE CLUB =====
  ...["bench-barbell", "squat-back-barbell", "deadlift-conventional", "ohp-standing-barbell"].flatMap((id) => {
    const label = id === "bench-barbell" ? "Bench" : id === "squat-back-barbell" ? "Squat" : id === "deadlift-conventional" ? "Deadlift" : "OHP";
    return [1, 2, 3, 4, 5].map((p) => plateClub(id, label, p));
  }),

  // ===== SUB-X RUN =====
  subTime("sub-30-5K", "run-5K", "5K", "Sub-30 5K", 30 * 60, "common"),
  subTime("sub-25-5K", "run-5K", "5K", "Sub-25 5K", 25 * 60, "rare"),
  subTime("sub-22-5K", "run-5K", "5K", "Sub-22 5K", 22 * 60, "epic"),
  subTime("sub-20-5K", "run-5K", "5K", "Sub-20 5K", 20 * 60, "legendary"),
  subTime("sub-18-5K", "run-5K", "5K", "Sub-18 5K", 18 * 60, "mythic"),
  subTime("sub-8-mile", "run-1mi", "1mi", "Sub-8 Mile", 8 * 60, "common"),
  subTime("sub-7-mile", "run-1mi", "1mi", "Sub-7 Mile", 7 * 60, "rare"),
  subTime("sub-6-mile", "run-1mi", "1mi", "Sub-6 Mile", 6 * 60, "epic"),
  subTime("sub-5-mile", "run-1mi", "1mi", "Sub-5 Mile", 5 * 60, "mythic"),
  subTime("sub-4hr-marathon", "run-marathon", "marathon", "Sub-4hr Marathon", 4 * 3600, "rare"),
  subTime("sub-3-30-marathon", "run-marathon", "marathon", "Sub-3:30 Marathon", 3.5 * 3600, "epic"),
  subTime("sub-3-marathon", "run-marathon", "marathon", "Sub-3 Marathon", 3 * 3600, "legendary"),

  // ===== CONCEPT2 ROW =====
  subTime("sub-7-2K-row", "row-2K", "row-2K", "Sub-7 2K Row", 7 * 60, "rare"),
  subTime("sub-6-30-2K-row", "row-2K", "row-2K", "Sub-6:30 2K Row", 6.5 * 60, "epic"),
  subTime("sub-6-2K-row", "row-2K", "row-2K", "Sub-6 2K Row", 6 * 60, "legendary"),

  // ===== POWER (raw watts FTP) =====
  { id: "ftp-200", category: "power", title: "200W FTP", description: "Sustain 200W for 20 minutes.", hidden: false, rarity: "common", rule: { kind: "cardio-power", exerciseId: "bike-ftp", slot: "ftp", minWatts: 200 } },
  { id: "ftp-250", category: "power", title: "250W FTP", description: "Sustain 250W for 20 minutes.", hidden: false, rarity: "rare", rule: { kind: "cardio-power", exerciseId: "bike-ftp", slot: "ftp", minWatts: 250 } },
  { id: "ftp-300", category: "power", title: "300W FTP", description: "Sustain 300W for 20 minutes.", hidden: false, rarity: "epic", rule: { kind: "cardio-power", exerciseId: "bike-ftp", slot: "ftp", minWatts: 300 } },
  { id: "ftp-350", category: "power", title: "350W FTP", description: "Sustain 350W for 20 minutes.", hidden: false, rarity: "legendary", rule: { kind: "cardio-power", exerciseId: "bike-ftp", slot: "ftp", minWatts: 350 } },
  { id: "ftp-400", category: "power", title: "400W FTP", description: "Sustain 400W for 20 minutes.", hidden: false, rarity: "mythic", rule: { kind: "cardio-power", exerciseId: "bike-ftp", slot: "ftp", minWatts: 400 } },

  // ===== BODYWEIGHT PLUS (absolute added weight, per Q2 stance) =====
  { id: "pull-up-plus-25", category: "bodyweight-plus", title: "Weighted Pull-up +25 lb", description: "Add 25 lb to a pull-up.", hidden: false, rarity: "common", rule: { kind: "lift-threshold", exerciseId: "pull-up-weighted", mode: "true1rm", minWeightKg: lbToKg(25) } },
  { id: "pull-up-plus-45", category: "bodyweight-plus", title: "Weighted Pull-up +45 lb", description: "Add 45 lb to a pull-up.", hidden: false, rarity: "rare", rule: { kind: "lift-threshold", exerciseId: "pull-up-weighted", mode: "true1rm", minWeightKg: lbToKg(45) } },
  { id: "pull-up-plus-90", category: "bodyweight-plus", title: "Weighted Pull-up +90 lb", description: "Add 90 lb to a pull-up.", hidden: false, rarity: "epic", rule: { kind: "lift-threshold", exerciseId: "pull-up-weighted", mode: "true1rm", minWeightKg: lbToKg(90) } },
  { id: "pull-up-plus-135", category: "bodyweight-plus", title: "Weighted Pull-up +135 lb", description: "Add 135 lb to a pull-up.", hidden: false, rarity: "legendary", rule: { kind: "lift-threshold", exerciseId: "pull-up-weighted", mode: "true1rm", minWeightKg: lbToKg(135) } },

  // ===== TIER COVERAGE =====
  { id: "iron-clear", category: "tier-coverage", title: "Iron Clear", description: "Reach Bronze or higher in every region.", hidden: false, rarity: "common", rule: { kind: "tier-coverage", minTier: "bronze", regions: "all" } },
  { id: "silver-everywhere", category: "tier-coverage", title: "Silver Everywhere", description: "Reach Silver or higher in every region.", hidden: false, rarity: "rare", rule: { kind: "tier-coverage", minTier: "silver", regions: "all" } },
  { id: "gold-everywhere", category: "tier-coverage", title: "Gold Everywhere", description: "Reach Gold or higher in every region.", hidden: false, rarity: "epic", rule: { kind: "tier-coverage", minTier: "gold", regions: "all" } },
  { id: "platinum-everywhere", category: "tier-coverage", title: "Platinum Everywhere", description: "Reach Platinum or higher in every region.", hidden: false, rarity: "legendary", rule: { kind: "tier-coverage", minTier: "platinum", regions: "all" } },
  { id: "diamond-dozen", category: "tier-coverage", title: "Diamond Dozen", description: "Reach Diamond or higher in 12 distinct exercises.", hidden: false, rarity: "mythic", rule: { kind: "diamond-dozen", minTier: "diamond", minCount: 12 } },

  // ===== VOLUME =====
  { id: "first-pr", category: "volume", title: "First PR", description: "Log your first PR.", hidden: false, rarity: "common", rule: { kind: "discovery-first-pr", scope: "any" } },
  { id: "ten-prs", category: "volume", title: "Ten PRs", description: "Log 10 PRs.", hidden: false, rarity: "common", rule: { kind: "pr-count", min: 10 } },
  { id: "fifty-prs", category: "volume", title: "Fifty PRs", description: "Log 50 PRs.", hidden: false, rarity: "rare", rule: { kind: "pr-count", min: 50 } },
  { id: "hundred-prs", category: "volume", title: "Hundred PRs", description: "Log 100 PRs.", hidden: false, rarity: "epic", rule: { kind: "pr-count", min: 100 } },
  { id: "year-of-prs", category: "volume", title: "Year of PRs", description: "Log 365 PRs.", hidden: false, rarity: "legendary", rule: { kind: "pr-count", min: 365 } },
  { id: "thousand-prs", category: "volume", title: "Thousand PRs", description: "Log 1000 PRs.", hidden: false, rarity: "mythic", rule: { kind: "pr-count", min: 1000 } },

  // ===== CONSISTENCY =====
  { id: "six-month-streak", category: "consistency", title: "Half-Year Streak", description: "Log a PR every month for 6 consecutive months.", hidden: false, rarity: "rare", rule: { kind: "consistency-monthly", consecutiveMonths: 6 } },
  { id: "year-streak", category: "consistency", title: "Year Streak", description: "Log a PR every month for 12 consecutive months.", hidden: false, rarity: "epic", rule: { kind: "consistency-monthly", consecutiveMonths: 12 } },
  { id: "two-year-streak", category: "consistency", title: "Two-Year Streak", description: "Log a PR every month for 24 consecutive months.", hidden: false, rarity: "legendary", rule: { kind: "consistency-monthly", consecutiveMonths: 24 } },

  // ===== DISCOVERY =====
  { id: "triathlete", category: "discovery", title: "Triathlete", description: "Log a PR in run, bike, and swim.", hidden: false, rarity: "rare", rule: { kind: "triathlete" } },

  // ===== FLAVOR (HIDDEN) =====
  { id: "early-bird", category: "flavor", title: "Early Bird", description: "Log a PR between 4 AM and 6 AM.", hidden: true, rarity: "rare", rule: { kind: "flavor-time-of-day", startHour: 4, endHour: 6 } },
  { id: "night-owl", category: "flavor", title: "Night Owl", description: "Log a PR between midnight and 3 AM.", hidden: true, rarity: "rare", rule: { kind: "flavor-time-of-day", startHour: 0, endHour: 3 } },
];
