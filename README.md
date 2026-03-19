# cosmos-lib

A reusable TypeScript library for astronomical data, coordinate math, sky maps, NASA APIs, media loading, and UI transitions. Zero runtime dependencies — Three.js support is an optional peer dependency in a separate entry point.

## Install

```bash
npm install cosmos-lib
# optional — only needed if you use cosmos-lib/three
npm install three
```

## Structure

```
cosmos-lib/
├── src/
│   ├── index.ts          ← main entry point
│   ├── constants.ts      ← astronomical constants
│   ├── types.ts          ← all shared TypeScript types
│   ├── units.ts          ← unit conversions + formatting
│   ├── math.ts           ← coordinate transforms, orbital mechanics
│   ├── media.ts          ← progressive image loading, CDN helpers
│   ├── api.ts            ← NASA Image API, APOD, ESA Hubble, Simbad
│   ├── skymap.ts         ← stereographic / mollweide / gnomonic projections
│   ├── transitions.ts    ← View Transitions API, stagger, hero expand
│   ├── data/
│   │   ├── catalog.ts    ← 35+ typed celestial objects
│   │   └── index.ts      ← search, filter, nearby query
│   └── three/            ← optional Three.js helpers (separate entry point)
│       ├── factories.ts  ← createPlanet, createNebula, createAtmosphere …
│       ├── lod.ts        ← LODTextureManager
│       ├── flight.ts     ← CameraFlight (no GSAP needed)
│       └── shaders.ts    ← atmosphere GLSL shaders
└── tests/                ← Vitest test suite (100+ tests)
```

## Quick start

```ts
import Cosmos from 'cosmos-lib'

// Search the built-in catalog
const results = Cosmos.Data.search('orion')
const nebulae = Cosmos.Data.getByType('nebula')
const near    = Cosmos.Data.nearby({ ra: 83.8, dec: -5.4 }, 20)

// Coordinate transforms
const { alt, az } = Cosmos.Math.equatorialToHorizontal(
  { ra: 101.287, dec: -16.716 },           // Sirius
  { lat: 47.05,  lng: 8.31, date: new Date() }  // Lucerne
)

// Local Sidereal Time
const lst = Cosmos.Math.lst(new Date(), 8.31)

// Unit formatting
Cosmos.Units.formatDistance(9_460_730_472_580 * 8.6)  // "8.600 ly"
Cosmos.Units.formatRA(83.822)                          // "5h 35m 17.3s"
Cosmos.Units.formatAngle(-16.716)                      // "-16°42′57.6″"

// NASA APIs
const apod = await Cosmos.API.NASA.apod()
const imgs = await Cosmos.API.NASA.searchImages('pillars of creation', { pageSize: 5 })

// Astronomy Picture of the Day
console.log(apod.title, apod.hdUrl)

// Reliable image loading with automatic fallback chain
const url = await Cosmos.Media.chainLoad([
  'https://commons.wikimedia.org/wiki/Special:FilePath/Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg',
  'https://upload.wikimedia.org/fallback.jpg',
])

// Progressive blur-up on an img or div element
await Cosmos.Media.progressive(imgElement, {
  placeholder: tinyBase64Blur,
  src:         'image-800w.jpg',
  srcHD:       'image-2400w.jpg',
})

// Sky map on a canvas
import { renderSkyMap } from 'cosmos-lib'
renderSkyMap(canvas, Cosmos.Data.all(), {
  projection:          'stereographic',
  center:              { ra: 83.8, dec: -5.4 },
  scale:               300,
  showGrid:            true,
  showMagnitudeLimit:  8,
})

// UI transitions
import { staggerIn, morph, heroExpand } from 'cosmos-lib'

await staggerIn(gridElement, { stagger: 60, from: 'bottom' })
await morph(() => { panel.classList.toggle('open') }, { duration: 400 })
heroExpand(cardElement, { duration: 500, onDone: () => console.log('done') })
```

## Three.js helpers (optional)

