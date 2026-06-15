"""Pull OpenPowerlifting bulk CSV and compute raw, weight-class-agnostic percentile tables for SBD.

Per the PR Tracker stance (see plan.md Q2): bodyweight is irrelevant. We pool all
weight classes and both sexes, filter to Raw equipment, adult lifters, and modern
era. Each lifter contributes their best lift across all meets.

Output: src/data/percentile-tables/{exerciseId}.json with shape:
  { exerciseId, direction: "asc", points: [{value, percentile}, ...],
    source: "OpenPowerlifting <date>", confidence: "verified" }
"""
import json
import sys
import zipfile
import urllib.request
import io
from pathlib import Path

import pandas as pd
import numpy as np

URL = "https://openpowerlifting.gitlab.io/opl-csv/files/openpowerlifting-latest.zip"
ANCHOR_PERCENTILES = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 99.9]

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = REPO_ROOT / "src" / "data" / "percentile-tables"
OUT_DIR.mkdir(parents=True, exist_ok=True)
CACHE = REPO_ROOT / "scripts" / ".cache"
CACHE.mkdir(parents=True, exist_ok=True)

ZIP_PATH = CACHE / "openpowerlifting-latest.zip"

# Maps OpenPowerlifting column -> our exerciseId (only conventional deadlift here;
# sumo PRs come tagged as the same column, can't separate cleanly without per-meet
# event info, so we apply the same distribution to both deadlift variants).
LIFT_COLUMNS = {
    "Best3SquatKg": ["squat-back-barbell"],
    "Best3BenchKg": ["bench-barbell"],
    "Best3DeadliftKg": ["deadlift-conventional", "deadlift-sumo", "deadlift-trap-bar"],
}


def download():
    if ZIP_PATH.exists() and ZIP_PATH.stat().st_size > 1_000_000:
        print(f"Using cached {ZIP_PATH} ({ZIP_PATH.stat().st_size / 1e6:.1f} MB)")
        return
    print(f"Downloading {URL} ...")
    with urllib.request.urlopen(URL) as resp, open(ZIP_PATH, "wb") as f:
        total = 0
        while True:
            chunk = resp.read(1 << 20)
            if not chunk:
                break
            f.write(chunk)
            total += len(chunk)
            print(f"  {total / 1e6:6.1f} MB", end="\r")
    print(f"\nDownloaded {total / 1e6:.1f} MB")


def load_csv():
    print("Extracting CSV ...")
    with zipfile.ZipFile(ZIP_PATH) as z:
        csv_names = [n for n in z.namelist() if n.endswith(".csv")]
        if not csv_names:
            raise SystemExit("No CSV in zip")
        name = csv_names[0]
        print(f"  -> {name}")
        with z.open(name) as f:
            df = pd.read_csv(
                f,
                usecols=[
                    "Equipment",
                    "Sex",
                    "Age",
                    "Best3SquatKg",
                    "Best3BenchKg",
                    "Best3DeadliftKg",
                    "Date",
                    "Name",
                ],
                low_memory=False,
            )
    print(f"  loaded {len(df):,} rows")
    return df


def compute_table(df: pd.DataFrame, column: str):
    """Return list of (value, percentile) anchors for a lift column."""
    sub = df[df[column].notna() & (df[column] > 0)].copy()
    if sub.empty:
        return None
    # Per-lifter max across all meets
    by_lifter = sub.groupby("Name")[column].max()
    values = by_lifter.values.astype(float)
    print(f"  {column}: {len(values):,} unique lifters; min {values.min():.1f} max {values.max():.1f}")
    pts = []
    for p in ANCHOR_PERCENTILES:
        v = float(np.percentile(values, p))
        pts.append({"value": round(v, 2), "percentile": p})
    return pts


def main():
    download()
    df = load_csv()
    print("Filtering to Raw, adult (>=18), with date >= 2010 ...")
    df = df[df["Equipment"] == "Raw"]
    df = df[(df["Age"].isna()) | (df["Age"] >= 18)]
    df["Date"] = pd.to_datetime(df["Date"], errors="coerce")
    df = df[df["Date"] >= "2010-01-01"]
    print(f"  {len(df):,} rows after filtering")

    # Identify the OpenPowerlifting snapshot date for provenance string
    src_date = df["Date"].max().strftime("%Y-%m") if not df["Date"].isna().all() else "unknown"
    source = f"OpenPowerlifting (snapshot {src_date}); pooled sexes, all weight classes, Raw equipment"

    for column, exercise_ids in LIFT_COLUMNS.items():
        points = compute_table(df, column)
        if points is None:
            print(f"  skip {column} (no data)")
            continue
        for ex_id in exercise_ids:
            payload = {
                "exerciseId": ex_id,
                "direction": "asc",
                "points": points,
                "source": source,
                "confidence": "verified" if ex_id != "deadlift-trap-bar" else "curated",
            }
            out = OUT_DIR / f"{ex_id}.json"
            out.write_text(json.dumps(payload, indent=2))
            print(f"  wrote {out.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    sys.exit(main())
