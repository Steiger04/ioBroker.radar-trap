# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`iobroker.radar-trap` is an ioBroker adapter that finds speed traps, traffic jams, road works and closures along
**routes** (computed with mapbox directions) and inside **areas** (polygons, circles or German counties). The traps
come from the undocumented API of the map of blitzer.de (`www.blitzer.de/karte/api/markers`); atudo's
`cdn2.atudo.net`, which 2.2.x asked, does not answer since October 2026. Every route and area is recomputed by
its own CRON schedule and written as states.

TypeScript (CommonJS output). The backend lives in `src/`, the runnable code is the compiled `build/`
(`package.json` `main` is `build/main.js`). `build/` is gitignored and `common.nogit` is `true`: the adapter can only
be installed from npm. Besides the backend the adapter ships four front-ends, each with its own `package.json`,
built by `tasks.ts` and **committed** in their output folders.

## Commands

```bash
npm run build                             # tsx tasks.ts: backend (tsc) + all four front-ends
npm run build:backend                     # only src/ -> build/
npm run build:admin | build:widgets | build:devices | build:wc   # one front-end
npm run watch                             # tsc watch of the backend
npm run check                             # type check of the backend (tsconfig.json, noEmit)
npm run check:tasks                       # type check of tasks.ts (tsx does not check)
npm run check:admin | check:widgets | check:devices | check:wc   # type check of a front-end
npm run lint                              # eslint (@iobroker/eslint-config, flat config), backend only
npx eslint -c eslint.config.mjs --fix src # autofix + prettier formatting

npm run test:package                      # validates package.json / io-package.json / jsonConfig (downloads the schemas)
npm run test:integration                  # starts a real js-controller + adapter instance
npm run release-major                     # @alcalzone/release-script, moves README changelog into io-package news
```

There is deliberately **no `prepare` script** — `npm ci`/`npm install` does not build. The CI builds with
`build: true`. The integration test requires that **no** js-controller is running on the machine, otherwise it
aborts with "JS-Controller is already running!".

`test:package` downloads the JSON schemas from raw.githubusercontent.com; an `ECONNRESET` there is the network,
not the package.

## Layout

| Path | Content | Output |
| --- | --- | --- |
| `src/main.ts` | `RadarTrap2 extends utils.Adapter`: start, streams of the control states, `onMessage` | `build/` |
| `src/lib/configSync.ts` | `migrateDatabase` and `syncConfig`: configuration ↔ database | |
| `src/lib/Scheduler.ts` | one croner job per route/area, the countdown state, run/pause/resume | |
| `src/lib/create*Objects.ts` | the objects and states of a route/area | |
| `src/lib/atudo/` | download of the traps from blitzer.de (`traps.ts`) and their kinds (`determineTrapTypes.ts`) | |
| `src/lib/adapterRef.ts` | log and `delay` of the adapter for the hooks of feathers, which have no adapter | |
| `src/server/` | feathers 4 app: services `routes` and `areas` on NeDB, hooks that compute them | |
| `src/lib/adapter-config.d.ts` | `ioBroker.INative` and the `radarTrap` namespace (routes, areas, traps) | |
| `src-admin/` | web components of the configuration (`<iob-radar-trap-map/-address/-area>`), MapLibre, no React; the map is also a widget (`common.webComponents`) | `admin/custom/` |
| `src-widgets/` | vis-2 widget set (React, Module Federation, mapbox-gl) | `widgets/radar-trap/` |
| `src-devices/` | tile for the devices app | `admin/dm-widgets/` |
| `src-webcomponents/` | web component `<iob-radar-trap-traps>` for every host | `admin/webcomponents/` |
| `src-shared/` | what the front-ends share: kinds of trap, words (`i18n/`), icons, map layers | — |
| `admin/jsonConfig.json5` | the configuration dialog | |

`src/lib/adapter-config.d.ts` is hand-maintained and must be kept in sync with `native` in `io-package.json` **and**
with `admin/jsonConfig.json5` — nothing generates it.

## Architecture

### Configuration and database

Routes and areas live in `native.routes` / `native.areas`, edited by JSON-Config. The computed data — directions,
traps, polylines — lives in NeDB (`@seald-io/nedb`), behind the feathers services `routes` and `areas`.

- `migrateDatabase()` runs once (`native.dbMigrated` false): it takes the routes and areas of the database of 2.2.x
  into the configuration, sets `dbMigrated`, and the write **restarts the instance**. The flag, not an empty
  `routes`, marks the migration, because js-controller adds missing native defaults on upgrade.
