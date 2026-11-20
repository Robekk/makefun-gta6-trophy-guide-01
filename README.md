# Leonida Nights — GTA VI Trophy Guide & Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Robekk/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Robekk/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for the 55 PlayStation 5 trophies of **Grand Theft Auto VI** — every trophy with its official name, description and grade, a guide in our own words that names its sources, a seven-stage roadmap to the platinum, and a checklist whose progress lives in your browser.

## What is inside

- **The full list, checked.** All 55 official trophies (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PlayStation) with names, descriptions and grades exactly as published, each extended with `guide`, `kind`, `missable` and `sources` in `app/data/trophies.json`.
- **One missable trophy, flagged everywhere.** *Positive Mental Attitude* can be lost: Lucia's balcony meditation at Jason's house exists only during Chapter 1, after the mission *Down to Earth*. The tracker badges it, the guide panel warns about it, the header reports whether it is safe, and Stage 1 of the roadmap is built around it.
- **A tracker, not just a list.** Tick trophies off as they pop; progress (count, percent, per-grade splits) is saved in `localStorage` and can be exported to a JSON file and imported back on another browser.
- **Filters and search.** By kind (story, missable, collectibles, activities, online — the official list has no online trophies, and the tracker says so), by grade, by earned state, and by free text.
- **A spoiler shield.** Turn it on and unearned story and PSN-hidden trophies show as "Hidden trophy", names and guides masked, until you earn them.
- **A roadmap.** `app/data/roadmap.json` lays out seven stages — Chapter 1 and the missable, the story, the 100% Completion checklist, collectibles, the stranger questlines, crime-and-cash cleanup, and the platinum — derived from the official descriptions and the published guides.
- **Cited guidance.** Every guide names the published guides it rests on, beside the guide itself: PowerPyx's trophy guide and roadmap, KeenGamer's platinum roadmap, Push Square's trophy guide, GTABase's trophy list, the Radio Times list, and Exophase's list (via PlanetGTA6). Specifics without a citation earn no credit, so there are none.

## Run it

The app is plain static files under `app/` — no build step. Serve the folder with any static server and open it in a browser:

```
node serve.ts        # the kit's helper, serves app/ on http://localhost:8080
```

It works fully offline: it loads only its own files.

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory (`MAKEFUN_OUTPUT_DIR`, or `/output`) and writes `dossier.json` with the vendored `buildDossier` from `vendor/makefun-frontend.ts`:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The run is deterministic: two runs write byte-identical output, and the program prints a one-line summary of what was handed in and refuses to write a dossier over the 1.5 MiB gate limit.

## Screenshots

`screenshots/` holds four renders of the app itself, taken by its maker in Chromium at 1280×800: the tracker at 18 of 55 earned with the missable guide open, the missable trophy's guide panel with its warning and sources, the roadmap, and the story filter under the spoiler shield.

## License

MIT — see `LICENSE`.
