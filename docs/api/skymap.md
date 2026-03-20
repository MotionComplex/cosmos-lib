# Sky Map API

The sky map module provides three map projections and a canvas renderer for plotting celestial objects. All projection functions accept coordinates in degrees (J2000 epoch).

```ts
import { stereographic, mollweide, gnomonic, renderSkyMap } from '@motioncomplex/cosmos-lib'
```

---

## Projection Functions

All projections convert equatorial coordinates (RA/Dec) into 2D pixel positions and return a `ProjectedPoint`:

```ts
interface ProjectedPoint {
  x: number       // Horizontal pixel offset or absolute position
  y: number       // Vertical pixel offset or absolute position
  visible: boolean // false when the point is on the far side of the projection
}
```

### `stereographic`

Conformal (angle-preserving) projection centred on a given sky position. Best for detailed star charts around a specific region.

```ts
function stereographic(
  coord: EquatorialCoord,
  center: EquatorialCoord,
  scale?: number, // default: 500
): ProjectedPoint
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `coord` | `EquatorialCoord` | -- | RA/Dec of the point to project (degrees) |
| `center` | `EquatorialCoord` | -- | RA/Dec of the projection centre (degrees) |
| `scale` | `number` | `500` | Pixel scale factor. Higher values zoom in. |

**Returns** pixel offsets relative to the canvas centre. `visible` is `false` when the point is on the far side of the sphere.

**When to use:** Detailed regional charts (e.g. a single constellation). Preserves local angles and shapes but distorts areas far from the centre.

```ts
// Project Betelgeuse relative to the centre of Orion
const orionCenter = { ra: 83.8, dec: 1.2 }
const betelgeuse  = { ra: 88.79, dec: 7.41 }
const pt = stereographic(betelgeuse, orionCenter, 600)
// pt.x / pt.y are pixel offsets; pt.visible === true
```

---

### `mollweide`

Equal-area projection covering the entire sky. Uses Newton-Raphson iteration internally to solve the auxiliary angle.

```ts
function mollweide(
  coord: EquatorialCoord,
  canvas: { width: number; height: number },
): ProjectedPoint
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `coord` | `EquatorialCoord` | -- | RA/Dec of the point to project (degrees) |
| `canvas` | `{ width, height }` | -- | Pixel dimensions of the target canvas |

**Returns** absolute pixel coordinates (not offsets from centre). `visible` is always `true` because Mollweide covers the full sky.

**When to use:** Full-sky maps where preserving relative area matters (e.g. showing the distribution of all Messier objects across the sky).

```ts
// Project Polaris onto an 800x400 all-sky canvas
const polaris = { ra: 37.95, dec: 89.26 }
const pt = mollweide(polaris, { width: 800, height: 400 })
ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4)
```

---

### `gnomonic`

Tangent-plane projection with minimal distortion near the centre. Great circles project as straight lines.

