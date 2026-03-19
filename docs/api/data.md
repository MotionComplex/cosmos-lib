# Data

Unified data-access facade for all built-in astronomical catalogs. Merges solar-system bodies, bright stars, Messier objects, and deep-sky extras into a single searchable collection, with typed accessors for individual catalogs and image-resolution helpers.

```ts
import { Data } from '@motioncomplex/cosmos-lib'
```

---

## Core Queries

### `Data.get(id: string): CelestialObject | null`

Look up a celestial object by its exact identifier.

| Parameter | Type | Description |
|---|---|---|
| `id` | `string` | Unique object ID (e.g. `'mars'`, `'m42'`, `'sirius'`). |

**Returns:** `CelestialObject | null`

```ts
Data.get('mars')        // => { id: 'mars', name: 'Mars', type: 'planet', ... }
Data.get('nonexistent') // => null
```

### `Data.getByName(name: string): CelestialObject | null`

Look up a celestial object by name or any known alias (case-insensitive).

| Parameter | Type | Description |
|---|---|---|
| `name` | `string` | Common name or alias (e.g. `'Sirius'`, `'Morning Star'`, `'NGC 1976'`). |

**Returns:** `CelestialObject | null`

```ts
Data.getByName('Sirius')       // => { id: 'sirius', name: 'Sirius', type: 'star', ... }
Data.getByName('morning star') // => { id: 'venus', name: 'Venus', ... }
```

### `Data.all(): CelestialObject[]`

Return a shallow copy of the full unified catalog. Safe to sort, filter, or mutate.

**Returns:** `CelestialObject[]` -- new array containing every object (~420+ entries).

```ts
const catalog = Data.all()
console.log(catalog.length) // ~420+
```

### `Data.getByType(type: ObjectType): CelestialObject[]`

Filter the unified catalog by object type.

| Parameter | Type | Description |
|---|---|---|
| `type` | `ObjectType` | `'star'` \| `'planet'` \| `'nebula'` \| `'galaxy'` \| `'cluster'` \| `'black-hole'` \| `'moon'` |

**Returns:** `CelestialObject[]`

```ts
Data.getByType('nebula')  // => [{ id: 'm1', name: 'Crab Nebula', ... }, ...]
Data.getByType('planet')  // => [{ id: 'mercury', ... }, { id: 'venus', ... }, ...]
```

### `Data.getByTag(tag: string): CelestialObject[]`

Filter the unified catalog by a tag string.

| Parameter | Type | Description |
|---|---|---|
| `tag` | `string` | A tag to match (e.g. `'messier'`, `'solar-system'`, `'globular'`). |

**Returns:** `CelestialObject[]`

```ts
Data.getByTag('messier')      // => all 110 Messier catalog entries
Data.getByTag('solar-system') // => Sun, planets, and Moon
```

### `Data.search(query: string): CelestialObject[]`

Fuzzy search across name, aliases, description, tags, and subtype. Results are ranked by weighted relevance: exact ID/name matches rank highest, followed by alias matches, partial name matches, description hits, and tag hits. Sorted highest-score first.

| Parameter | Type | Description |
|---|---|---|
| `query` | `string` | Search term (case-insensitive). Empty string returns `[]`. |

**Returns:** `CelestialObject[]` -- sorted by relevance.

```ts
Data.search('orion')  // => [Orion Nebula (M42), De Mairan's Nebula (M43), Betelgeuse, ...]
Data.search('spiral') // => all objects with 'spiral' in name, subtype, description, or tags
```

### `Data.nearby(center: EquatorialCoord, radiusDeg: number): ProximityResult[]`

Find all objects within a given angular radius of a sky position. Only objects with known RA/Dec are considered. Results are sorted by separation, nearest first.

| Parameter | Type | Description |
|---|---|---|
| `center` | `EquatorialCoord` | `{ ra, dec }` in degrees -- the sky position to search around. |
| `radiusDeg` | `number` | Search radius in degrees. |

**Returns:** `ProximityResult[]` -- each entry has `{ object: CelestialObject, separation: number }`.

```ts
// Find objects within 5 degrees of the Orion Nebula
const nearby = Data.nearby({ ra: 83.82, dec: -5.39 }, 5)
nearby.forEach(r => console.log(`${r.object.name}: ${r.separation.toFixed(2)} deg`))
```

---

## Image Helpers

### `Data.imageUrls(id: string, width?: number): string[]`

Get static Wikimedia image URLs from the curated fallback registry. No API call needed.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | | Object ID (e.g. `'m42'`, `'m31'`). |
| `width` | `number` | `undefined` | Optional pixel width for Wikimedia thumbnail resizing. |

**Returns:** `string[]` -- Wikimedia Commons thumbnail URLs, or empty array if no images registered.

