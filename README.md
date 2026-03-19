# cosmos-lib

Reusable TypeScript library for astronomical data, coordinate math, sky maps, NASA/ESA APIs, media loading, and UI transitions. Zero runtime dependencies — Three.js support is an optional peer dependency in a separate entry point.

## Install

```bash
npm install @motioncomplex/cosmos-lib
# optional — only needed if you use cosmos-lib/three
npm install three
```

## Quick start

```ts
import Cosmos from '@motioncomplex/cosmos-lib'

// Search the built-in catalog (300+ stars, 110 Messier, 88 constellations)
const results = Cosmos.Data.search('orion')
const nebulae = Cosmos.Data.getByType('nebula')
const near    = Cosmos.Data.nearby({ ra: 83.8, dec: -5.4 }, 20)

// Coordinate transforms
const { alt, az } = Cosmos.Math.equatorialToHorizontal(
  { ra: 101.287, dec: -16.716 },                // Sirius
  { lat: 47.05,  lng: 8.31, date: new Date() }  // Lucerne
)

// Sun, Moon & eclipses
const sunPos    = Cosmos.Sun.position()
const moonPhase = Cosmos.Moon.phase()
const twilight  = Cosmos.Sun.twilight({ lat: 51.5, lng: -0.1 })

// NASA APIs
const apod = await Cosmos.API.NASA.apod()
const imgs = await Cosmos.API.NASA.searchImages('pillars of creation', { pageSize: 5 })
```

## Tree-shakeable named exports

```ts
import { AstroMath, Data, NASA, Units, renderSkyMap, staggerIn } from '@motioncomplex/cosmos-lib'
```

## Three.js helpers (optional)

```ts
import { createPlanet, LODTextureManager, CameraFlight } from '@motioncomplex/cosmos-lib/three'
import * as THREE from 'three'

const { group, dispose } = createPlanet({
  radius: 6.5,
  textureUrl: 'earth-bluemarble-4k.jpg',
  atmosphere: { color: 0x4488ff, intensity: 1.3 },
}, THREE)
scene.add(group)
```

## Features

| Module | Description | Docs |
|--------|-------------|------|
| **Data** | 300+ bright stars, 110 Messier objects, 88 constellations, 20 meteor showers, solar system bodies. Fuzzy search, proximity queries, image resolution. | [Data](docs/api/data.md) |
| **AstroMath** | Julian dates, sidereal time, coordinate transforms (equatorial, horizontal, galactic, ecliptic), Kepler solver, planetary ephemeris, precession, nutation, refraction, rise/transit/set. | [Math](docs/api/math.md) |
| **Sun / Moon / Eclipse** | Solar & lunar positions, moon phases, twilight times, eclipse prediction. | [Sun/Moon/Eclipse](docs/api/sun-moon-eclipse.md) |
| **NASA / ESA / Simbad** | NASA Image Library, APOD, ESA Hubble archive, CDS Simbad object resolution. | [API Integrations](docs/api/api-integrations.md) |
| **Sky Map** | Stereographic, Mollweide, and gnomonic projections. Canvas-based star chart rendering with constellation overlays. | [Sky Map](docs/api/skymap.md) |
| **Media** | Progressive image loading with fallback chains, Wikimedia/Cloudinary URL builders, responsive `srcset` generation. | [Media](docs/api/media.md) |
| **Transitions** | View Transitions API wrappers: morph, stagger reveal, fade, crossfade, hero expand/collapse. | [Transitions](docs/api/transitions.md) |
| **Three.js** | Planet/nebula/starfield factories, LOD texture management, camera flights. Optional peer dependency. | [Three.js](docs/api/three.md) |
| **Constants & Units** | Astronomical constants (IAU 2012), distance/angle conversions, RA/Dec formatters. | [Constants & Units](docs/api/constants-and-units.md) |

## Documentation

Full documentation lives in the [`docs/`](docs/README.md) folder:

- [Getting Started](docs/getting-started.md) — installation, import patterns, quick start
- [API Reference](docs/README.md#api-reference) — per-module docs with signatures, parameters, and examples
- [Guides](docs/README.md#guides) — conceptual walkthroughs for coordinate systems, catalog data, and Three.js integration
- [Type Reference](docs/types.md) — quick-reference table of all exported types

Generate HTML API docs from TSDoc comments:

```bash
npm run docs
```

## Development

```bash
npm install
npm test              # run tests
npm run test:watch    # watch mode
npm run typecheck     # tsc --noEmit
npm run build         # compile to dist/
npm run docs          # generate TypeDoc API reference
```

## License

MIT
