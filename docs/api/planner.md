# Observation Planning API

The `Planner` module answers "What can I see tonight?" — the most common question in amateur astronomy. It provides functions for finding visible objects, computing observation windows, altitude curves, moon interference scoring, airmass calculations, and planet event detection.

```ts
import { Planner } from '@motioncomplex/cosmos-lib'
```

---

## `Planner.whatsUp`

Returns all catalog objects above the horizon for a given observer, sorted by altitude (highest first). Each result includes the current position and moon interference data.

```ts
function whatsUp(observer: ObserverParams, options?: WhatsUpOptions): VisibleObject[]
```

### `WhatsUpOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `minAltitude` | `number` | `10` | Minimum altitude in degrees above horizon |
| `magnitudeLimit` | `number` | `6` | Faintest apparent magnitude to include |
| `types` | `ObjectType[]` | all | Filter by object type(s) |
| `constellation` | `string` | -- | Filter by constellation abbreviation (3-letter) |
| `tag` | `string` | -- | Filter by catalog tag (e.g. `'messier'`) |
| `limit` | `number` | `50` | Maximum number of results |

### `VisibleObject`

| Property | Type | Description |
|----------|------|-------------|
| `object` | `CelestialObject` | The catalog object |
| `alt` | `number` | Current altitude in degrees |
| `az` | `number` | Current azimuth in degrees (0=N, 90=E, 180=S, 270=W) |
| `moonSeparation` | `number \| null` | Angular distance from the Moon in degrees |
| `moonInterference` | `number` | Interference score 0–1 (0 = none, 1 = worst) |

### Examples

**Basic: what's up tonight?**

```ts
const observer = { lat: 47.05, lng: 8.31, date: new Date('2024-08-15T22:00:00Z') }
const visible = Planner.whatsUp(observer)
visible.forEach(v => console.log(v.object.name, `alt: ${v.alt.toFixed(1)}°`))
```

**Filtered: only Messier objects above 20°**

```ts
const messier = Planner.whatsUp(observer, {
  tag: 'messier',
  minAltitude: 20,
  magnitudeLimit: 10,
})
```

**Filtered: only deep-sky types**

```ts
const dso = Planner.whatsUp(observer, {
  types: ['nebula', 'galaxy', 'cluster'],
  magnitudeLimit: 8,
})
```

---

## `Planner.bestWindow`

Find the optimal observation window for an object on a given night. Samples altitude between astronomical dusk and dawn.

```ts
function bestWindow(objectId: string, observer: ObserverParams, minAlt?: number): BestWindowResult | null
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `objectId` | `string` | -- | Catalog object ID (e.g. `'m42'`, `'sirius'`) |
| `observer` | `ObserverParams` | -- | Observer location; `date` determines which night |
| `minAlt` | `number` | `10` | Minimum useful altitude in degrees |

Returns `null` if the object never rises above `minAlt` during darkness.

### `BestWindowResult`

| Property | Type | Description |
|----------|------|-------------|
| `peak` | `Date` | Time of maximum altitude |
| `peakAltitude` | `number` | Maximum altitude in degrees |
| `rise` | `Date \| null` | When altitude crosses `minAlt` (null if already up at dusk) |
| `set` | `Date \| null` | When altitude drops below `minAlt` (null if still up at dawn) |

```ts
const window = Planner.bestWindow('m42', { lat: 47.05, lng: 8.31, date: new Date('2024-01-15') })
if (window) {
  console.log(`Peak at ${window.peak.toLocaleTimeString()} (${window.peakAltitude.toFixed(1)}°)`)
  console.log('Rises above 10°:', window.rise?.toLocaleTimeString() ?? 'already up')
  console.log('Drops below 10°:', window.set?.toLocaleTimeString() ?? 'still up at dawn')
}
```

---

## `Planner.visibilityCurve`

Compute altitude vs. time over a night — an array of samples from astronomical dusk to dawn, suitable for plotting.

```ts
function visibilityCurve(objectId: string, observer: ObserverParams, steps?: number): VisibilityCurvePoint[] | null
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `objectId` | `string` | -- | Catalog object ID |
| `observer` | `ObserverParams` | -- | Observer location and date |
| `steps` | `number` | `100` | Number of samples |

