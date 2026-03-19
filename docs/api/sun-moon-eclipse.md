# Sun, Moon & Eclipse

Solar position and twilight, lunar position and phases, and eclipse prediction.

```ts
import { Sun, Moon, Eclipse } from '@motioncomplex/cosmos-lib'
```

---

## Sun

Geocentric solar position derived from the Earth ephemeris via VSOP87 theory, with IAU nutation corrections applied. Accuracy is approximately 0.01 degrees for dates within a few centuries of J2000.0.

### `Sun.position(date?: Date): SunPosition`

Geocentric equatorial position of the Sun, including nutation-corrected ecliptic longitude.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `date` | `Date` | `new Date()` | Date/time for the computation. |

**Returns:** `SunPosition`

| Field | Type | Description |
|---|---|---|
| `ra` | `number` | Right ascension in degrees (0--360). |
| `dec` | `number` | Declination in degrees. |
| `distance_AU` | `number` | Distance from Earth in AU. |
| `eclipticLon` | `number` | Apparent ecliptic longitude in degrees. |

```ts
const pos = Sun.position(new Date('2024-03-20T03:06:00Z'))
console.log(pos.ra)          // ~0  (vernal equinox)
console.log(pos.dec)         // ~0
console.log(pos.distance_AU) // ~0.996 AU
console.log(pos.eclipticLon) // ~0
```

### `Sun.solarNoon(obs: ObserverParams): Date`

Time at which the Sun crosses the observer's local meridian (highest altitude for the day). Uses the standard solar altitude of -0.8333 degrees.

| Parameter | Type | Description |
|---|---|---|
| `obs` | `ObserverParams` | `{ lat, lng, date? }` -- observer location and date. |

**Returns:** `Date` -- the moment of solar noon.

```ts
const noon = Sun.solarNoon({ lat: 51.5, lng: -0.1, date: new Date('2024-03-20') })
// => ~12:10 UTC
```

### `Sun.equationOfTime(date?: Date): number`

Difference between apparent solar time and mean solar time, in minutes. A positive value means the true Sun is ahead of the mean Sun. Varies between approximately -14 and +16 minutes over a year.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `date` | `Date` | `new Date()` | Date/time for the calculation. |

**Returns:** `number` -- equation of time in minutes.

```ts
// Near the vernal equinox (should be ~-7 minutes)
Sun.equationOfTime(new Date('2024-03-20'))

// November maximum (~+16 minutes)
Sun.equationOfTime(new Date('2024-11-03'))
```

### `Sun.twilight(obs: ObserverParams): TwilightTimes`

Complete twilight times for an observer, including sunrise/sunset and civil, nautical, and astronomical twilight boundaries.

| Parameter | Type | Description |
|---|---|---|
| `obs` | `ObserverParams` | `{ lat, lng, date? }` -- observer location and date. |

**Returns:** `TwilightTimes`

| Field | Type | Solar altitude | Description |
|---|---|---|---|
| `astronomicalDawn` | `Date \| null` | -18 degrees | Earliest meaningful dawn. |
| `nauticalDawn` | `Date \| null` | -12 degrees | Horizon discernible at sea. |
| `civilDawn` | `Date \| null` | -6 degrees | Sufficient light without artificial lighting. |
| `sunrise` | `Date \| null` | -0.8333 degrees | Upper limb crosses horizon. |
| `solarNoon` | `Date` | -- | Sun transits the local meridian. |
| `sunset` | `Date \| null` | -0.8333 degrees | Upper limb crosses horizon. |
| `civilDusk` | `Date \| null` | -6 degrees | |
| `nauticalDusk` | `Date \| null` | -12 degrees | |
| `astronomicalDusk` | `Date \| null` | -18 degrees | Full darkness. |

At polar latitudes, some or all twilight phases may not occur on a given date (fields will be `null`).

```ts
const tw = Sun.twilight({ lat: 51.5, lng: -0.1, date: new Date('2024-03-20') })
console.log('Astronomical dawn:', tw.astronomicalDawn?.toISOString())
console.log('Sunrise:', tw.sunrise?.toISOString())
console.log('Solar noon:', tw.solarNoon.toISOString())
console.log('Sunset:', tw.sunset?.toISOString())
console.log('Astronomical dusk:', tw.astronomicalDusk?.toISOString())
```

---

## Moon

