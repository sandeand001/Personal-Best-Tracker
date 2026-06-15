import { useEffect, useRef, useState } from "react";
import type { MuscleGroup, StatTab } from "../domain/types";
import { tierColorVar } from "./tier-utils";
import { tierForPercentile } from "../domain/tiers";

interface AvatarSVGProps {
  view: "front" | "back";
  /** Map of region -> percentile (0..100) for the active tab. */
  regionPercentiles: Map<MuscleGroup, number>;
  onRegionClick?: (region: MuscleGroup) => void;
  tab: StatTab;
}

const FRONT_REGIONS: MuscleGroup[] = ["shoulders", "chest", "arms", "core", "legs"];
const BACK_REGIONS: MuscleGroup[] = ["shoulders", "back", "arms", "legs"];

export function AvatarSVG({ view, regionPercentiles, onRegionClick }: AvatarSVGProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgText, setSvgText] = useState<string>("");

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}avatars/silhouette-${view}.svg`;
    fetch(url)
      .then((r) => r.text())
      .then(setSvgText)
      .catch(() => setSvgText(""));
  }, [view]);

  useEffect(() => {
    if (!containerRef.current || !svgText) return;
    const root = containerRef.current.querySelector("svg");
    if (!root) return;
    const regions = view === "front" ? FRONT_REGIONS : BACK_REGIONS;
    for (const region of regions) {
      const path = root.querySelector(`[data-region="${region}"]`) as SVGElement | null;
      if (!path) continue;
      const pct = regionPercentiles.get(region) ?? 0;
      if (pct <= 0) {
        path.setAttribute("fill", "var(--tier-untrained)");
      } else {
        const tier = tierForPercentile(pct);
        path.setAttribute("fill", tierColorVar(tier));
      }
      path.style.cursor = onRegionClick ? "pointer" : "default";
      path.onclick = onRegionClick ? () => onRegionClick(region) : null;
    }
  }, [svgText, view, regionPercentiles, onRegionClick]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      dangerouslySetInnerHTML={{ __html: svgText }}
    />
  );
}