- `syncConfig()` runs on every start: computes what is new, whose source changed or that has no result yet
  (`service.create(data, { patchSourceFromServer: true })`), patches name/CRON/profiles, removes from the database
  (and the objects) what the configuration does not have anymore. Routes need the mapbox token; without it they are
  skipped with a warning. Invalid entries only warn.
- IDs of routes and areas must match `[a-zA-Z0-9_-]` — they become object ids.

The NeDB path is `nedb` in `src/server/config/production.ts`: `../../../../../iobroker-data/files/radarTrapDB`,
**relative to `build/server/config/`** (`NODE_CONFIG_DIR` is set in `src/server/app.ts`). Moving the config files to
another depth of `build/` moves the database.

### Traps from blitzer.de

`getPoiPolyPointsAsync` lays a grid of boxes (up to 35 km) over the route or area and asks `traps()` for each. The
endpoint `www.blitzer.de/karte/api/markers?type=…&box=S,W,N,E&z=18` is undocumented (it is what the map of blitzer.de
reads; the Home Assistant integrations use it too) - what `traps.ts` relies on was measured, not read anywhere:

- The answer has numbers where atudo had strings (`type`, `vmax`, `lat`, `info.partly_fixed`, the figures of a jam).
  `toPoi` turns them back into the atudo form, because `determineTrapTypes` compares `type` and `partly_fixed` as
  strings and the trap info checks `vmax`, `length`, … with lodash `isEmpty` (true for every number).
- A box wider than a few km comes back with groups: `type >= 1000`, empty `backend`, at the centre of their members.
  `markers()` asks such a box again in its quarters (up to 5 levels), but only quarters that `context.wanted` - inside
  the area, or within `maxTrapDistance` of the route. Quarters, not boxes around each group: those overlap, and in
  Berlin cost five times the requests for the same traps.
- Closed roads are markers of the type `closure` with an encoded `polyline`; they become the polylines of the type
  `closure` that the maps draw. `/karte/api/lines` is not used (its parameters are unknown; the probe answered
  `polys: null`).
- All requests of the instance go through one queue with 500 ms between them, at most `MAX_REQUESTS` (300) per
  computation. A failure pauses blitzer.de for 15 minutes (it blocks addresses that ask too often); the caller logs
  one warning per computation with the reason and the time of the next try.

### Feathers server

`provideFeathers()` starts the feathers app on `native.settings.feathersPort`; `info.connection` follows it. Only the
map widgets of vis-2 talk to it (socket.io, `@feathersjs/client`). Everything else asks the instance with `sendTo`
(`onMessage`): `getSources` and `getSource` for `<iob-radar-trap-map>`, `getSourceOptions` (`[{ value, label }]`, an
array even on error) for the drop-downs of the devices tile (`selectSendTo`) and of the vis-2 settings. The tile and
`<iob-radar-trap-traps>` read the states.

### Objects and states

Per route/area `<id>`: `<id>.cron-job.{run,pause,resume,timer}`, plus the infos and trap states of a route
(`direction-<n>-infos`, one per alternative of mapbox) or an area (`area-infos`). `timer` is the countdown to the next run, written every
second while the job runs. Writing `run`/`pause`/`resume` (not acked) goes through the rxjs subjects in `main.ts` to
the `Scheduler`; a run that is already `loading` is not started twice.

Always use the timers of adapter-core (`adapter.setInterval` / `setTimeout`), never the globals — js-controller clears
them on unload.

### Admin configuration

`admin/jsonConfig.json5` (`common.adminUI.config = "json"`, needs admin ≥ 8.3.10 for `custom` with `webComponent`).
The map, the address search and the area editor are web components from `admin/custom/`, each an ES module with a
manifest; they share MapLibre in a chunk beside them and load `icons/` and `landkreise.json` relative to themselves.
Translations of the dialog are the flat `admin/i18n/<lang>.json`; the words of the components come from
`src-shared/i18n` (the build fails if one is missing in a language).

Without a mapbox token the components use OpenStreetMap tiles and Photon (komoot) for the address search; computing
a route needs mapbox in any case.

### Front-end builds

`tasks.ts` runs `npm install` and `vite build` in each `src-*` folder and copies the result. Every `vite.config.ts`
must load with Vite's native config loader: relative imports with their extension, JSON imports with
`with { type: 'json' }`, `src-shared/package.json` has `"type": "module"`.

## Release flow

Changelog lives in `README.md` under the `### **WORK IN PROGRESS**` placeholder comment; `release-script` (config in
`.releaseconfig.json`, runs `npm run build` before its commit so the committed front-end outputs are current) moves
it into `io-package.json` `common.news`. CI (`.github/workflows/test-and-release.yml`) type-checks, lints and runs
`test:package`, then `test:integration` on Node 22/24/26 × Linux/Windows/macOS with `build: true`, and publishes to
npm on version tags.
