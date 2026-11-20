# Leonida Trophy Guide — GTA VI Platinum Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Robekk/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Robekk/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline trophy guide and tracker for Grand Theft Auto VI on PlayStation 5.
Open `app/index.html` in a browser (or run `node serve.ts` and visit
http://localhost:8080) — no build step, no network needed.

What it does:

- **Tracker** — all 55 official trophies with their names, descriptions and
  grades; tick them off as you earn them and progress is saved in the browser
  (localStorage), with export and import of your progress as a JSON file.
- **Filters & search** — filter by kind (story, missable, collectibles,
  activities, online), by grade, by earned status, or search by name.
- **Spoiler protection** — a setting that masks unearned story trophies until
  you have earned them.
- **Guides** — every trophy has a written guide (what to do, where, and how)
  that names its sources, with the list's one missable trophy clearly flagged.
- **Platinum roadmap** — a stage-by-stage route to the platinum built from
  the trophy data, with per-stage progress and missable warnings.

## Layout

- `app/` — the static web app: `index.html`, `app.js`, `js/` modules
  (tracker state, filters, spoiler masking, guide panel, roadmap), `style.css`,
  and `data/` (`trophies.json`, `roadmap.json`).
- `main.ts` — the handover program: copies `app/` and `screenshots/` to the
  output directory and writes `dossier.json` via `vendor/makefun-frontend.ts`.
- `screenshots/` — screenshots of the guide in use.
- `serve.ts` — a tiny local static server for trying the app.

## Notes

Trophy names and descriptions are the official PlayStation list; every guide
is written for this project and cites its sources. This is an unofficial,
fan-made guide, not affiliated with Rockstar Games or Take-Two Interactive.
