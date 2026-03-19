# Guide: Catalog Data

cosmos-lib ships with a comprehensive set of built-in astronomical catalogs covering the solar system, bright stars, deep-sky objects, constellations, and meteor showers. This guide covers what data is included, the schemas used, querying patterns, the image resolution pipeline, and tips for extending with your own data.

---

## Overview of Included Catalogs

| Catalog | Count | Access | Description |
|---------|-------|--------|-------------|
| Solar system bodies | 10 | `SOLAR_SYSTEM` | Sun, 8 planets, Moon |
| Bright stars | ~225 | `BRIGHT_STARS` | IAU-named stars sorted by apparent magnitude |
| Messier objects | 110 | `MESSIER_CATALOG` | All 110 Messier deep-sky objects |
| Constellations | 88 | `CONSTELLATIONS` | All 88 IAU constellations with stick-figure data |
| Meteor showers | ~23 | `METEOR_SHOWERS` | Major annual meteor showers with radiant positions |
| Deep-sky extras | 5 | `DEEP_SKY_EXTRAS` | Notable non-Messier objects (Helix Nebula, Omega Centauri, Sgr A*, M87 black hole, Milky Way) |

All raw catalogs are available as direct imports for tree-shaking. They are also merged into a unified collection accessible through the `Data` facade:

```ts
import { Data } from '@motioncomplex/cosmos-lib'

const everything = Data.all() // ~420+ unified CelestialObject entries
```

---

## Data Schemas

### `BrightStar`

```ts
interface BrightStar {
  id: string      // IAU name, slugified (e.g. 'sirius')
  name: string    // IAU proper name (e.g. 'Sirius')
  con: string     // 3-letter IAU constellation abbreviation (e.g. 'CMa')
  hr: number      // Harvard Revised catalog number
  ra: number      // Right Ascension in degrees (J2000)
  dec: number     // Declination in degrees (J2000)
  mag: number     // Apparent visual magnitude
  spec: string    // Spectral type (e.g. 'A1V')
  pmRa: number    // Proper motion in RA (mas/yr, includes cos(dec) factor)
  pmDec: number   // Proper motion in Dec (mas/yr)
  bv: number      // B-V color index
}
```

### `MessierObject`

```ts
interface MessierObject {
  messier: number              // Messier number (1-110)
  name: string                 // Common name (e.g. 'Orion Nebula')
  ngc?: string                 // NGC/IC cross-reference (e.g. 'NGC 1976')
  type: 'nebula' | 'cluster' | 'galaxy'
  subtype: string              // e.g. 'emission nebula', 'globular cluster', 'spiral galaxy'
  constellation: string        // 3-letter abbreviation
  ra: number                   // RA in degrees (J2000)
  dec: number                  // Dec in degrees (J2000)
  mag: number | null           // Apparent visual magnitude
  size_arcmin?: number         // Angular size in arcminutes
  distance_kly?: number        // Distance in kilo-light-years
  description: string          // Brief description
}
```

### `Constellation`

```ts
interface Constellation {
  abbr: string           // 3-letter IAU abbreviation (e.g. 'Ori')
  name: string           // Full name (e.g. 'Orion')
  genitive: string       // Genitive form (e.g. 'Orionis')
  ra: number             // Approximate center RA for labelling (degrees)
  dec: number            // Approximate center Dec for labelling (degrees)
  area: number           // IAU official area in square degrees
  stickFigure: number[][] // Line segments: [ra1, dec1, ra2, dec2] per segment
  brightestStar: string  // IAU proper name of the brightest star
}
```

### `MeteorShower`

```ts
interface MeteorShower {
  id: string          // e.g. 'perseids'
  name: string        // e.g. 'Perseids'
  code: string        // IAU 3-letter code (e.g. 'PER')
  radiantRA: number   // Radiant RA in degrees
  radiantDec: number  // Radiant Dec in degrees
  solarLon: number    // Peak solar longitude in degrees
  peakDate: string    // Approximate peak date ('Aug 12')
  start: string       // Activity start date
  end: string         // Activity end date
  zhr: number         // Zenithal Hourly Rate at peak
  speed: number       // Geocentric velocity in km/s
  parentBody?: string // Parent comet or asteroid
}
```

