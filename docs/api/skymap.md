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
