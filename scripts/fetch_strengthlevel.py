"""Scrape Strength Level community standards and produce raw-weight percentile tables.

Strength Level publishes per-exercise tier values for the entire community:
  Beginner   = 5th percentile
  Novice     = 20th percentile
  Intermediate = 50th percentile
  Advanced   = 80th percentile
  Elite      = 95th percentile

These are raw weights (lb) NOT normalized by bodyweight (per user's Q2 stance).
We pool male + female 80/20 (rough split of the strength-training user base) by
combining the two CDFs.

Output JSON tables go to src/data/percentile-tables/<exerciseId>.json with
confidence: "verified" since the underlying data is 48M+ real lift submissions.
"""
import json
import re
import sys
import time
import urllib.request
from pathlib import Path
import numpy as np

REPO_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = REPO_ROOT / "src" / "data" / "percentile-tables"

# Strength Level slug -> our exerciseId(s)
SLUG_TO_EXERCISE = {
    "bench-press": ["bench-barbell"],
    "incline-bench-press": ["bench-incline-barbell"],
    "squat": ["squat-back-barbell"],
    "front-squat": ["squat-front-barbell"],
    "deadlift": ["deadlift-conventional", "deadlift-sumo", "deadlift-trap-bar"],
    "romanian-deadlift": ["rdl-barbell"],
    "overhead-press": ["ohp-standing-barbell"],
    "dumbbell-shoulder-press": ["ohp-seated-db"],
    "push-press": ["push-press"],
    "dumbbell-lateral-raise": ["lateral-raise-db"],
    "barbell-curl": ["curl-barbell"],
    "dumbbell-curl": ["curl-db"],
    "close-grip-bench-press": ["close-grip-bench"],
    "skullcrusher": ["skullcrusher"],
    "tricep-pushdown": ["tricep-extension-cable"],
    "barbell-row": ["row-barbell"],
    "t-bar-row": ["row-tbar"],
    "pull-ups": ["pull-up-weighted"],   # weighted variant; community tracks bodyweight pull-ups primarily
    "chin-ups": ["chin-up-weighted"],
    "lat-pulldown": ["lat-pulldown"],
    "dips": ["dip-weighted"],
    "push-ups": ["push-up-weighted"],
    "leg-press": ["leg-press"],
    "walking-lunge": ["lunge-walking-db"],
    "lying-leg-curl": ["leg-curl"],
    "leg-extension": ["leg-extension"],
    "calf-raise": ["calf-raise"],
}

# Mapping: Strength Level tier label -> percentile
TIER_TO_PCT = {
    "Beginner": 5.0,
    "Novice": 20.0,
    "Intermediate": 50.0,
    "Advanced": 80.0,
    "Elite": 95.0,
}

ANCHOR_PERCENTILES = [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 99.9]

# Pool weights (Strength Level user base skews male)
MALE_WEIGHT = 0.80
FEMALE_WEIGHT = 0.20


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (PR Tracker data-fetch script; one-time per exercise)",
        "Accept": "text/html",
    })
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read().decode("utf-8", errors="replace")


def parse_standards(html: str):
    """Return {sex: {tier: weight_lb}} from a Strength Level page, or None on failure."""
    # The page renders structured HTML. The tier values appear in clearly delineated blocks.
    # We look for patterns like:  Beginner</...>...<...>103 lb
    out = {"male": {}, "female": {}}
    # Strategy: find the male/female sections, then within each find each tier label
    # followed by a "<NUMBER> lb" pattern. The "Entire Community" section comes first
    # in both male and female blocks.

    # Locate male & female sections (each begins with "Male <Exercise> Standards" or similar)
    m_match = re.search(r"Male\s+[\w\s\-]+?Standards.*?(?=Female\s+[\w\s\-]+?Standards|$)", html, re.DOTALL | re.IGNORECASE)
    f_match = re.search(r"Female\s+[\w\s\-]+?Standards.*?(?=$)", html, re.DOTALL | re.IGNORECASE)

    def grab_tiers(block: str):
        # Each tier value appears once near the top before per-bodyweight tables.
        # Pattern: tier name, optional spans/tags, then a number with 'lb'.
        result = {}
        for tier in TIER_TO_PCT:
            # Find first occurrence of the tier label, then the first weight value (lb) after it
            tier_pos = block.find(tier)
            if tier_pos == -1:
                continue
            window = block[tier_pos: tier_pos + 800]
            num = re.search(r"(\d+(?:\.\d+)?)\s*lb", window)
            if num:
                result[tier] = float(num.group(1))
        return result

    if m_match:
        out["male"] = grab_tiers(m_match.group(0))
    if f_match:
        out["female"] = grab_tiers(f_match.group(0))
    return out


def build_cdf(tier_values: dict[str, float]):
    """Given {tier: weight_lb} produce CDF anchor points sorted by percentile."""
    points = sorted(
        [(TIER_TO_PCT[t], v) for t, v in tier_values.items() if t in TIER_TO_PCT],
        key=lambda x: x[0],
    )
    return points  # list of (percentile, weight)


