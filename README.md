# Vice Palms — GTA VI Trophy Guide & Platinum Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Robekk/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Robekk/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies** of Grand Theft Auto VI
(1 platinum, 2 gold, 6 silver, 46 bronze — 28 of them hidden, exactly 1 missable).

## What it does

- **Tracker** — a checklist of all 55 trophies with their official names, descriptions and
  grades. Earned state is saved in the browser (localStorage), with a progress dashboard
  (total, percent and per-grade counts) and one-click **export / import** of your progress
  as a JSON file.
- **Filters** — by kind (story, missable, collectibles, activities, online), by grade and by
  earned state, plus full-text search.
- **Spoiler shield** — while it is on, hidden trophies keep their names and descriptions
  masked until you earn them, so story beats are never given away.
- **Guides** — every trophy carries a guide written for this tracker: what to do, where,
  when, and the counts PlayStation tracks (250 stunts, 42 range golds, 18 meditation
  spots…). Each guide **cites its sources** beside it.
- **Roadmap** — an 8-stage platinum roadmap (about 200 hours, one playthrough, difficulty
  4/10) that flags the run's only missable trophy, **Positive Mental Attitude**, in
  Chapter 1 where it belongs.

## Run it

The app is plain static files under `app/` — no build step, no network. Serve the folder
with any static server, e.g. the kit's helper:

```
node serve.ts            # then open http://localhost:8080
```

## Hand it in

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output
directory and writes `dossier.json` with the vendored `buildDossier` from
`vendor/makefun-frontend.ts`.

## Sources

The official trophy list is PlayStation's, as listed by Exophase and PSNProfiles. The
guides draw on, and cite beside each trophy, the published guides at PowerPyx, Push Square
and KeenGamer. Guide text here is written for this tracker; no text is copied from them,
and no Rockstar Games logo or artwork is used anywhere.
