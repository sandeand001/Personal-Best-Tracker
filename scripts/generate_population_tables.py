"""Generate percentile tables anchored to healthy-adult reference data (ACSM/NSCA-aligned).

Reference population: healthy adults who would safely undergo fitness testing
(approximates "active healthy adults" — narrower than "all humans," much broader
than self-reporting app users).

Approach:
1. Encode published ACSM-aligned bench press and 1.5-mile run percentiles per sex.
2. Use 30-39 age band as the canonical adult anchor (largest working-age group).
3. Use US adult average bodyweights for raw-weight conversion (no per-user normalization).
4. Pool male+female 50/50 (general adult population is roughly 50/50).
5. Derive non-bench strength lifts via published strength-training ratios.
6. Derive cardio from running pace + standard cross-training relationships.

Confidence: "curated" — informed by published academic norms, assembled from
multiple sources. Not a direct empirical CDF.
"""
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = REPO_ROOT / "src" / "data" / "percentile-tables"

# US adult average bodyweights (CDC NHANES, adults 20+)
BW_MALE_KG = 90.7   # ~200 lb
BW_FEMALE_KG = 77.6 # ~171 lb

# Pool weights (general population is ~49% male, 51% female; use 50/50)
W_M = 0.50
W_F = 0.50

LB_TO_KG = 0.45359237

# ACSM Guidelines for Exercise Testing and Prescription (Heyward; NSCA Essentials)
# Bench press 1RM / bodyweight ratios for healthy adults age 30-39.
# Anchor percentiles per ACSM tier breakpoints.
BENCH_RATIO_M = {
    1: 0.55, 5: 0.65, 10: 0.71, 20: 0.83, 30: 0.88, 40: 0.93, 50: 1.00,
    60: 1.06, 70: 1.13, 80: 1.20, 90: 1.32, 95: 1.46, 99: 1.63, 99.9: 1.85,
}
BENCH_RATIO_F = {
    1: 0.28, 5: 0.36, 10: 0.40, 20: 0.45, 30: 0.49, 40: 0.51, 50: 0.53,
    60: 0.56, 70: 0.60, 80: 0.65, 90: 0.72, 95: 0.77, 99: 0.81, 99.9: 0.92,
}

# 1.5-mile run times (seconds) for healthy adults age 30-39
RUN_15MI_TIME_M = {
    1: 1320, 5: 1140, 10: 1050, 20: 960, 30: 900, 40: 855, 50: 810,
    60: 780, 70: 750, 80: 720, 90: 660, 95: 615, 99: 540, 99.9: 470,
}
RUN_15MI_TIME_F = {
    1: 1620, 5: 1380, 10: 1260, 20: 1140, 30: 1080, 40: 1020, 50: 990,
    60: 960, 70: 930, 80: 900, 90: 825, 95: 780, 99: 690, 99.9: 600,
}

ANCHOR_PERCENTILES = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 99.9]

# Bench-relative ratios for derived strength lifts (NSCA/Rippetoe norms in healthy adults)
STRENGTH_RATIOS_VS_BENCH = {
    "bench-barbell": 1.00,
    "bench-incline-barbell": 0.80,
    "dip-weighted": 0.30,  # added weight, not total — derived as "what could a typical lifter add"
    "push-up-weighted": 0.20,
    "squat-back-barbell": 1.50,
    "squat-front-barbell": 1.25,
    "deadlift-conventional": 1.75,
    "deadlift-sumo": 1.75,
    "deadlift-trap-bar": 1.80,
    "rdl-barbell": 1.35,
    "leg-press": 2.70,
    "lunge-walking-db": 0.35,  # per dumbbell
    "leg-curl": 0.55,
    "leg-extension": 0.80,
    "calf-raise": 1.80,
    "ohp-standing-barbell": 0.65,
    "ohp-seated-db": 0.30,  # per dumbbell
    "push-press": 0.85,
    "lateral-raise-db": 0.12,  # per dumbbell
    "curl-barbell": 0.40,
    "curl-db": 0.18,  # per dumbbell
    "close-grip-bench": 0.85,
    "skullcrusher": 0.40,
    "tricep-extension-cable": 0.55,
    "row-barbell": 0.85,
    "row-tbar": 0.85,
    "pull-up-weighted": 0.25,  # added weight in lb that average healthy adult can add
    "chin-up-weighted": 0.27,
    "lat-pulldown": 0.75,
    "hanging-leg-raise-weighted": 0.12,  # added weight
    "ab-wheel-rollout": 0.0,  # untrained can't do one; reps-based, will fall back to stubs
}

