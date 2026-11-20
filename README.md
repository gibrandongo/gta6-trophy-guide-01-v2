# Leonida Platinum Route

An offline, static web guide and tracker for the 55 PlayStation 5 trophies of
Grand Theft Auto VI, organised as a story-ordered journey across Leonida.

## Components

- `main.ts` — entry program (Node 22, plain JavaScript syntax, standard library
  only). Copies `app/` and `screenshots/` to the output directory and writes
  `dossier.json` with the vendored make.fun library. Fails loudly if a required
  app file is missing.
- `serve.ts` — tiny local static server for trying the guide in a browser
  (`node serve.ts`, then open http://localhost:8080). Development convenience
  only; not part of the handed-in app.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.
- `app/index.html` — the guide's single page: masthead with progress, tab
  navigation (District Map, The Route, All Trophies, Tracker), and the footer
  with the sources note.
- `app/app.js` — all guide logic: loads `data/trophies.json`, draws the
  district map pins, renders chapters, the filterable trophy list, the trophy
  detail view and the tracker; saves progress in localStorage; export, import
  and reset; hash routing for deep links; a spoiler setting that hides story
  trophies until earned; a `?demo=1` query that seeds 13 earned stops for
  screenshots.
- `app/style.css` — the sunset-paper look: warm sand background, deep teal map
  sea, coral accent, serif display type. No web fonts and no network loads.
- `app/data/trophies.json` — the official 55-trophy list (names, descriptions
  and grades as published) plus this guide's own material per trophy: route
  stop number, chapter, district, kind, difficulty and time estimate, missable
  flag, and an own-words guide that cites its sources.
- `screenshots/` — four genuine headless-Chrome renders of the built app:
  the district map home view, a chapter route view, a trophy detail view and
  the tracker view.
- `shots.json` — which view each screenshot shows.

## The route

Nine chapters, 55 stops in play order: story chapters 1–4, stranger strands,
playground pastimes, the outlaw economy, loose ends, then the final mission,
100% completion and the platinum. Missable flags mark stops where the moment
can pass or the attempt can fail. Every guide cites the official trophy list
(Exophase) for the name, description and grade and PSNProfiles for PSN counts,
and says plainly where a place is not pinned down by the official description.

## Running it

```sh
node serve.ts
# open http://localhost:8080

mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