Returns `null` if the object is unknown or no darkness occurs (polar summer).

### `VisibilityCurvePoint`

| Property | Type | Description |
|----------|------|-------------|
| `date` | `Date` | Time of this sample |
| `alt` | `number` | Altitude in degrees |
| `az` | `number` | Azimuth in degrees |

```ts
const curve = Planner.visibilityCurve('sirius', observer, 50)
if (curve) {
  // Plot: x = time, y = altitude
  const chartData = curve.map(p => ({
    time: p.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    alt: p.alt,
  }))
}
```

---

## `Planner.planetEvents`

Detect oppositions and conjunctions for planets over a date range.

```ts
function planetEvents(
  observer: ObserverParams,
  options?: { planets?: PlanetName[]; days?: number }
): PlanetEvent[]
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `observer` | `ObserverParams` | -- | `date` is the start of the search range |
| `options.planets` | `PlanetName[]` | all 7 | Planets to scan |
| `options.days` | `number` | `365` | Number of days to scan forward |

### `PlanetEvent`

| Property | Type | Description |
|----------|------|-------------|
| `planet` | `PlanetName` | The planet involved |
| `type` | `'opposition' \| 'conjunction'` | Event type |
| `date` | `Date` | Approximate date of the event |
| `elongation` | `number` | Solar elongation in degrees at the event |

```ts
const events = Planner.planetEvents({ lat: 47, lng: 8, date: new Date('2024-01-01') })
events.forEach(e =>
  console.log(`${e.planet} ${e.type} on ${e.date.toLocaleDateString()} (${e.elongation.toFixed(0)}°)`)
)

// Only Mars, over 2 years
const marsEvents = Planner.planetEvents(
  { lat: 47, lng: 8, date: new Date('2024-01-01') },
  { planets: ['mars'], days: 730 }
)
```

---

## `Planner.moonInterference`

Get the moon interference score for a specific target at a given time. Combines angular separation with lunar illumination.

```ts
function moonInterference(objectId: string, observer: ObserverParams): MoonInterference | null
```

### `MoonInterference`

| Property | Type | Description |
|----------|------|-------------|
| `separation` | `number` | Angular distance from the Moon in degrees |
| `illumination` | `number` | Moon illumination fraction 0–1 |
| `score` | `number` | Combined interference 0–1 (0 = clear, 1 = worst) |

The scoring formula: `illumination × proximityFactor`, where proximity is 1.0 at ≤5° separation and tapers linearly to 0.0 at ≥120° separation.

```ts
const mi = Planner.moonInterference('m42', { lat: 47, lng: 8, date: new Date() })
if (mi) {
  if (mi.score < 0.2) console.log('Great conditions — low moon interference')
  else if (mi.score < 0.5) console.log('Moderate moon interference')
  else console.log('Strong moon interference — consider a different target')
}
```

---

## `Planner.airmassCurve`

Compute airmass vs. time for photometry-aware observation planning. Uses the Kasten & Young (1989) formula for accuracy near the horizon.

```ts
function airmassCurve(objectId: string, observer: ObserverParams, steps?: number): AirmassPoint[] | null
```

### `AirmassPoint`

| Property | Type | Description |
|----------|------|-------------|
| `date` | `Date` | Time of this sample |
| `alt` | `number` | Altitude in degrees |
| `airmass` | `number` | Airmass value (1.0 at zenith, higher near horizon) |

Only points where the object is above the horizon are included.

```ts
const am = Planner.airmassCurve('sirius', observer, 50)
if (am) {
  const bestTime = am.reduce((a, b) => a.airmass < b.airmass ? a : b)
  console.log(`Minimum airmass ${bestTime.airmass.toFixed(2)} at ${bestTime.date.toLocaleTimeString()}`)
}
```

| Airmass | Meaning |
|---------|---------|
| 1.0 | Zenith — minimal atmospheric extinction |
| 1.5 | Good for most photometry |
| 2.0 | Noticeable extinction, still usable |
| 3.0+ | Significant extinction — avoid for precision work |
