# cosmos-lib — Development Guide

## Project overview

`@motioncomplex/cosmos-lib` is an astronomical calculation and visualisation library for the web. Pure math + bundled catalogs, no external API dependencies for core computations. Published on public npm with three entry points: main, `/three`, `/react`.

## Versioning & release workflow

**Use `/release [patch|minor|major]` to publish a new version.** This handles everything: pre-flight checks, version bump, example app sync, commit, and tag.

### Key rules

- **Library version** lives in root `package.json` (currently semver, 1.x.x range)
- **Example apps must stay in sync** — both `examples/observatory-app/package.json` and `examples/react-native-app/package.json` reference the lib as `^<version>` and must be updated on every release
- **Never push automatically** — the CI publish workflow triggers on push to main, so always let the user decide when to push
- **CI does the publishing** — `.github/workflows/publish.yml` runs typecheck + test + build + `npm publish --provenance` on push to main
- **Commit format for releases:** `chore: release v<version>`
- **Tags:** `v<version>` (e.g. `v1.0.18`)

### Example app dependency strategy

| App | Dev imports | Prod dependency |
|-----|-----------|-----------------|
| `observatory-app` | Vite aliases to `../../src` (live source) | `@motioncomplex/cosmos-lib: ^x.x.x` in package.json |
| `react-native-app` | Published npm package directly | `@motioncomplex/cosmos-lib: ^x.x.x` in package.json |

## Build & test

```bash
npm run build        # vite build + tsc declarations
npm run test         # vitest run
npm run typecheck    # tsc --noEmit
npm run lint         # eslint src tests
npm run size         # bundle size check (max 200KB)
```

## Architecture

- `src/` — core library source (TypeScript, ESM)
- `src/react/` — React hooks & components (optional, subpath export)
- `src/three/` — Three.js scene helpers (optional, subpath export)
- `src/data/` — bundled catalogs (stars, deep-sky, solar system, meteor showers)
- `examples/observatory-app/` — Vite + React web demo
- `examples/react-native-app/` — Expo/React Native demo
- `tests/` — vitest test suite
- `docs/` — API documentation

## Peer dependencies

- `three` (>=0.150.0) — optional, only needed for `/three` subpath
- React is NOT a peer dep (removed to avoid Expo conflicts) — `/react` subpath uses whatever React the consumer provides