### `CelestialObject` (unified type)

All catalogs are normalised into a unified `CelestialObject` type for the `Data` facade:

```ts
interface CelestialObject {
  id: string
  name: string
  aliases: string[]
  type: 'star' | 'planet' | 'nebula' | 'galaxy' | 'cluster' | 'black-hole' | 'moon'
  subtype?: string
  ra: number | null       // null for solar-system bodies
  dec: number | null
  magnitude: number | null
  distance?: { value: number; unit: 'km' | 'AU' | 'ly' | 'pc' | 'kpc' | 'Mpc' }
  description: string
  tags: string[]
  diameter_km?: number
  mass_kg?: number
  moons?: number
  surface_temp_K?: number
  spectral?: string
  binary?: boolean
  triple?: boolean
}
```

---

## Querying Patterns

### Direct lookup

```ts
// By ID
const mars = Data.get('mars')

// By name or alias (case-insensitive)
const venus = Data.getByName('Morning Star')
const m42 = Data.getByName('NGC 1976') // alias match
```

### Filtering by type or tag

```ts
// All nebulae
const nebulae = Data.getByType('nebula')

// All Messier objects
const messier = Data.getByTag('messier')

// All solar system bodies
const solarSystem = Data.getByTag('solar-system')
```

### Fuzzy search

`Data.search` performs a weighted fuzzy search across name, aliases, description, subtype, and tags. Results are ranked by relevance:

```ts
const results = Data.search('orion')
// Returns: Orion Nebula (M42), De Mairan's Nebula (M43), Betelgeuse, etc.

const spirals = Data.search('spiral')
// Returns: all spiral galaxies
```

Scoring weights (highest to lowest): exact ID match (100), exact name match (90), alias exact match (80), name starts-with (50), alias contains (20), name contains (15), subtype contains (10), tag match (8), description contains (5).

### Proximity search

Find objects near a sky position. Uses the haversine formula for angular separation:

```ts
// Objects within 5 degrees of the Orion Nebula
const nearby = Data.nearby({ ra: 83.82, dec: -5.39 }, 5)
nearby.forEach(r => {
  console.log(`${r.object.name}: ${r.separation.toFixed(2)} degrees`)
})
```

For star-specific proximity:

```ts
const nearbyStars = Data.nearbyStars({ ra: 83.82, dec: -5.39 }, 10)
```

### Typed catalog access

Access individual catalogs directly for type-safe queries:

```ts
// Stars
const stars = Data.stars()                        // all ~225 bright stars
const sirius = Data.getStarByName('Sirius')       // by name
const orionStars = Data.getStarsByConstellation('Ori') // by constellation

// Constellations
const constellations = Data.constellations()      // all 88
const orion = Data.getConstellation('Ori')         // by abbreviation

// Messier
const messierCatalog = Data.messier()             // all 110
const m42 = Data.getMessier(42)                    // by number

// Meteor showers
const showers = Data.showers()                    // all ~23
const active = Data.getActiveShowers(new Date())   // currently active
```

---

## Image Resolution Pipeline

cosmos-lib provides a multi-tier image pipeline: static fallbacks for guaranteed availability, and dynamic API resolution for broader coverage.

### Tier 1: Static Fallbacks (`IMAGE_FALLBACKS`)

A curated registry of Wikimedia Commons images for the most iconic Messier objects. No API call needed -- these are always available.

```ts
import { IMAGE_FALLBACKS } from '@motioncomplex/cosmos-lib'

// Keys are object IDs
const orionImages = IMAGE_FALLBACKS['m42']
// => [{ filename: 'Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg', credit: 'NASA...' }]
```

Currently covers: M1, M8, M16, M17, M20, M27, M31, M42, M45, M51, M57, M81, M101, M104.

### Tier 2: URL Helpers

Build URLs from the fallback registry:

```ts
// Simple URLs (optionally resized)
const urls = Data.imageUrls('m42', 1280)

// Progressive loading config (placeholder + src + srcHD)
const prog = Data.progressiveImage('m42', 1024)
// => { placeholder: '...64px...', src: '...1024px...', srcHD: '...2048px...' }

// Responsive srcset string
const srcset = Data.imageSrcset('m31', [640, 1280, 1920])
```

