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

const BACK_SLUGS: ReadonlySet<Slug> = new Set([
  "upper-back",
  "lower-back",
  "trapezius",
  "gluteal",
  "hamstring",
  "triceps",
]);

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
  /**
   * Build the parts list. We include EVERY slug visible on the current view
   * (even untrained ones) so they're all clickable. Untrained slugs get the
   * "untrained" color; trained slugs get the tier color.
   */
  const data = useMemo<ExtendedBodyPart[]>(() => {
    const parts: ExtendedBodyPart[] = [];
    for (const [region, slugs] of Object.entries(REGION_TO_SLUGS) as Array<[
      Exclude<MuscleGroup, "engine">,
      Slug[]
    ]>) {
      const pct = regionPercentiles.get(region) ?? 0;
      const color = pct > 0 ? TIER_COLOR_VAR[tierForPercentile(pct)] : "var(--tier-untrained)";
      for (const slug of slugs) {
        const onBack = BACK_SLUGS.has(slug);
        const onFront = !onBack || slug === "calves";
        const visible =
          (view === "front" && onFront) ||
          (view === "back" && (onBack || slug === "calves"));
        if (visible) parts.push({ slug, color });
      }
    }
    return parts;
  }, [view, regionPercentiles]);

  const handlePress = (item: ExtendedBodyPart) => {
    if (!onRegionClick) return;
    if (!item.slug) return;
    const region = SLUG_TO_REGION.get(item.slug);
    if (region) onRegionClick(region);
  };

  return (
    <div className="flex justify-center" style={{ touchAction: "manipulation" }}>
      <Body
        data={data}
        side={view}
        gender="male"
        border="none"
        scale={1.4}
        defaultFill="var(--tier-untrained)"
        onBodyPartPress={onRegionClick ? handlePress : undefined}
      />
    </div>
  );
}
