const KG_PER_LB = 0.45359237;
const M_PER_MI = 1609.344;
const M_PER_KM = 1000;

export const lbToKg = (lb: number) => lb * KG_PER_LB;
export const kgToLb = (kg: number) => kg / KG_PER_LB;

export const miToM = (mi: number) => mi * M_PER_MI;
export const mToMi = (m: number) => m / M_PER_MI;
export const kmToM = (km: number) => km * M_PER_KM;
export const mToKm = (m: number) => m / M_PER_KM;

export function secToHmsString(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) {
    throw new RangeError(`sec must be non-negative finite: ${sec}`);
  }
  const total = Math.floor(sec);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function parseHmsToSec(input: string): number {
  const parts = input.trim().split(":");
  if (parts.length === 0 || parts.length > 3) {
    throw new RangeError(`invalid time format: ${input}`);
  }
  const nums = parts.map((p) => Number(p));
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) {
    throw new RangeError(`invalid time format: ${input}`);
  }
  if (parts.length === 1) return nums[0];
  if (parts.length === 2) return nums[0] * 60 + nums[1];
  return nums[0] * 3600 + nums[1] * 60 + nums[2];
}
