import { useMemo } from "react";
import Body, { type ExtendedBodyPart, type Slug } from "react-muscle-highlighter";
import type { MuscleGroup } from "../domain/types";
import { tierForPercentile } from "../domain/tiers";

interface AvatarBodyProps {
  view: "front" | "back";
  /** Map of region -> percentile (0..100) for the active tab. */
  regionPercentiles: Map<MuscleGroup, number>;
  onRegionClick?: (region: MuscleGroup) => void;
}

/** Map our 7-region taxonomy to react-muscle-highlighter slugs. */
const REGION_TO_SLUGS: Record<Exclude<MuscleGroup, "engine">, Slug[]> = {
  chest: ["chest"],
  back: ["upper-back", "lower-back", "trapezius"],
  shoulders: ["deltoids"],
  arms: ["biceps", "triceps", "forearm"],
  legs: ["quadriceps", "hamstring", "gluteal", "calves"],
  core: ["abs", "obliques"],
};

/** Slugs that anatomically belong to the back view. */
const BACK_SLUGS: ReadonlySet<Slug> = new Set([
  "upper-back",
  "lower-back",
  "trapezius",
  "gluteal",
  "hamstring",
  "triceps",
]);

/** Slug -> the MuscleGroup that owns it (for click routing). */
const SLUG_TO_REGION = new Map<Slug, Exclude<MuscleGroup, "engine">>();
for (const [region, slugs] of Object.entries(REGION_TO_SLUGS) as Array<[
  Exclude<MuscleGroup, "engine">,
  Slug[]
]>) {
  for (const s of slugs) SLUG_TO_REGION.set(s, region);
}

const TIER_COLOR_VAR: Record<string, string> = {
  iron: "var(--tier-iron)",
  bronze: "var(--tier-bronze)",
  silver: "var(--tier-silver)",
  gold: "var(--tier-gold)",
  platinum: "var(--tier-platinum)",
  diamond: "var(--tier-diamond)",
  mythic: "var(--tier-mythic)",
  legend: "var(--tier-legend)",
};

export function AvatarBody({ view, regionPercentiles, onRegionClick }: AvatarBodyProps) {
  const data = useMemo<ExtendedBodyPart[]>(() => {
    const parts: ExtendedBodyPart[] = [];
    for (const [region, slugs] of Object.entries(REGION_TO_SLUGS) as Array<[
      Exclude<MuscleGroup, "engine">,
      Slug[]
    ]>) {
      const pct = regionPercentiles.get(region) ?? 0;
      if (pct <= 0) continue;
      const tier = tierForPercentile(pct);
      const color = TIER_COLOR_VAR[tier];
      for (const slug of slugs) {
        const onBack = BACK_SLUGS.has(slug);
        const onFront = !onBack || slug === "calves";
        if (view === "front" && onFront) parts.push({ slug, color });
        if (view === "back" && (onBack || slug === "calves")) parts.push({ slug, color });
      }
    }
    return parts;
  }, [view, regionPercentiles]);

  return (
    <div
      className="flex justify-center"
      onClick={(e) => {
        if (!onRegionClick) return;
        const target = e.target as SVGElement;
        const slug = target.getAttribute?.("data-slug") as Slug | null;
        if (!slug) return;
        const region = SLUG_TO_REGION.get(slug);
        if (region) onRegionClick(region);
      }}
      style={{ cursor: onRegionClick ? "pointer" : "default" }}
    >
      <Body
        data={data}
        side={view}
        gender="male"
        border="none"
        scale={1.4}
        defaultFill="var(--tier-untrained)"
      />
    </div>
  );
}