Geocentric lunar position and phase calculations based on Meeus Chapters 47 and 49, using the top 60 longitude/distance terms and top 30 latitude terms. Accuracy is approximately 0.07 degrees in ecliptic longitude and 0.04 degrees in ecliptic latitude for dates within a few centuries of J2000.0.

### `Moon.position(date?: Date): MoonPosition`

Geocentric equatorial and ecliptic position of the Moon.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `date` | `Date` | `new Date()` | Date/time for the computation. |

**Returns:** `MoonPosition`

| Field | Type | Description |
|---|---|---|
| `ra` | `number` | Right ascension in degrees (0--360). |
| `dec` | `number` | Declination in degrees. |
| `distance_km` | `number` | Distance from Earth's centre in kilometres. |
| `eclipticLon` | `number` | Apparent ecliptic longitude in degrees (0--360). |
| `eclipticLat` | `number` | Ecliptic latitude in degrees. |
| `parallax` | `number` | Horizontal parallax in degrees. |

```ts
const pos = Moon.position(new Date('2024-03-20T03:06:00Z'))
console.log(`RA: ${pos.ra.toFixed(4)}`)
console.log(`Dec: ${pos.dec.toFixed(4)}`)
console.log(`Distance: ${pos.distance_km.toFixed(0)} km`)
console.log(`Parallax: ${pos.parallax.toFixed(4)}`)
```

### `Moon.phase(date?: Date): MoonPhase`

Lunar phase information computed from the elongation of the Moon from the Sun in ecliptic longitude.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `date` | `Date` | `new Date()` | Date/time for the computation. |

**Returns:** `MoonPhase`

| Field | Type | Description |
|---|---|---|
| `phase` | `number` | Phase cycle position (0--1): 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter. |
| `illumination` | `number` | Illuminated fraction (0--1). |
| `age` | `number` | Days since last new moon (0--29.5). |
| `name` | `MoonPhaseName` | Human-readable phase name. |

The eight phase names and their boundaries:

| Name | Phase range |
|---|---|
| `'new'` | < 0.0625 or >= 0.9375 |
| `'waxing-crescent'` | 0.0625 -- 0.1875 |
| `'first-quarter'` | 0.1875 -- 0.3125 |
| `'waxing-gibbous'` | 0.3125 -- 0.4375 |
| `'full'` | 0.4375 -- 0.5625 |
| `'waning-gibbous'` | 0.5625 -- 0.6875 |
| `'last-quarter'` | 0.6875 -- 0.8125 |
| `'waning-crescent'` | 0.8125 -- 0.9375 |

```ts
const p = Moon.phase(new Date('2024-03-20'))
console.log(`Phase: ${p.name}`)                       // e.g. 'waxing-gibbous'
console.log(`Illumination: ${(p.illumination * 100).toFixed(0)}%`)
console.log(`Age: ${p.age.toFixed(1)} days`)
```

### `Moon.nextPhase(date?: Date, targetPhase?: 'new' | 'first-quarter' | 'full' | 'last-quarter'): Date`

Find the next occurrence of a specific phase after the given date. Uses iterative refinement with bisection to achieve approximately 1-minute precision.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `date` | `Date` | `new Date()` | Start date to search forward from. |
| `targetPhase` | `string` | `'full'` | `'new'` \| `'first-quarter'` \| `'full'` \| `'last-quarter'` |

**Returns:** `Date` -- approximate moment of the next occurrence of the target phase.

```ts
const fullMoon = Moon.nextPhase(new Date('2024-03-20'), 'full')
console.log('Next full moon:', fullMoon.toISOString()) // 2024-03-25

const newMoon = Moon.nextPhase(new Date('2024-03-20'), 'new')
console.log('Next new moon:', newMoon.toISOString()) // 2024-04-08
```

### `Moon.riseTransitSet(obs: ObserverParams): RiseTransitSet`

Rise, transit, and set times for the Moon. Uses the Moon's standard altitude of +0.125 degrees (accounting for horizontal parallax minus refraction minus semi-diameter).

| Parameter | Type | Description |
|---|---|---|
| `obs` | `ObserverParams` | `{ lat, lng, date? }` -- observer location and date. |

**Returns:** `RiseTransitSet` -- `{ rise, transit, set }` as `Date` objects. `rise` and `set` may be `null` at polar latitudes.

```ts
const rts = Moon.riseTransitSet({ lat: 51.5, lng: -0.1, date: new Date('2024-03-20') })
console.log('Moonrise:', rts.rise?.toISOString())
console.log('Moon transit:', rts.transit.toISOString())
console.log('Moonset:', rts.set?.toISOString())
```