```ts
function gnomonic(
  coord: EquatorialCoord,
  center: EquatorialCoord,
  scale?: number, // default: 400
): ProjectedPoint
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `coord` | `EquatorialCoord` | -- | RA/Dec of the point to project (degrees) |
| `center` | `EquatorialCoord` | -- | RA/Dec of the tangent point (degrees) |
| `scale` | `number` | `400` | Pixel scale factor. Higher values zoom in. |

**Returns** pixel offsets relative to the canvas centre. `visible` is `false` when the point falls behind the tangent plane.

**When to use:** Telescope field-of-view charts, narrow-field imaging, or any context where great-circle arcs must appear as straight lines. Usable area is limited to roughly a hemisphere.

```ts
// Project the Orion Nebula relative to Orion's belt centre
const beltCenter = { ra: 84.05, dec: -1.2 }
const m42        = { ra: 83.82, dec: -5.39 }
const pt = gnomonic(m42, beltCenter, 500)
if (pt.visible) {
  ctx.arc(cx + pt.x, cy - pt.y, 4, 0, Math.PI * 2)
}
```

---

## Projection Comparison

| Projection | Preserves | Coordinate type | Covers full sky | Best for |
|------------|-----------|-----------------|-----------------|----------|
| `stereographic` | Angles (conformal) | Offsets from centre | No | Regional star charts |
| `mollweide` | Area (equal-area) | Absolute canvas coords | Yes | Full-sky maps |
| `gnomonic` | Great circles as lines | Offsets from centre | No | Telescope FOV, narrow fields |

---

## `renderSkyMap`

Renders a complete sky chart onto an HTML `<canvas>` element, including a coordinate grid, constellation lines and labels, and all supplied celestial objects coloured by type and spectral class.

```ts
function renderSkyMap(
  canvas: HTMLCanvasElement,
  objects: CelestialObject[],
  opts?: SkyMapRenderOptions,
): void
```

### `SkyMapRenderOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `projection` | `'stereographic' \| 'mollweide' \| 'gnomonic'` | `'stereographic'` | Map projection type |
| `center` | `EquatorialCoord` | `{ ra: 0, dec: 0 }` | Centre point in equatorial coordinates |
| `scale` | `number` | `300` | Zoom scale factor (pixels per radian) |
| `showGrid` | `boolean` | `true` | Draw RA/Dec coordinate grid |
| `showLabels` | `boolean` | `true` | Label stars brighter than magnitude 3.5 |
| `showMagnitudeLimit` | `number` | `8` | Skip objects fainter than this magnitude |
| `background` | `string` | `'#000008'` | Canvas background CSS colour |
| `gridColor` | `string` | `'rgba(255,255,255,0.12)'` | Grid line CSS colour |
| `labelColor` | `string` | `'rgba(255,255,255,0.7)'` | Label text CSS colour |
| `showConstellationLines` | `boolean` | `false` | Draw constellation stick-figure lines |
| `showConstellationLabels` | `boolean` | `false` | Draw constellation name labels |
| `constellationLineColor` | `string` | `'rgba(100,149,237,0.35)'` | Constellation line CSS colour |
| `constellationLabelColor` | `string` | `'rgba(100,149,237,0.5)'` | Constellation label CSS colour |
| `constellations` | `Constellation[]` | -- | Constellation data (pass `CONSTELLATIONS` from the data module) |

### Object rendering

Objects are rendered with different shapes based on type:

- **Stars** -- radial gradient glow, sized inversely by magnitude, coloured by spectral class (O through M)
- **Galaxies** -- ellipse outline
- **Nebulae** -- filled + stroked square
- **Clusters** -- circle outline (with crosshair for globular clusters)

### Examples

**Stereographic chart of the Orion region:**

```ts
import { renderSkyMap, Data, CONSTELLATIONS } from '@motioncomplex/cosmos-lib'

const canvas = document.querySelector<HTMLCanvasElement>('#sky')!
canvas.width = 1200
canvas.height = 800

renderSkyMap(canvas, Data.all(), {
  projection: 'stereographic',
  center: { ra: 83.8, dec: 1.2 },
  scale: 400,
  showGrid: true,
  showLabels: true,
  showMagnitudeLimit: 6,
  showConstellationLines: true,
  showConstellationLabels: true,
  constellations: [...CONSTELLATIONS],
  background: '#0a0a18',
})
```

**Full-sky Mollweide map:**

```ts
renderSkyMap(canvas, Data.all(), {
  projection: 'mollweide',
  showGrid: true,
  showLabels: true,
  showMagnitudeLimit: 5,
})
```

**Narrow-field gnomonic chart (telescope FOV):**

```ts
renderSkyMap(canvas, Data.all(), {
  projection: 'gnomonic',
  center: { ra: 83.82, dec: -5.39 }, // M42
  scale: 800,
  showGrid: true,
  showLabels: true,
  showMagnitudeLimit: 10,
  background: '#000000',
})
```

---

## Interactive Sky Map

`InteractiveSkyMap` wraps a `<canvas>` element with pan, zoom, click-to-identify, hover detection, FOV overlays, a configurable HUD, and optional real-time sidereal tracking. It uses `renderSkyMap` for the base layer and adds interactive overlays on top.

