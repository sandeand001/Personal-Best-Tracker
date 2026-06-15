# PR Tracker

Gamified PWA for personal-record tracking in strength and cardio.

The body is a character sheet. PRs are the only currency. Each muscle region (Chest, Back, Shoulders, Arms, Legs, Core, Engine) has its own population-percentile stat with an 8-tier ladder (Iron → Legend). 4 themes (Light, Dark, Techno, Fantasy). 100% local-only via IndexedDB. Installable PWA, fully offline.

## Run locally

```sh
npm install
npm run dev
```

App at <http://localhost:5173/pr-tracker/>.

## Test & build

```sh
npm test            # vitest, ~72 tests
npm run build       # type-check + production bundle
npm run build:pages # production bundle + 404.html SPA fallback for GitHub Pages
```

## Deploy to GitHub Pages

1. Push the repo to GitHub.
2. Repository Settings → Pages → **Source = "GitHub Actions"**.
3. Push to `main` (or `master`); the workflow at `.github/workflows/deploy.yml` builds and deploys.
4. Live at `https://<username>.github.io/pr-tracker/`.

If you change the repo name from `pr-tracker`, update the `base` in `vite.config.ts` and the `start_url`/`scope` in the PWA manifest.

## Custom domain

Add `public/CNAME` containing your domain, then change `vite.config.ts` `base` from `/pr-tracker/` to `/`, and update PWA `start_url`/`scope` likewise.

## Architecture

- `src/domain/` — pure TypeScript: tiers, Epley, percentile lookup, PR detection, region rollup, balance, achievement rules. No React or Dexie imports. Fully unit-tested.
- `src/data/` — Dexie (IndexedDB) schema, repos, JSON export/import, seeded exercises + achievements + stub percentile tables.
- `src/app/` — store (Zustand), PR builder, theme provider, layout.
- `src/features/` — vertical slices: avatar, log-pr, region, exercise, achievements, history, settings, pr-celebration.
- `src/components/` — shared UI primitives (StatBar, TierBadge, AvatarSVG).
- `src/styles/` — theme tokens + 4 theme CSS files.

## Stub percentile tables

The bundled percentile reference tables (`src/data/seed/stub-percentiles.ts`) are **informed placeholders**, not verified population data. Replacing them with real distributions (OpenPowerlifting, Concept2 logbook, race results, FTP community data) is the v2 research deliverable. Stubs use 3 anchor points each; real tables can land as a JSON-only update without code changes.