```ts
Data.imageUrls('m42', 1280) // => ['https://upload.wikimedia.org/...']
Data.imageUrls('mercury')   // => []
```

### `Data.progressiveImage(id: string, width?: number): ProgressiveImageOptions | null`

Build a progressive-loading image config from the static fallback registry: a 64 px placeholder, a standard-resolution source, and a 2x HD source.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | | Object ID. |
| `width` | `number` | `800` | Target width in pixels for the standard source. |

**Returns:** `ProgressiveImageOptions | null`

```ts
Data.progressiveImage('m42', 1024)
// => { placeholder: '...64px...', src: '...1024px...', srcHD: '...2048px...' }
```

### `Data.imageSrcset(id: string, widths?: number[]): string | null`

Generate an HTML `srcset` string from the static fallback registry.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `id` | `string` | | Object ID. |
| `widths` | `number[]` | `[640, 1280, 1920]` | Array of pixel widths to include. |

**Returns:** `string | null` -- a comma-separated `srcset`-formatted string, or `null` if no images registered.

```ts
Data.imageSrcset('m31')
// => '...640px-... 640w, ...1280px-... 1280w, ...1920px-... 1920w'
```

### `Data.resolveImages(name: string, opts?: ResolveImageOptions): Promise<ResolvedImage[]>`

Search NASA and/or ESA APIs for images of any celestial object by name. Unlike the static helpers above, this works for any object -- not limited to the curated fallback registry.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `name` | `string` | | Object name to search (e.g. `'Orion Nebula'`, `'M42'`). |
| `opts` | `ResolveImageOptions` | `{}` | `{ source?: 'nasa' \| 'esa' \| 'all', limit?: number }` |

Default options: `{ source: 'nasa', limit: 5 }`.

**Returns:** `Promise<ResolvedImage[]>` -- each result has `{ urls, previewUrl, title, credit, source }`.

```ts
const images = await Data.resolveImages('Crab Nebula', { source: 'all', limit: 3 })
images.forEach(img => console.log(img.title, img.urls[0]))
```

---

## Star Functions

### `Data.stars(): readonly BrightStar[]`

Get all bright stars in the catalog (~200 IAU named stars).

```ts
const stars = Data.stars()
console.log(stars[0].name) // 'Sirius'
```

### `Data.getStarByName(name: string): BrightStar | null`

Look up a bright star by its IAU proper name (case-insensitive).

| Parameter | Type | Description |
|---|---|---|
| `name` | `string` | IAU proper name (e.g. `'Sirius'`, `'Betelgeuse'`, `'Polaris'`). |

**Returns:** `BrightStar | null`

```ts
Data.getStarByName('Sirius')
// => { id: 'sirius', name: 'Sirius', con: 'CMa', mag: -1.46, ... }
```

### `Data.getStarsByConstellation(con: string): BrightStar[]`

Get all bright stars belonging to a given constellation.

| Parameter | Type | Description |
|---|---|---|
| `con` | `string` | 3-letter IAU abbreviation (case-insensitive), e.g. `'Ori'`, `'CMa'`, `'UMa'`. |

**Returns:** `BrightStar[]`

```ts
Data.getStarsByConstellation('Ori')
// => [Rigel, Betelgeuse, Bellatrix, Alnilam, Alnitak, Mintaka, Saiph]
```

### `Data.nearbyStars(center: EquatorialCoord, radiusDeg: number): Array<{ star: BrightStar; separation: number }>`

Find bright stars within a given angular radius. Sorted by separation (nearest first).

| Parameter | Type | Description |
|---|---|---|
| `center` | `EquatorialCoord` | `{ ra, dec }` in degrees. |
| `radiusDeg` | `number` | Search radius in degrees. |

**Returns:** `Array<{ star: BrightStar; separation: number }>`

```ts
const nearby = Data.nearbyStars({ ra: 101.287, dec: -16.716 }, 10)
nearby.forEach(r => console.log(`${r.star.name}: ${r.separation.toFixed(2)} deg`))
```

---

## Constellation Functions

### `Data.constellations(): readonly Constellation[]`

Get all 88 IAU constellations.

```ts
const all = Data.constellations()
console.log(all.length) // 88
```

### `Data.getConstellation(abbr: string): Constellation | null`

Look up a constellation by its 3-letter IAU abbreviation (case-insensitive).

| Parameter | Type | Description |
|---|---|---|
| `abbr` | `string` | The abbreviation (e.g. `'Ori'`, `'UMa'`, `'Sco'`). |

**Returns:** `Constellation | null`

```ts
Data.getConstellation('Ori')
// => { abbr: 'Ori', name: 'Orion', genitive: 'Orionis', area: 594, ... }
```

---

## Messier Functions