```ts
import { InteractiveSkyMap, createInteractiveSkyMap, Data } from '@motioncomplex/cosmos-lib'
```

### Creating an instance

Use the class constructor or the `createInteractiveSkyMap` factory:

```ts
const skymap = createInteractiveSkyMap(canvas, Data.all(), {
  projection: 'stereographic',
  center: { ra: 83.8, dec: -5.4 },
  scale: 400,
  panEnabled: true,
  zoomEnabled: true,
  observer: { lat: 47.05, lng: 8.31 },
})
```

### `InteractiveSkyMapOptions`

Extends `SkyMapRenderOptions` with the following interactive options:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `panEnabled` | `boolean` | `true` | Enable pan by mouse drag / touch drag |
| `zoomEnabled` | `boolean` | `true` | Enable zoom by scroll wheel / pinch |
| `selectEnabled` | `boolean` | `true` | Enable click-to-select |
| `hoverEnabled` | `boolean` | `true` | Enable hover detection |
| `minScale` | `number` | `50` | Minimum scale (zoom-out limit) |
| `maxScale` | `number` | `5000` | Maximum scale (zoom-in limit) |
| `hitRadius` | `number` | `15` | Hit-test radius in pixels |
| `fov` | `FOVOverlayOptions \| FOVOverlayOptions[]` | -- | FOV indicator overlay(s) |
| `hud` | `HUDOptions` | -- | HUD configuration |
| `realTime` | `boolean` | `false` | Enable real-time sidereal tracking |
| `realTimeInterval` | `number` | `1000` | Real-time render interval in ms |
| `observer` | `ObserverParams` | -- | Observer params (required for real-time and HUD) |
| `hoverHighlight` | `{ color?, radius?, showLabel? }` | see below | Hover highlight style |
| `selectHighlight` | `{ color?, radius? }` | see below | Selection highlight style |

### Event system

Subscribe to interaction events with `on()` / `off()`:

```ts
// Click to identify
skymap.on('select', ({ object, point, event }) => {
  console.log('Selected:', object.name)
  showInfoPanel(object)
})

// Hover detection
skymap.on('hover', ({ object, point }) => {
  canvas.style.cursor = object ? 'pointer' : 'default'
})

// View changes (pan, zoom, programmatic)
skymap.on('viewchange', ({ center, scale, projection }) => {
  updateURL(center, scale)
})
```

#### Event types

| Event | Payload | Fires when |
|-------|---------|------------|
| `select` | `{ object, point, event }` | A celestial object is clicked/tapped |
| `hover` | `{ object \| null, point \| null, event }` | The hovered object changes |
| `viewchange` | `{ center, scale, projection }` | The view centre or scale changes |

### Pan & zoom

Pan and zoom are enabled by default. Touch pinch-to-zoom is supported for mobile.

```ts
// Programmatic view control
skymap.setView({ center: { ra: 180, dec: 45 }, scale: 500 })

// Animated pan with easing
skymap.panTo({ ra: 83.8, dec: -5.4 }, { scale: 600, durationMs: 1000 })
```

Zoom can be constrained with `minScale` / `maxScale`. The scroll wheel zooms by 10% per step.

### Hit testing

Click-to-identify returns the `CelestialObject` at the tap location. The hit radius is configurable (default 15px). The closest object within the radius wins.

```ts
// Programmatic hit-test
const obj = skymap.objectAt(canvasX, canvasY)

// Programmatic selection
skymap.select('m42')     // select by object ID
skymap.select(null)      // clear selection

// Read current selection
console.log(skymap.selectedObject?.name)
console.log(skymap.hoveredObject?.name)
```

### FOV overlay

Draw one or more field-of-view circles to visualise what a telescope or binoculars see:

```ts
// Single FOV
skymap.setFOV({ radiusDeg: 5, label: '10×50 Binos', color: 'rgba(255,255,100,0.6)' })

// Multiple overlays
skymap.setFOV([
  { radiusDeg: 1.0, label: 'SCT', color: 'rgba(100,200,255,0.6)' },
  { radiusDeg: 6.5, label: 'Binos', color: 'rgba(255,255,100,0.4)' },
])

// Clear
skymap.setFOV(null)
```

