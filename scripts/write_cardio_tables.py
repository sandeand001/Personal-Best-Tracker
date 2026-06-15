"""Write curated cardio percentile tables.

Sources:
- Run: aggregated from RunRepeat & race result statistics (NYC, Boston, etc.).
- Row (Concept2): Concept2 World Ranking percentile data (publicly published).
- Bike FTP: TrainerRoad / Zwift community published distributions.
- Swim: USMS Top-10 + national rankings.

These are CURATED estimates, not direct empirical CDFs. Marked confidence: "curated".
"""
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TABLE_DIR = REPO_ROOT / "src" / "data" / "percentile-tables"

# For desc direction (lower = better, e.g. times): points list (time_sec, percentile).
# For asc direction (higher = better, e.g. distances/watts): (value, percentile).
# All anchored at [1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 99.9].

CARDIO = {
    # ===== RUN (times in seconds, lower = better, "desc") =====
    "run-1mi": {
        "direction": "desc",
        "source": "Curated from race result aggregations (NYRR, USATF Masters, RunRepeat).",
        "points": [
            (16*60, 1), (14*60, 5), (12*60, 10), (10*60+30, 20), (9*60+30, 30),
            (9*60, 40), (8*60+30, 50), (8*60, 60), (7*60+30, 70), (7*60, 80),
            (6*60+15, 90), (5*60+45, 95), (5*60, 99), (4*60+30, 99.9),
        ],
    },
    "run-5K": {
        "direction": "desc",
        "source": "Curated from RunRepeat global 5K finishing time distribution.",
        "points": [
            (45*60, 1), (38*60, 5), (34*60, 10), (30*60, 20), (28*60, 30),
            (26*60, 40), (24*60+30, 50), (23*60, 60), (21*60+30, 70), (20*60, 80),
            (18*60+30, 90), (17*60+30, 95), (16*60, 99), (14*60+30, 99.9),
        ],
    },
    "run-10K": {
        "direction": "desc",
        "source": "Curated from RunRepeat global 10K finishing time distribution.",
        "points": [
            (90*60, 1), (75*60, 5), (68*60, 10), (60*60, 20), (56*60, 30),
            (53*60, 40), (50*60, 50), (47*60, 60), (44*60, 70), (41*60, 80),
            (38*60, 90), (36*60, 95), (33*60, 99), (30*60, 99.9),
        ],
    },
    "run-half-marathon": {
        "direction": "desc",
        "source": "Curated from RunRepeat global half-marathon distribution.",
        "points": [
            (200*60, 1), (170*60, 5), (155*60, 10), (140*60, 20), (130*60, 30),
            (123*60, 40), (117*60, 50), (110*60, 60), (104*60, 70), (97*60, 80),
            (89*60, 90), (84*60, 95), (76*60, 99), (68*60, 99.9),
        ],
    },
    "run-marathon": {
        "direction": "desc",
        "source": "Curated from RunRepeat global marathon distribution + NYC/Boston finisher stats.",
        "points": [
            (420*60, 1), (360*60, 5), (330*60, 10), (300*60, 20), (285*60, 30),
            (270*60, 40), (255*60, 50), (240*60, 60), (225*60, 70), (210*60, 80),
            (195*60, 90), (180*60, 95), (160*60, 99), (140*60, 99.9),
        ],
    },
    "run-longest-distance": {
        "direction": "asc",
        "source": "Curated estimate: distribution of longest single continuous run for active runners.",
        "points": [
            (1500, 1), (3000, 5), (5000, 10), (8000, 20), (10000, 30),
            (12000, 40), (15000, 50), (18000, 60), (21000, 70), (26000, 80),
            (32000, 90), (42000, 95), (60000, 99), (100000, 99.9),
        ],
    },

    # ===== ROW (Concept2 published season percentiles) =====
    "row-500m": {
        "direction": "desc",
        "source": "Concept2 World Ranking 500m percentile data (heavyweight open).",
        "points": [
            (150, 1), (130, 5), (118, 10), (108, 20), (102, 30),
            (98, 40), (95, 50), (92, 60), (89, 70), (86, 80),
            (83, 90), (81, 95), (78, 99), (75, 99.9),
        ],
    },
    "row-2K": {
        "direction": "desc",
        "source": "Concept2 World Ranking 2K percentile data.",
        "points": [
            (10*60, 1), (9*60, 5), (8*60+30, 10), (8*60, 20), (7*60+45, 30),
            (7*60+30, 40), (7*60+15, 50), (7*60, 60), (6*60+50, 70), (6*60+40, 80),
            (6*60+30, 90), (6*60+20, 95), (6*60+5, 99), (5*60+50, 99.9),
        ],
    },
    "row-5K": {
        "direction": "desc",
        "source": "Concept2 World Ranking 5K percentile data.",
        "points": [
            (27*60, 1), (24*60, 5), (22*60+30, 10), (21*60, 20), (20*60+15, 30),
            (19*60+45, 40), (19*60+15, 50), (18*60+45, 60), (18*60+15, 70), (17*60+45, 80),
            (17*60+15, 90), (16*60+50, 95), (16*60+15, 99), (15*60+45, 99.9),
        ],
    },
    "row-30min": {
        "direction": "asc",
        "source": "Concept2 World Ranking 30-min meters covered.",
        "points": [
            (5000, 1), (6000, 5), (6500, 10), (7000, 20), (7300, 30),
            (7500, 40), (7700, 50), (7900, 60), (8050, 70), (8200, 80),
            (8400, 90), (8550, 95), (8800, 99), (9100, 99.9),
        ],
    },
    "row-60min": {
        "direction": "asc",
        "source": "Concept2 World Ranking 60-min meters covered.",
        "points": [
            (10000, 1), (11500, 5), (12500, 10), (13500, 20), (14000, 30),
            (14400, 40), (14750, 50), (15050, 60), (15350, 70), (15650, 80),
            (15950, 90), (16200, 95), (16600, 99), (17100, 99.9),
        ],
    },

    # ===== BIKE (raw watts FTP, no bodyweight normalization per Q2 stance) =====
    "bike-ftp": {
        "direction": "asc",
        "source": "Curated from TrainerRoad/Zwift community FTP distributions (raw watts, all riders).",
        "points": [
            (80, 1), (120, 5), (145, 10), (170, 20), (185, 30),
            (200, 40), (215, 50), (230, 60), (250, 70), (275, 80),
            (305, 90), (335, 95), (375, 99), (420, 99.9),
        ],
    },
    "bike-5min-watts": {
        "direction": "asc",
        "source": "Curated: 5-min peak power for trained cyclists (raw watts).",
        "points": [
            (110, 1), (160, 5), (190, 10), (220, 20), (245, 30),
            (265, 40), (285, 50), (305, 60), (325, 70), (355, 80),
            (390, 90), (425, 95), (470, 99), (520, 99.9),
        ],
    },
    "bike-40K-tt": {
        "direction": "desc",
        "source": "Curated: 40K TT times from amateur cycling race results.",
        "points": [
            (110*60, 1), (95*60, 5), (85*60, 10), (78*60, 20), (74*60, 30),
            (70*60, 40), (67*60, 50), (64*60, 60), (61*60, 70), (58*60, 80),
            (55*60, 90), (53*60, 95), (50*60, 99), (47*60, 99.9),
        ],
    },
    "bike-longest-ride": {
        "direction": "asc",
        "source": "Curated estimate: longest single ride distribution for recreational/serious cyclists.",
        "points": [
            (15000, 1), (25000, 5), (35000, 10), (50000, 20), (65000, 30),
            (80000, 40), (95000, 50), (110000, 60), (130000, 70), (160000, 80),
            (200000, 90), (250000, 95), (320000, 99), (500000, 99.9),
        ],
    },

    # ===== SWIM (USMS / FINA inspired) =====
    "swim-100m": {
        "direction": "desc",
        "source": "Curated from USMS national age-group rankings, freestyle.",
        "points": [
            (180, 1), (150, 5), (135, 10), (118, 20), (108, 30),
            (100, 40), (94, 50), (88, 60), (83, 70), (78, 80),
            (72, 90), (67, 95), (60, 99), (52, 99.9),
        ],
    },
    "swim-500m": {
        "direction": "desc",
        "source": "Curated from USMS rankings, freestyle (extrapolated from 500yd).",
        "points": [
            (900, 1), (720, 5), (640, 10), (570, 20), (525, 30),
            (490, 40), (460, 50), (435, 60), (410, 70), (385, 80),
            (360, 90), (340, 95), (315, 99), (290, 99.9),
        ],
    },
    "swim-1500m": {
        "direction": "desc",
        "source": "Curated from FINA / USMS 1500m freestyle rankings.",
        "points": [
            (2700, 1), (2250, 5), (2050, 10), (1860, 20), (1740, 30),
            (1640, 40), (1560, 50), (1480, 60), (1410, 70), (1340, 80),
            (1270, 90), (1220, 95), (1140, 99), (1050, 99.9),
        ],
    },
}


def main():
    for ex_id, spec in CARDIO.items():
        out = {
            "exerciseId": ex_id,
            "direction": spec["direction"],
            "points": [{"value": float(v), "percentile": float(p)} for v, p in spec["points"]],
            "source": spec["source"],
            "confidence": "curated",
        }
        (TABLE_DIR / f"{ex_id}.json").write_text(json.dumps(out, indent=2))
        print(f"  wrote {ex_id}.json")


if __name__ == "__main__":
    main()
