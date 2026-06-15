"""Derive curated percentile tables for related lifts from the verified bench/squat/deadlift tables.

Ratios are based on commonly cited strength-training norms (Rippetoe's Practical Programming,
ExRx anatomical comparisons). Confidence is "curated" — informed by ratios applied to verified
data, not directly measured.
"""
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TABLE_DIR = REPO_ROOT / "src" / "data" / "percentile-tables"

# (exerciseId, source_exerciseId, ratio, note)
DERIVED = [
    ("bench-incline-barbell", "bench-barbell", 0.80, "Incline ≈ 80% of flat bench"),
    ("ohp-standing-barbell", "bench-barbell", 0.65, "OHP ≈ 65% of bench"),
    ("close-grip-bench", "bench-barbell", 0.90, "Close-grip ≈ 90% of bench"),
    ("push-press", "bench-barbell", 0.85, "Push press ≈ 85% of bench (leg drive)"),
    ("squat-front-barbell", "squat-back-barbell", 0.85, "Front squat ≈ 85% of back squat"),
    ("rdl-barbell", "deadlift-conventional", 0.75, "RDL ≈ 75% of conventional deadlift"),
    ("leg-press", "squat-back-barbell", 1.80, "Leg press ≈ 1.8× back squat (leverage)"),
    ("row-barbell", "deadlift-conventional", 0.55, "Barbell row ≈ 55% of deadlift"),
    ("row-tbar", "deadlift-conventional", 0.60, "T-bar row ≈ 60% of deadlift"),
]


def main():
    for target_id, source_id, ratio, note in DERIVED:
        src_path = TABLE_DIR / f"{source_id}.json"
        if not src_path.exists():
            print(f"  skip {target_id}: source {source_id} not found")
            continue
        src = json.loads(src_path.read_text())
        points = [
            {"value": round(p["value"] * ratio, 2), "percentile": p["percentile"]}
            for p in src["points"]
        ]
        out = {
            "exerciseId": target_id,
            "direction": "asc",
            "points": points,
            "source": f"Derived from {source_id} × {ratio}. {note}. Underlying data: {src.get('source', 'OpenPowerlifting')}",
            "confidence": "curated",
        }
        (TABLE_DIR / f"{target_id}.json").write_text(json.dumps(out, indent=2))
        print(f"  wrote {target_id}.json (×{ratio} of {source_id})")


if __name__ == "__main__":
    main()
