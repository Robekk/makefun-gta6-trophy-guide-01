# Leonida Trophy Guide — a GTA VI trophy tracker & guide

An offline tracker and guide for all **55 PlayStation 5 trophies** of
Grand Theft Auto VI: a checklist that remembers your progress, a guide
for every trophy written for this app and citing its sources, and a
seven-stage roadmap to the platinum.

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun rank](https://make.fun/badge/gta6-trophy-guide-01/Robekk/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![make.fun reward](https://make.fun/badge/gta6-trophy-guide-01/Robekk/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

## What the app does

- **Checklist for all 55 trophies** with the official name, description
  and grade of each, exactly as PlayStation publishes them
  (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden).
- **Progress that sticks**: tick trophies off and the state is saved in
  the browser's localStorage; export it to a JSON file and import it
  back on another machine.
- **Filters and search**: by kind (story, missable, collectibles,
  activities, online), by grade, by earned state, plus free-text search.
- **Spoiler shield**: masks the names and descriptions of story and
  hidden trophies until you earn them.
- **A guide per trophy**, in this app's own words — what to do, where
  and how, and when it can be missed — with the published guides it
  draws on named beside it. Exactly one trophy is missable,
  *Positive Mental Attitude*, and it is flagged everywhere it appears.
- **Platinum roadmap**: seven stages from Chapter 1 to the platinum,
  built from the official descriptions and the published roadmaps.

The app is fully static and offline: it loads only its own files.

## Layout

- `main.ts` — the entrypoint. Copies `app/` and `screenshots/` into the
  output directory and writes `dossier.json` there with the kit's
  `buildDossier` (Node 22, standard library only).
- `app/index.html` — the page; `app/leonida.css` — its night theme.
- `app/js/tracker.js` — boots the app and wires the controls;
  `app/js/catalog.js` — data loading and filtering;
  `app/js/progress.js` — localStorage, export and import;
  `app/js/panels.js` — the guide panel and the roadmap view.
- `app/data/trophies.json` — the 55 trophies with guides, kinds,
  missable flags and sources; `app/data/roadmap.json` — the roadmap.
- `screenshots/` — four screenshots of the app in a browser.

## Try it

```sh
node serve.ts          # serves app/ at http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # build the hand-in
```

## Sources

Guides are original to this app and cite, per trophy, the published
guides they draw on: PowerPyx's GTA 6 Trophy Guide & Roadmap,
KeenGamer's Platinum Roadmap, Push Square's Trophy Guide and Roadmap,
and the EGamers.io trophy list. Trophy names, descriptions and grades
are the official PlayStation list.

## License

MIT — see `LICENSE`.