### Tier 3: Dynamic API Resolution (`resolveImages`)

Search NASA and/or ESA image APIs for any object by name. Works for objects not in the static registry:

```ts
const images = await Data.resolveImages('Crab Nebula', {
  source: 'all',  // 'nasa' | 'esa' | 'all'
  limit: 3,
})

images.forEach(img => {
  console.log(img.title)
  console.log(img.urls)       // multi-resolution URLs, highest quality first
  console.log(img.previewUrl) // thumbnail
  console.log(img.credit)     // attribution string
  console.log(img.source)     // 'nasa' or 'esa'
})
```

### Tier 4: Loading with `Media.chainLoad`

Combine tiers for a robust fallback chain:

```ts
import { Data, Media } from '@motioncomplex/cosmos-lib'

// Static fallback URLs
const staticUrls = Data.imageUrls('m42', 1280)

// Try static first, then fall back to a generic CDN
const url = await Media.chainLoad([
  ...staticUrls,
  '/local-fallback/m42.jpg',
])

document.querySelector('img')!.src = url
```

### Full pipeline for progressive loading

```ts
const hero = document.getElementById('hero')!

// Option A: from static registry
const prog = Data.progressiveImage('m42', 1024)
if (prog) {
  await Media.progressive(hero, prog)
}

// Option B: from dynamic API resolution
const images = await Data.resolveImages('Orion Nebula', { limit: 1 })
if (images.length > 0) {
  await Media.progressive(hero, {
    placeholder: images[0].previewUrl ?? undefined,
    src: images[0].urls[images[0].urls.length - 1]!, // lowest res
    srcHD: images[0].urls[0],                          // highest res
  })
}
```

---

## Tips for Extending with Custom Data

### Adding custom objects to the unified catalog

The unified catalog is built at module load time. To add custom objects, create `CelestialObject` entries and concatenate them:

```ts
import { Data, type CelestialObject } from '@motioncomplex/cosmos-lib'

const customObjects: CelestialObject[] = [
  {
    id: 'barnards-star',
    name: "Barnard's Star",
    aliases: ['HIP 87937'],
    type: 'star',
    ra: 269.452,
    dec: 4.693,
    magnitude: 9.54,
    spectral: 'M4Ve',
    description: 'Closest single star to the Sun after the Alpha Centauri system.',
    tags: ['star', 'nearby', 'red-dwarf'],
  },
]

// Merge with built-in catalog for rendering
const allObjects = [...Data.all(), ...customObjects]
renderSkyMap(canvas, allObjects, { projection: 'mollweide' })
```

### Adding custom image fallbacks

Extend the image pipeline by providing your own Wikimedia filenames:

```ts
import { Media } from '@motioncomplex/cosmos-lib'

const CUSTOM_IMAGES: Record<string, string[]> = {
  'barnards-star': ['Barnard_Star_2005.jpg'],
}

function getImageUrls(id: string, width?: number): string[] {
  const filenames = CUSTOM_IMAGES[id] ?? []
  return filenames.map(f => Media.wikimediaUrl(f, width))
}
```

### Using constellation data for overlays

The `CONSTELLATIONS` array includes stick-figure line segments. Pass it to `renderSkyMap` or iterate it yourself:

```ts
import { CONSTELLATIONS } from '@motioncomplex/cosmos-lib'

const orion = CONSTELLATIONS.find(c => c.abbr === 'Ori')!
console.log(`${orion.name}: ${orion.stickFigure.length} line segments`)

// Each segment: [ra1, dec1, ra2, dec2] in degrees
orion.stickFigure.forEach(seg => {
  const [ra1, dec1, ra2, dec2] = seg
  // draw line from (ra1, dec1) to (ra2, dec2)
})
```

### Checking active meteor showers

```ts
import { Data } from '@motioncomplex/cosmos-lib'

const active = Data.getActiveShowers(new Date('2025-08-12'))
active.forEach(s => {
  console.log(`${s.name}: ZHR ${s.zhr}, speed ${s.speed} km/s`)
  if (s.parentBody) console.log(`  Parent body: ${s.parentBody}`)
})
```

This uses the Sun's ecliptic longitude compared against each shower's peak solar longitude, with a +/-20 degree activity window.