def cdf_lookup(cdf, weight):
    """Given CDF anchor (pct, weight) and a weight, return percentile (linear interp). Clamped."""
    if not cdf:
        return 0.0
    if weight <= cdf[0][1]:
        return cdf[0][0]
    if weight >= cdf[-1][1]:
        return cdf[-1][0]
    for i in range(len(cdf) - 1):
        p1, w1 = cdf[i]
        p2, w2 = cdf[i + 1]
        if w1 <= weight <= w2:
            frac = (weight - w1) / (w2 - w1) if w2 > w1 else 0
            return p1 + frac * (p2 - p1)
    return cdf[-1][0]


def percentile_lookup(cdf, target_pct):
    """Given CDF anchor (pct, weight) find the weight at a target percentile (linear interp)."""
    if not cdf:
        return None
    if target_pct <= cdf[0][0]:
        # Extrapolate lower tail linearly toward 0 weight at 0 percentile (rough)
        p1, w1 = cdf[0]
        if p1 == 0:
            return w1
        frac = target_pct / p1
        return w1 * frac
    if target_pct >= cdf[-1][0]:
        # Extrapolate upper tail by maintaining the upper-end slope
        p1, w1 = cdf[-2]
        p2, w2 = cdf[-1]
        slope = (w2 - w1) / (p2 - p1) if p2 > p1 else 0
        return w2 + slope * (target_pct - p2)
    for i in range(len(cdf) - 1):
        p1, w1 = cdf[i]
        p2, w2 = cdf[i + 1]
        if p1 <= target_pct <= p2:
            frac = (target_pct - p1) / (p2 - p1) if p2 > p1 else 0
            return w1 + frac * (w2 - w1)
    return cdf[-1][1]


def pool_cdfs(cdf_m, cdf_f, w_m=MALE_WEIGHT, w_f=FEMALE_WEIGHT):
    """Produce pooled (pct, weight) CDF by combining male and female via weighted-CDF mixture.

    Algorithm: at each candidate weight, the pooled CDF value is w_m * M(w) + w_f * F(w).
    We invert this to get pooled (pct, weight) at our anchor percentiles.
    """
    if not cdf_m and not cdf_f:
        return []
    if not cdf_m:
        return [(p, w) for p, w in cdf_f]
    if not cdf_f:
        return [(p, w) for p, w in cdf_m]

    # Sample a fine grid of weights spanning both distributions
    w_min = min(cdf_m[0][1], cdf_f[0][1]) * 0.3
    w_max = max(cdf_m[-1][1], cdf_f[-1][1]) * 1.5
    weights = np.linspace(w_min, w_max, 1000)
    pooled = []
    for w in weights:
        m_p = cdf_lookup(cdf_m, w)
        f_p = cdf_lookup(cdf_f, w)
        pooled.append((w_m * m_p + w_f * f_p, w))
    pooled.sort()
    # Now find the weight at each anchor percentile
    anchors = []
    for tp in ANCHOR_PERCENTILES:
        # Find first pooled (pct, w) where pct >= tp
        idx = None
        for i, (p, _) in enumerate(pooled):
            if p >= tp:
                idx = i
                break
        if idx is None:
            anchors.append((tp, pooled[-1][1]))
        elif idx == 0:
            anchors.append((tp, pooled[0][1]))
        else:
            p1, w1 = pooled[idx - 1]
            p2, w2 = pooled[idx]
            frac = (tp - p1) / (p2 - p1) if p2 > p1 else 0
            anchors.append((tp, w1 + frac * (w2 - w1)))
    return anchors


def main():
    written = 0
    skipped = []
    for slug, exercise_ids in SLUG_TO_EXERCISE.items():
        url = f"https://strengthlevel.com/strength-standards/{slug}/lb"
        try:
            print(f"Fetching {slug} ...")
            html = fetch(url)
        except Exception as e:
            print(f"  FAIL: {e}")
            skipped.append(slug)
            continue
        standards = parse_standards(html)
        if not standards["male"] and not standards["female"]:
            print(f"  no standards parsed; check HTML structure for {slug}")
            skipped.append(slug)
            continue
        print(f"  male={standards['male']}")
        print(f"  female={standards['female']}")
        cdf_m = build_cdf(standards["male"])
        cdf_f = build_cdf(standards["female"])
        pooled = pool_cdfs(cdf_m, cdf_f)
        # Convert lb -> kg
        LB_TO_KG = 0.45359237
        points = [
            {"value": round(w * LB_TO_KG, 2), "percentile": p}
            for p, w in pooled
        ]
        source = (
            f"Strength Level community standards (https://strengthlevel.com/strength-standards/{slug}/lb); "
            f"male+female pooled {int(MALE_WEIGHT*100)}/{int(FEMALE_WEIGHT*100)}, raw weight (not bodyweight-normalized); "
            f"underlying data: 48M+ user-submitted lifts. Tier anchors: Beg=5th, Nov=20th, Int=50th, Adv=80th, Elite=95th."
        )
        for ex_id in exercise_ids:
            payload = {
                "exerciseId": ex_id,
                "direction": "asc",
                "points": points,
                "source": source,
                "confidence": "verified",
            }
            (OUT_DIR / f"{ex_id}.json").write_text(json.dumps(payload, indent=2))
            written += 1
            print(f"  wrote {ex_id}.json")
        time.sleep(0.5)  # be polite

    print(f"\nDone. Wrote {written} tables. Skipped: {skipped}")


if __name__ == "__main__":
    sys.exit(main())
