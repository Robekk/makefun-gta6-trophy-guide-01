# Leonida Nights — GTA VI Trophy Guide & Tracker

[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Leonida Nights rank](https://make.fun/badge/gta6-trophy-guide-01/Robekk/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Leonida Nights reward](https://make.fun/badge/gta6-trophy-guide-01/Robekk/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies of Grand Theft Auto VI** — 1 platinum, 2 gold, 6 silver, 46 bronze, 28 of them hidden on PlayStation until earned. Every trophy carries its official name, description and grade, plus a guide written for this page that **cites its sources** beside it, so you can see where every fact comes from.

## What it does

- **Checklist tracker** — tick trophies off as you earn them; progress is saved in your browser (localStorage) and shown as a count, a percentage and a per-grade breakdown.
- **Export / import** — download your progress as a JSON file and import it back on any machine.
- **Filters** — by kind (story, collectibles, activities, missable), by grade, by earned state, plus full-text search across names, descriptions and guides.
- **Spoiler shield** — a setting that masks the names, descriptions and guides of story trophies until you have earned them.
- **Guide panel** — each trophy's guide in full: what to do, where and how, and when it can be missed. The one missable trophy, **Positive Mental Attitude**, carries a loud warning: its first meditation spot, on the balcony of Jason's house, exists only in Chapter 1.
- **Roadmap to the platinum** — six stages from Chapter 1 to the final cleanup, built from the official descriptions: story first (with the missable flagged in stage 1), then the character questlines, the 100% checklist, the collections sweep, and the one-off moments.

The whole list is offline and single-player — there are no online trophies. Published roadmaps put the platinum at roughly 200 hours and rate only Positive Mental Attitude as missable.

## Run the guide

Serve the `app/` folder with any static file server and open `index.html` in a desktop browser. With Node installed, the kit's helper does it:

```
node serve.ts
```

then visit http://localhost:8080. The app loads nothing over the network: every script, style and data file lives under `app/`.

## Hand in the entry

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` into the output directory and writes `dossier.json` there with the vendored make.fun library:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

It prints a summary of what was delivered and fails loudly if the dossier would exceed the 1.5 MiB cap.

## Data & sources

- `app/data/trophies.json` — the 55 trophies: official name, description and grade, each extended with a guide in our own words, its kind, a missable flag and its sources.
- `app/data/roadmap.json` — the six-stage platinum roadmap.

Guides were written from the published coverage of the trophy list and roadmap — PowerPyx, GTABase, KeenGamer, Push Square and Radio Times are cited per trophy inside the data and shown in the guide panel. Trophy names and descriptions are the official ones, as published for PlayStation.

## License

MIT — see `LICENSE`. A fan-made project; not affiliated with Rockstar Games. No Rockstar logos or artwork are used.