```ts
import {
  createPlanet,
  createNebula,
  createStarField,
  createOrbit,
  LODTextureManager,
  CameraFlight,
} from 'cosmos-lib/three'
import * as THREE from 'three'

// Textured planet with atmosphere and rings
const { group, dispose } = createPlanet({
  radius:      6.5,
  textureUrl:  'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  bumpUrl:     'https://unpkg.com/three-globe/example/img/earth-topology.png',
  atmosphere:  { color: 0x4488ff, intensity: 1.3 },
}, THREE)
scene.add(group)

// Nebula sprite with fallback URL chain
const { group: nebulaGroup } = createNebula({
  radius:      3000,
  textureUrls: [
    'https://commons.wikimedia.org/wiki/Special:FilePath/Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg',
  ],
}, THREE)
scene.add(nebulaGroup)

// Automatic texture LOD by camera distance
const lod = new LODTextureManager(THREE)
lod.register(earthMesh, 'earth-512.jpg', 'earth-4k.jpg', 500)
// In render loop:
lod.update(camera)

// Smooth camera flights without GSAP
const flight = new CameraFlight(camera, controls, THREE)
flight.flyTo({ x: 100, y: 50, z: 200 }, { x: 0, y: 0, z: 0 }, {
  duration: 2000,
  easing:   'inOut',
  onDone:   () => console.log('arrived'),
})
```

## Named exports (tree-shakeable)

```ts
// Import only what you need
import { AstroMath }    from 'cosmos-lib'
import { Data }         from 'cosmos-lib'
import { NASA }         from 'cosmos-lib'
import { renderSkyMap } from 'cosmos-lib'
import { staggerIn }    from 'cosmos-lib'
import { Units }        from 'cosmos-lib'
```

## API reference

### `Data`
| Method | Returns | Description |
|---|---|---|
| `get(id)` | `CelestialObject \| null` | Lookup by exact ID |
| `getByName(name)` | `CelestialObject \| null` | Case-insensitive name or alias |
| `all()` | `CelestialObject[]` | Full catalog copy |
| `getByType(type)` | `CelestialObject[]` | Filter by type |
| `getByTag(tag)` | `CelestialObject[]` | Filter by tag |
| `search(query)` | `CelestialObject[]` | Fuzzy search, sorted by relevance |
| `nearby(center, radius)` | `ProximityResult[]` | Angular proximity search |

### `AstroMath`
| Method | Description |
|---|---|
| `toJulian(date)` | Date → Julian Date number |
| `fromJulian(jd)` | Julian Date → Date |
| `gmst(date)` | Greenwich Mean Sidereal Time (degrees) |
| `lst(date, lng)` | Local Sidereal Time (degrees) |
| `equatorialToHorizontal(eq, obs)` | RA/Dec → Alt/Az |
| `horizontalToEquatorial(hor, obs)` | Alt/Az → RA/Dec |
| `eclipticToEquatorial(ecl)` | Ecliptic → Equatorial (J2000) |
| `galacticToEquatorial(gal)` | Galactic → Equatorial (J2000) |
| `angularSeparation(a, b)` | Great-circle separation (degrees) |
| `apparentMagnitude(abs, dist)` | Absolute mag + distance → apparent mag |
| `planetEcliptic(planet, date)` | Simplified planetary position |

### `NASA` / `ESA`
| Method | Description |
|---|---|
| `NASA.setApiKey(key)` | Set key for higher rate limits |
| `NASA.searchImages(query, opts)` | Search NASA image library |
| `NASA.apod(date?)` | Astronomy Picture of the Day |
| `NASA.recentAPOD(count)` | Recent APOD entries |
| `NASA.getBestImageUrl(nasaId)` | Highest-res URL for a NASA image ID |
| `ESA.searchHubble(query)` | Search ESA Hubble archive |
| `resolveSimbad(name)` | Resolve any object name via CDS Simbad |

## Development

```bash
npm install
npm test             # run tests
npm run test:watch   # watch mode
npm run typecheck    # tsc --noEmit
npm run build        # compile to dist/
```

## License

MIT