#### `FOVOverlayOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `radiusDeg` | `number` | -- | FOV radius in degrees |
| `center` | `EquatorialCoord` | current map centre | Centre of the FOV circle |
| `color` | `string` | `'rgba(255,255,100,0.6)'` | CSS stroke colour |
| `lineWidth` | `number` | `1.5` | Stroke width in pixels |
| `label` | `string` | -- | Optional label text (e.g. `'Telescope'`) |

### HUD (Heads-Up Display)

The HUD overlays cardinal directions, the observer's horizon line, and a zenith marker. Requires `observer` params.

```ts
const skymap = createInteractiveSkyMap(canvas, Data.all(), {
  observer: { lat: 47.05, lng: 8.31 },
  hud: {
    cardinalDirections: true,
    horizonLine: true,
    zenithMarker: true,
    color: 'rgba(255,255,255,0.4)',
  },
})
```

#### `HUDOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `cardinalDirections` | `boolean` | `false` | Show N/S/E/W labels at map edges |
| `horizonLine` | `boolean` | `false` | Draw the observer's horizon line |
| `zenithMarker` | `boolean` | `false` | Mark the zenith point with a crosshair |
| `observer` | `ObserverParams` | -- | Observer params for horizon/zenith |
| `color` | `string` | `'rgba(255,255,255,0.5)'` | HUD element CSS colour |

### Real-time tracking

When enabled, the view centre automatically follows the local sidereal time so the sky drifts naturally:

```ts
// Via options (starts automatically)
const skymap = createInteractiveSkyMap(canvas, Data.all(), {
  realTime: true,
  realTimeInterval: 1000, // update every second
  observer: { lat: 47.05, lng: 8.31 },
})

// Or start/stop manually
skymap.startRealTime({ lat: 47.05, lng: 8.31 })
skymap.stopRealTime()
```

### Other methods

| Method | Description |
|--------|-------------|
| `getView()` | Get the current `SkyMapViewState` (centre, scale, projection) |
| `setView(partial)` | Set centre, scale, and/or projection |
| `panTo(center, opts?)` | Animated pan with easing (default 800ms) |
| `setObjects(objects)` | Replace the objects array and re-render |
| `setOptions(opts)` | Merge new options and re-render |
| `render()` | Force an immediate synchronous re-render |
| `dispose()` | Remove all listeners, cancel timers, release resources |

### Lifecycle

Always call `dispose()` when the canvas is removed from the DOM to avoid memory leaks:

```ts
// In a React component
useEffect(() => {
  const skymap = createInteractiveSkyMap(canvas, objects, opts)
  skymap.on('select', handleSelect)
  return () => skymap.dispose()
}, [])
```

---

## Inverse projections (`canvasToEquatorial`)

Convert a canvas pixel position back to equatorial coordinates:

```ts
import { canvasToEquatorial } from '@motioncomplex/cosmos-lib'

const eq = canvasToEquatorial(mouseX, mouseY, canvas.width, canvas.height, 'stereographic', center, scale)
if (eq) console.log(`RA: ${eq.ra.toFixed(2)}°, Dec: ${eq.dec.toFixed(2)}°`)
```

Three inverse projections are available individually:

| Function | Input | Returns |
|----------|-------|---------|
| `stereographicInverse(px, py, center, scale)` | Pixel offsets from centre | `EquatorialCoord \| null` |
| `gnomonicInverse(px, py, center, scale)` | Pixel offsets from centre | `EquatorialCoord \| null` |
| `mollweideInverse(canvasX, canvasY, width, height)` | Absolute canvas coords | `EquatorialCoord \| null` |

---

## Legacy Namespace

The `SkyMap` object re-exports all functions for backwards compatibility. Prefer the named exports.

```ts
// Deprecated
import { SkyMap } from '@motioncomplex/cosmos-lib'
SkyMap.render(canvas, objects)

// Preferred
import { renderSkyMap } from '@motioncomplex/cosmos-lib'
renderSkyMap(canvas, objects)
```