### `Data.messier(): readonly MessierObject[]`

Get all 110 Messier objects.

```ts
const catalog = Data.messier()
console.log(catalog.length) // 110
```

### `Data.getMessier(number: number): MessierObject | null`

Look up a Messier object by its catalog number (1--110).

| Parameter | Type | Description |
|---|---|---|
| `number` | `number` | The Messier number. |

**Returns:** `MessierObject | null`

```ts
Data.getMessier(42)
// => { messier: 42, name: 'Orion Nebula', type: 'nebula', mag: 4.0, ... }

Data.getMessier(1)
// => { messier: 1, name: 'Crab Nebula', ... }
```

---

## Shower Functions

### `Data.showers(): readonly MeteorShower[]`

Get all meteor showers in the catalog (~23 significant annual showers).

```ts
const showers = Data.showers()
const perseids = showers.find(s => s.id === 'perseids')
console.log(perseids?.zhr) // 100
```

### `Data.getActiveShowers(date: Date): MeteorShower[]`

Get meteor showers active on a given date. Computes the Sun's ecliptic longitude and compares against each shower's peak solar longitude within a +/-20 degree activity window.

| Parameter | Type | Description |
|---|---|---|
| `date` | `Date` | The date to check. |

**Returns:** `MeteorShower[]`

```ts
const active = Data.getActiveShowers(new Date('2025-08-12'))
console.log(active.map(s => s.name))
// => ['Perseids', 'Kappa Cygnids', ...]
```

---

## Direct Catalog Exports

For tree-shaking or direct access, the raw catalog arrays and registries are also available as named exports:

```ts
import {
  SOLAR_SYSTEM,
  BRIGHT_STARS,
  MESSIER_CATALOG,
  CONSTELLATIONS,
  METEOR_SHOWERS,
  DEEP_SKY_EXTRAS,
  IMAGE_FALLBACKS,
  PLANET_TEXTURES,
  STAR_TEXTURES,
} from '@motioncomplex/cosmos-lib'
```

| Export | Type | Description |
|---|---|---|
| `SOLAR_SYSTEM` | `readonly CelestialObject[]` | Sun, planets, and Moon with physical properties. |
| `BRIGHT_STARS` | `readonly BrightStar[]` | ~200 IAU-named bright stars with RA, Dec, magnitude, spectral type, and constellation. |
| `MESSIER_CATALOG` | `readonly MessierObject[]` | All 110 Messier objects with coordinates, magnitude, type, NGC designations, and descriptions. |
| `CONSTELLATIONS` | `readonly Constellation[]` | All 88 IAU constellations with abbreviation, name, genitive form, area, and stick-figure line data. |
| `METEOR_SHOWERS` | `readonly MeteorShower[]` | ~23 annual meteor showers with peak solar longitude, ZHR, radiant coordinates, and active dates. |
| `DEEP_SKY_EXTRAS` | `readonly CelestialObject[]` | Additional deep-sky objects not in the Messier catalog. |
| `IMAGE_FALLBACKS` | `Readonly<Record<string, ImageRef[]>>` | Curated Wikimedia Commons images keyed by object ID. |
| `PLANET_TEXTURES` | `Readonly<Record<string, TextureInfo>>` | Planet/moon surface texture URLs (NASA/JPL public-domain). |
| `STAR_TEXTURES` | `Readonly<Record<string, TextureInfo>>` | Star field and Milky Way panorama texture URLs. |

### PLANET_TEXTURES

Includes textures for: `sun`, `mercury`, `venus`, `venus_atmosphere`, `earth`, `earth_night`, `earth_clouds`, `moon`, `mars`, `jupiter`, `saturn`, `saturn_ring`, `uranus`, `neptune`.

Each entry is a `TextureInfo` object:

```ts
interface TextureInfo {
  id: string
  name: string
  urls: string[]     // ordered by quality (highest first)
  credit: string
  license: 'public-domain' | 'CC0' | 'CC-BY'
  width: number
  height: number
}
```

```ts
import { PLANET_TEXTURES } from '@motioncomplex/cosmos-lib'

const earth = PLANET_TEXTURES['earth']
console.log(earth.name)    // 'Earth Blue Marble'
console.log(earth.width)   // 8192
console.log(earth.urls[0]) // Wikimedia Commons URL
```

### STAR_TEXTURES

Includes: `milky_way` (ESO/S. Brunier, CC-BY, 9000x3600) and `star_field` (NASA/GSFC, public-domain, 8192x4096).

```ts
import { STAR_TEXTURES } from '@motioncomplex/cosmos-lib'

const milkyWay = STAR_TEXTURES['milky_way']
console.log(milkyWay.credit)  // 'ESO/S. Brunier'
console.log(milkyWay.license) // 'CC-BY'
```