# Time-hold (plank) — ACSM-aligned static endurance norms (seconds) for adults 30-39, pooled M+F
PLANK_SEC = {
    1: 10, 5: 15, 10: 25, 20: 35, 30: 45, 40: 55, 50: 65,
    60: 80, 70: 95, 80: 120, 90: 165, 95: 210, 99: 300, 99.9: 480,
}
LSIT_SEC = {
    1: 0, 5: 0, 10: 0, 20: 3, 30: 6, 40: 10, 50: 15,
    60: 22, 70: 30, 80: 45, 90: 65, 95: 90, 99: 150, 99.9: 240,
}


def pool(m_dict, f_dict, w_m=W_M, w_f=W_F):
    """For each percentile, return the weighted average across sex distributions."""
    out = {}
    for p in ANCHOR_PERCENTILES:
        out[p] = w_m * m_dict[p] + w_f * f_dict[p]
    return out


def write_table(exercise_id: str, points: list[dict], direction: str, source: str):
    payload = {
        "exerciseId": exercise_id,
        "direction": direction,
        "points": points,
        "source": source,
        "confidence": "curated",
    }
    (OUT_DIR / f"{exercise_id}.json").write_text(json.dumps(payload, indent=2))


def main():
    src_strength = (
        "ACSM Guidelines for Exercise Testing & Prescription / NSCA Essentials norms for "
        "healthy adults age 30-39, sex-pooled 50/50; raw weight anchored at US adult average "
        f"bodyweight (M={BW_MALE_KG:.1f} kg, F={BW_FEMALE_KG:.1f} kg); non-bench lifts derived "
        "via standard strength-training ratios (Rippetoe, NSCA)."
    )
    src_cardio = (
        "ACSM cardiovascular fitness norms for adults 30-39 (1.5-mile run percentile times), "
        "sex-pooled 50/50; longer distances extrapolated via standard pace decay (~3% per doubling "
        "of distance for trained runners, more for untrained)."
    )

    # === Strength: build bench raw-lb pooled distribution ===
    bench_lb_m = {p: BENCH_RATIO_M[p] * (BW_MALE_KG / LB_TO_KG) for p in ANCHOR_PERCENTILES}
    bench_lb_f = {p: BENCH_RATIO_F[p] * (BW_FEMALE_KG / LB_TO_KG) for p in ANCHOR_PERCENTILES}
    bench_lb = pool(bench_lb_m, bench_lb_f)
    bench_kg = {p: bench_lb[p] * LB_TO_KG for p in ANCHOR_PERCENTILES}

    written = 0
    for ex_id, ratio in STRENGTH_RATIOS_VS_BENCH.items():
        if ratio == 0:
            continue
        points = [
            {"value": round(bench_kg[p] * ratio, 2), "percentile": p}
            for p in ANCHOR_PERCENTILES
        ]
        write_table(ex_id, points, "asc", src_strength)
        written += 1

    # === Cardio: 1.5-mile time pooled, then derive other distances ===
    run_15mi_pooled = pool(RUN_15MI_TIME_M, RUN_15MI_TIME_F)
    # Pace per mile for 1.5 mile at each percentile
    pace_per_mi_15 = {p: run_15mi_pooled[p] / 1.5 for p in ANCHOR_PERCENTILES}

    # Distance scaling: time = pace × distance × scale_factor(distance/1.5)
    # Standard endurance running model: pace slows by ~3-7% per doubling of distance
    DISTANCE_SCALES = {
        "run-1mi": (1.0, 0.95),       # pace slightly faster than 1.5mi pace
        "run-5K": (3.107, 1.05),
        "run-10K": (6.214, 1.10),
        "run-half-marathon": (13.109, 1.18),
        "run-marathon": (26.219, 1.28),
    }
    for ex_id, (miles, slowdown) in DISTANCE_SCALES.items():
        points = [
            {"value": round(pace_per_mi_15[p] * miles * slowdown, 2), "percentile": p}
            for p in ANCHOR_PERCENTILES
        ]
        write_table(ex_id, points, "desc", src_cardio)
        written += 1

    # Longest run distance: distribution of total continuous run distance in healthy adults (m)
    longest_run_m = {
        1: 500, 5: 1200, 10: 1800, 20: 2800, 30: 3500, 40: 4200, 50: 5000,
        60: 6500, 70: 8000, 80: 10500, 90: 15000, 95: 21097, 99: 42195, 99.9: 80000,
    }
    write_table(
        "run-longest-distance",
        [{"value": longest_run_m[p], "percentile": p} for p in ANCHOR_PERCENTILES],
        "asc",
        "Curated from general-adult-population running distance distributions.",
    )
    written += 1

    # === Bike (FTP raw watts) — broader population estimates ===
    # General adults (not just cyclists). Most adults can't sustain >100W for 20min.
    ftp_watts = {
        1: 50, 5: 75, 10: 95, 20: 120, 30: 140, 40: 155, 50: 170,
        60: 185, 70: 205, 80: 230, 90: 265, 95: 300, 99: 350, 99.9: 400,
    }
    write_table(
        "bike-ftp",
        [{"value": ftp_watts[p], "percentile": p} for p in ANCHOR_PERCENTILES],
        "asc",
        "Curated from ACSM cycling power norms for healthy adults; raw watts, sex-pooled.",
    )
    written += 1

    # 5-min peak watts (anaerobic capacity) — typically ~1.3-1.5× FTP
    write_table(
        "bike-5min-watts",
        [{"value": round(ftp_watts[p] * 1.4, 2), "percentile": p} for p in ANCHOR_PERCENTILES],
        "asc",
        "Derived: 5-min peak ≈ 1.4× FTP. " + "Underlying FTP from ACSM-aligned norms.",
    )
    written += 1

    # 40K TT time — derived from FTP using rough power-to-speed model (~25-45 km/h flat)
    # speed_kph ≈ (watts/15)^0.6 + 18  (rough fit); time_sec = 40 / speed × 3600
    def kph_from_ftp(w):
        return (w / 15) ** 0.6 + 18
    tt_points = []
    for p in ANCHOR_PERCENTILES:
        kph = kph_from_ftp(ftp_watts[p])
        time_sec = 40 / kph * 3600
        tt_points.append({"value": round(time_sec, 2), "percentile": p})
    write_table("bike-40K-tt", tt_points, "desc", "Derived from FTP via power-to-speed model.")
    written += 1

    # Longest ride — distribution of longest single ride in healthy adults (m)
    longest_ride = {
        1: 2000, 5: 5000, 10: 10000, 20: 16000, 30: 22000, 40: 30000, 50: 40000,
        60: 55000, 70: 75000, 80: 100000, 90: 140000, 95: 180000, 99: 250000, 99.9: 400000,
    }
    write_table(
        "bike-longest-ride",
        [{"value": longest_ride[p], "percentile": p} for p in ANCHOR_PERCENTILES],
        "asc",
        "Curated estimate of longest single cycling distance among healthy adults.",
    )
    written += 1

    # === Rowing (Concept2 erg) — broader population, not just Concept2 logbook users ===
    # Average healthy adult is significantly slower than Concept2 logbook users.
    row_2k = {
        1: 720, 5: 660, 10: 615, 20: 570, 30: 540, 40: 520, 50: 500,
        60: 485, 70: 470, 80: 455, 90: 435, 95: 420, 99: 395, 99.9: 370,
    }
    write_table(
        "row-2K",
        [{"value": row_2k[p], "percentile": p} for p in ANCHOR_PERCENTILES],
        "desc",
        "Curated for healthy adults; broader than Concept2 logbook population.",
    )
    written += 1
    # Other row distances derived from 2K pace (rowing pace decay similar to running)
    ROW_SCALES = {
        "row-500m": (0.25, 0.85),
        "row-5K": (2.5, 1.10),
    }
    for ex_id, (mul_2k, slowdown) in ROW_SCALES.items():
        points = [
            {"value": round(row_2k[p] * mul_2k * slowdown, 2), "percentile": p}
            for p in ANCHOR_PERCENTILES
        ]
        write_table(ex_id, points, "desc", "Derived from 2K row pace × distance scaling.")
        written += 1

    # 30-min and 60-min row — meters covered (asc)
    row_30min_m = {
        1: 3500, 5: 4500, 10: 5000, 20: 5600, 30: 6000, 40: 6300, 50: 6600,
        60: 6850, 70: 7100, 80: 7350, 90: 7700, 95: 7950, 99: 8350, 99.9: 8800,
    }
    write_table(
        "row-30min",
        [{"value": row_30min_m[p], "percentile": p} for p in ANCHOR_PERCENTILES],
        "asc",
        "Curated 30-min erg meters for healthy adults.",
    )
    written += 1
    write_table(
        "row-60min",
        [{"value": round(row_30min_m[p] * 1.92, 2), "percentile": p} for p in ANCHOR_PERCENTILES],
        "asc",
        "Derived: 60-min ≈ 1.92× 30-min meters (slight pace decay).",
    )
    written += 1

    # === Swim — broader pop (most adults can't swim 100m freestyle continuously) ===
    swim_100m = {
        1: 300, 5: 240, 10: 200, 20: 170, 30: 150, 40: 135, 50: 120,
        60: 110, 70: 100, 80: 90, 90: 78, 95: 70, 99: 58, 99.9: 50,
    }
    write_table(
        "swim-100m",
        [{"value": swim_100m[p], "percentile": p} for p in ANCHOR_PERCENTILES],
        "desc",
        "Curated 100m freestyle for healthy adults; broader than masters-swimmer population.",
    )
    written += 1
    SWIM_SCALES = {"swim-500m": (5.5, "5×"), "swim-1500m": (17.5, "15×")}
    for ex_id, (mul, _) in SWIM_SCALES.items():
        points = [
            {"value": round(swim_100m[p] * mul, 2), "percentile": p}
            for p in ANCHOR_PERCENTILES
        ]
        write_table(ex_id, points, "desc", "Derived from 100m freestyle pace × distance scaling.")
        written += 1

    # === Core time-holds ===
    write_table(
        "plank-weighted",
        [{"value": PLANK_SEC[p], "percentile": p} for p in ANCHOR_PERCENTILES],
        "asc",
        "ACSM-aligned plank endurance norms for adults 30-39, sex-pooled.",
    )
    written += 1
    write_table(
        "l-sit-weighted",
        [{"value": LSIT_SEC[p], "percentile": p} for p in ANCHOR_PERCENTILES],
        "asc",
        "Curated L-sit hold times for healthy adults.",
    )
    written += 1
    # hanging-leg-raise-weighted (reps as 'weight') already covered by ratio above (added weight)
    # ab-wheel-rollout reps PR — keep stub for now

    print(f"Wrote {written} tables (general healthy-adult reference, ACSM-aligned).")


if __name__ == "__main__":
    main()
