# Getting Started

## Installation

```bash
npm install @motioncomplex/cosmos-lib
```

For Three.js scene helpers (planet/nebula factories, camera flights, LOD management), install Three.js as a peer dependency:

```bash
npm install @motioncomplex/cosmos-lib three
```

Three.js is fully optional. The core library has zero runtime dependencies and works without it.

---

## Import Patterns

### Default namespace import

The default export bundles all core modules into a single `Cosmos` namespace:

```ts
import Cosmos from '@motioncomplex/cosmos-lib'

const jd = Cosmos.Math.julianDate(new Date())
const sunPos = Cosmos.Sun.position(jd)
const moon = Cosmos.Moon.phase()
const results = Cosmos.Data.search('orion')
```

### Named imports (tree-shakable)

For smaller bundles, import only what you need:

```ts
import { AstroMath, Sun, Moon, Data, NASA, renderSkyMap } from '@motioncomplex/cosmos-lib'
```

### Three.js sub-path

Three.js helpers live in a separate entry point to keep the core bundle free of any Three.js dependency:

```ts
import { createPlanet, createNebula, CameraFlight, LODTextureManager } from '@motioncomplex/cosmos-lib/three'
```

### Type imports

All types and interfaces are available as type-only imports:

```ts
import type { EquatorialCoord, MoonPhase, CelestialObject, SkyMapRenderOptions } from '@motioncomplex/cosmos-lib'
import type { PlanetOptions, FlightOptions } from '@motioncomplex/cosmos-lib/three'
```

---

## Quick Start

### Query catalog data

```ts
import { Data } from '@motioncomplex/cosmos-lib'

// Search across all catalogs
const results = Data.search('orion')

// Look up a specific object
const sirius = Data.getByName('Sirius')

// Get a Messier object by number
const m42 = Data.getMessier(42)

// Find objects near a sky position
const nearby = Data.nearby({ ra: 83.8, dec: -5.4 }, 5)

// Filter by type
const nebulae = Data.getByType('nebula')

// Active meteor showers for a date
const showers = Data.getActiveShowers(new Date('2025-08-12'))
```

### Coordinate transforms and ephemeris

```ts
import { AstroMath, Sun, Moon, Units } from '@motioncomplex/cosmos-lib'

// Julian date
const jd = AstroMath.julianDate(new Date())

// Equatorial to horizontal
const altAz = AstroMath.equatorialToHorizontal(
  { ra: 101.287, dec: -16.716 },
  { lat: 47.05, lng: 8.31, date: new Date() }
)

// Sun position and twilight
const sunPos = Sun.position(jd)
const twilight = Sun.twilight({ lat: 51.5, lng: -0.1 })

// Moon phase and position
const phase = Moon.phase()
const moonPos = Moon.position(jd)

// Rise, transit, set times
const rts = AstroMath.riseTransitSet(
  { ra: 101.287, dec: -16.716 },
  { lat: 47.05, lng: 8.31, date: new Date() }
)

// Format values for display
Units.formatRA(83.822)         // '5h 35m 17.3s'
Units.formatDec(-5.39)         // "-5\u00b0 23' 24.0\""
```

### NASA / ESA API integration

```ts
import { NASA, ESA, resolveSimbad } from '@motioncomplex/cosmos-lib'

// Set your API key (optional; defaults to DEMO_KEY with rate limits)
NASA.setApiKey('your-api-key')

// Search NASA images
const images = await NASA.searchImages('pillars of creation', { pageSize: 5 })

// Astronomy Picture of the Day
const apod = await NASA.apod()

// Search ESA Hubble archive
const hubble = await ESA.searchHubble('crab nebula', 3)

// Resolve an object through SIMBAD
const simbad = await resolveSimbad('M1')
```

### Render a sky map

```ts
import { renderSkyMap, Data, CONSTELLATIONS } from '@motioncomplex/cosmos-lib'

const canvas = document.querySelector('canvas')!
renderSkyMap(canvas, Data.all(), {
  projection: 'stereographic',
  center: { ra: 83.8, dec: -5.4 },
  scale: 300,
  showGrid: true,
  showLabels: true,
  showConstellationLines: true,
  constellations: CONSTELLATIONS,
})
```

### View Transitions

```ts
import { morph, staggerIn, heroExpand } from '@motioncomplex/cosmos-lib'

// Morph between DOM states
await morph(() => {
  panel.innerHTML = renderStarDetail(nextStar)
}, { duration: 350, easing: 'ease-out' })

// Stagger children into view
await staggerIn(listElement, { stagger: 60, from: 'bottom' })

// Hero expand/collapse
await heroExpand(thumbnail, overlay, { duration: 500 })
```

### Three.js scene (optional)

```ts
import * as THREE from 'three'
import { createPlanet, createStarField, CameraFlight } from '@motioncomplex/cosmos-lib/three'

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 100000)

// Create a planet
const earth = createPlanet({
  radius: 6.5,
  textureUrl: 'earth-bluemarble-4k.jpg',
  atmosphere: { color: 0x4488ff, intensity: 1.3 },
}, THREE)
scene.add(earth.group)

// Background star field
const stars = createStarField({ count: 5000, maxRadius: 10000 }, THREE)
scene.add(stars)

// Animated camera flights
const flight = new CameraFlight(camera, THREE)
flight.flyTo(
  new THREE.Vector3(0, 0, 30),
  new THREE.Vector3(0, 0, 0),
  { duration: 2000, easing: 'inOut' }
)
```

---

## TypeScript Support

The library ships with full TypeScript declarations. Type definitions are generated from source and available at `dist/index.d.ts` (core) and `dist/three/index.d.ts` (Three.js helpers). All public types are re-exported from the main and `/three` entry points.

See the [Type Reference](./types.md) for a complete listing of all exported types and interfaces.