### `Moon.libration(date?: Date): { l: number; b: number }`

Simplified optical libration angles. Returns the apparent tilt of the Moon's face as seen from Earth. Physical libration is not included.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `date` | `Date` | `new Date()` | Date/time for the computation. |

**Returns:** `{ l, b }` -- libration in longitude and latitude, both in degrees.

| Field | Type | Typical range | Description |
|---|---|---|---|
| `l` | `number` | +/-7.9 degrees | Libration in longitude (reveals eastern/western limb). |
| `b` | `number` | +/-6.9 degrees | Libration in latitude (reveals northern/southern limb). |

Based on Meeus Chapter 53, using the mean inclination of the lunar equator to the ecliptic (I = 1.5424 degrees).

```ts
const lib = Moon.libration(new Date('2024-03-20'))
console.log(`Longitude libration: ${lib.l.toFixed(2)}`)
console.log(`Latitude libration: ${lib.b.toFixed(2)}`)
```

---

## Eclipse

Simplified eclipse prediction using geometric angular-separation tests at new moons (solar) and full moons (lunar). Based on Meeus Chapters 54-55.

Accuracy is sufficient for predicting whether an eclipse occurs and its approximate type and magnitude, but not for computing local circumstances (contact times, path of totality, etc.).

### `EclipseEvent` Interface

```ts
interface EclipseEvent {
  type: 'solar' | 'lunar'
  subtype: 'total' | 'annular' | 'partial' | 'penumbral'
  date: Date
  magnitude: number
}
```

| Field | Type | Description |
|---|---|---|
| `type` | `string` | `'solar'` or `'lunar'`. |
| `subtype` | `string` | `'total'`, `'annular'`, `'partial'`, or `'penumbral'` (lunar only). |
| `date` | `Date` | Date/time of maximum eclipse (approximate). |
| `magnitude` | `number` | Fraction of diameter covered at maximum (0 to 1+). |

### `Eclipse.nextSolar(date?: Date): EclipseEvent | null`

Find the next solar eclipse after the given date. Searches up to 26 lunations (~2 years).

| Parameter | Type | Default | Description |
|---|---|---|---|
| `date` | `Date` | `new Date()` | Start date to search forward from. |

**Returns:** `EclipseEvent | null` -- the next solar eclipse, or `null` if none found within ~2 years.

```ts
const next = Eclipse.nextSolar(new Date('2024-03-20'))
if (next) {
  console.log(`${next.subtype} solar eclipse on ${next.date.toISOString()}`)
  console.log(`Magnitude: ${next.magnitude.toFixed(3)}`)
}
```

### `Eclipse.nextLunar(date?: Date): EclipseEvent | null`

Find the next lunar eclipse after the given date. Searches up to 26 lunations (~2 years).

| Parameter | Type | Default | Description |
|---|---|---|---|
| `date` | `Date` | `new Date()` | Start date to search forward from. |

**Returns:** `EclipseEvent | null` -- the next lunar eclipse, or `null` if none found within ~2 years.

```ts
const next = Eclipse.nextLunar(new Date('2024-03-20'))
if (next) {
  console.log(`${next.subtype} lunar eclipse on ${next.date.toISOString()}`)
  console.log(`Magnitude: ${next.magnitude.toFixed(3)}`)
}
```

### `Eclipse.search(startDate: Date, endDate: Date, type?: 'solar' | 'lunar'): EclipseEvent[]`

Search for all eclipses in a date range. Scans in ~15-day increments, tests both new and full moons, deduplicates results (1-day threshold), and returns results sorted chronologically.

| Parameter | Type | Default | Description |
|---|---|---|---|
| `startDate` | `Date` | | Beginning of the search window (inclusive). |
| `endDate` | `Date` | | End of the search window (exclusive). |
| `type` | `string` | `undefined` | Optional filter: `'solar'`, `'lunar'`, or omit for both. |

**Returns:** `EclipseEvent[]` -- sorted by date, duplicates removed.

```ts
// All eclipses in 2024
const all = Eclipse.search(new Date('2024-01-01'), new Date('2025-01-01'))
console.log(`Found ${all.length} eclipses`)
all.forEach(e => console.log(`${e.type} ${e.subtype} -- ${e.date.toISOString()}`))

// Only solar eclipses in a 5-year span
const solar = Eclipse.search(
  new Date('2024-01-01'),
  new Date('2029-01-01'),
  'solar',
)
```
