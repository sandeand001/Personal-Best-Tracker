export interface PercentilePoint {
  value: number;
  percentile: number;
}

export type PercentileDirection = "asc" | "desc";

export interface PercentileTable {
  exerciseId: string;
  direction: PercentileDirection;
  points: PercentilePoint[];
  source?: string;
  confidence?: "verified" | "curated" | "stub";
}
