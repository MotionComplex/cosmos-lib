# Three.js Integration API

Scene-object factories, camera flight controls, LOD texture management, and built-in GLSL shaders for Three.js. All exports live in the `/three` sub-path to keep the core bundle free of any Three.js dependency.

```ts
import {
  createPlanet,
  createNebula,
  createAtmosphere,
  createStarField,
  createOrbit,
  LODTextureManager,
  CameraFlight,
  SHADERS,
} from '@motioncomplex/cosmos-lib/three'
```

> **Optional peer dependency:** `three` is not bundled with cosmos-lib. You must install it separately (`npm install three`) and pass the module at runtime to each factory function. This lets you control the Three.js version and avoids duplicate copies in your bundle.

---

## Factory Functions

All factory functions accept `THREE` (the Three.js module) as a runtime parameter. Every factory that creates GPU resources returns a `dispose` function -- always call it when removing objects from the scene to free memory.

### `createPlanet`

Create a planet or star mesh with optional textures, bump maps, atmospheric glow, and ring systems.

```ts
function createPlanet(
  opts: PlanetOptions,
  THREE: typeof import('three'),
): PlanetResult
```

#### `PlanetOptions`

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `radius` | `number` | Yes | -- | Sphere radius in scene units |
| `textureUrl` | `string` | No | -- | Single texture URL for the surface |
| `textureUrls` | `string[]` | No | -- | Fallback chain of texture URLs (takes priority over `textureUrl`) |
| `bumpUrl` | `string` | No | -- | Bump/displacement map URL |
| `color` | `number` | No | `0xffffff` | Base colour hex (used when no texture loads) |
| `emissive` | `number` | No | -- | Emissive colour hex (for self-illuminated bodies like stars) |
| `emissiveIntensity` | `number` | No | `1` | Emissive intensity multiplier |
| `atmosphere` | `{ color: number; intensity?: number }` | No | -- | Atmospheric glow shell config |
| `rings` | `{ inner, outer, color, opacity, tilt? }` | No | -- | Planetary ring system (e.g. Saturn) |
| `isBlackHole` | `boolean` | No | `false` | Render a black sphere instead of a standard material |

#### `PlanetResult`

| Property | Type | Description |
|----------|------|-------------|
| `group` | `THREE.Group` | Top-level group containing the planet mesh, atmosphere, and rings |
| `mesh` | `THREE.Mesh` | The planet's surface mesh |
| `dispose` | `() => void` | Dispose all GPU resources (geometries, materials, textures) |

```ts
import * as THREE from 'three'
import { createPlanet } from '@motioncomplex/cosmos-lib/three'

const { group, mesh, dispose } = createPlanet({
  radius: 6.5,
  textureUrl: '/textures/earth-bluemarble-4k.jpg',
  bumpUrl: '/textures/earth-bump.jpg',
  atmosphere: { color: 0x4488ff, intensity: 1.3 },
  rings: { inner: 1.2, outer: 2.0, color: 0xaaaaaa, opacity: 0.6 },
}, THREE)

scene.add(group)

// On teardown:
scene.remove(group)
dispose()
```

When `textureUrls` is provided, the factory uses `Media.chainLoad` internally to try each URL in order. This works well with the `IMAGE_FALLBACKS` registry from the data module.

---

### `createNebula`

Create a nebula or galaxy sprite using additive blending. Includes an invisible hit-mesh for raycasting.

```ts
function createNebula(
  opts: NebulaOptions,
  THREE: typeof import('three'),
): NebulaResult
```

#### `NebulaOptions`

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `radius` | `number` | Yes | -- | Visual radius of the sprite in scene units |
| `textureUrls` | `string[]` | Yes | -- | Fallback chain of texture URLs |
| `opacity` | `number` | No | `0.85` | Sprite opacity (0-1) |
| `aspect` | `number` | No | `1` | Width/height aspect ratio of the sprite |

#### `NebulaResult`

| Property | Type | Description |
|----------|------|-------------|
| `group` | `THREE.Group` | Top-level group containing sprite and hit mesh |
| `sprite` | `THREE.Sprite` | The billboard sprite displaying the nebula texture |
| `hitMesh` | `THREE.Mesh` | Invisible mesh for raycasting / click detection |
| `dispose` | `() => void` | Dispose all GPU resources |

```ts
import * as THREE from 'three'
import { createNebula } from '@motioncomplex/cosmos-lib/three'

const { group, hitMesh, dispose } = createNebula({
  radius: 3000,
  textureUrls: [
    'https://cdn.example.com/orion-hubble.jpg',
    '/fallback/orion-low.jpg',
  ],
  opacity: 0.9,
}, THREE)

scene.add(group)

// Use hitMesh for raycasting
raycaster.intersectObject(hitMesh)
```

---

### `createAtmosphere`

Create an atmospheric glow rim around a sphere. Renders a slightly larger back-face sphere with a Fresnel-based shader and additive blending.

```ts
function createAtmosphere(
  radius: number,
  colorHex: number,
  THREE: typeof import('three'),
  intensity?: number, // default: 1.2
): THREE.Mesh
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `radius` | `number` | -- | Radius of the parent sphere (atmosphere is generated at `radius * 1.06`) |
| `colorHex` | `number` | -- | Glow colour as a hex number |
| `THREE` | `typeof import('three')` | -- | Three.js module |
| `intensity` | `number` | `1.2` | Glow intensity multiplier |

Typically called internally by `createPlanet` when `atmosphere` is specified, but can also be used standalone. Disposable resources are stored in `mesh.userData._toDispose`.

```ts
const atm = createAtmosphere(6.5, 0x4488ff, THREE, 1.4)
scene.add(atm)
```

---

### `createStarField`

Create a randomised star-field point cloud. Stars are distributed uniformly on a spherical shell with randomised colour (warm white, cool blue, or neutral) and brightness.

```ts
function createStarField(
  opts?: StarFieldOptions,
  THREE: typeof import('three'),
): THREE.Points
```

#### `StarFieldOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `count` | `number` | `40000` | Number of stars to generate |
| `minRadius` | `number` | `30000` | Minimum distance from the origin |
| `maxRadius` | `number` | `150000` | Maximum distance from the origin |
| `sizeMin` | `number` | `1.5` | Minimum star point size |
| `sizeMax` | `number` | `4.0` | Maximum star point size |
| `opacity` | `number` | `0.7` | Point opacity (0-1) |

Dispose via `points.userData.dispose()`:

```ts
const stars = createStarField({
  count: 50_000,
  minRadius: 30_000,
  maxRadius: 150_000,
}, THREE)

scene.add(stars)

// On teardown:
scene.remove(stars)
stars.userData.dispose()
```

---

### `createOrbit`

Create a circular orbit line lying on the XZ plane.

```ts
function createOrbit(
  distance: number,
  opts?: OrbitOptions,
  THREE: typeof import('three'),
): THREE.Line
```

#### `OrbitOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `color` | `number` | `0xffffff` | Line colour as a hex number |
| `opacity` | `number` | `0.1` | Line opacity (0-1) |
| `segments` | `number` | `128` | Number of line segments forming the circle |

Dispose via `line.userData.dispose()`:

```ts
const orbit = createOrbit(150, { color: 0x4488ff, opacity: 0.3 }, THREE)
scene.add(orbit)
```

---

## `LODTextureManager` Class

Manages texture resolution for a set of meshes based on camera distance. Low-res textures are loaded eagerly; high-res textures are loaded lazily the first time the camera enters the threshold distance. A 1.6x hysteresis factor prevents texture thrashing near the boundary.

### Constructor

```ts
new LODTextureManager(
  THREE: typeof import('three'),
  opts?: LODOptions,
)
```

#### `LODOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `onError` | `(mesh: THREE.Mesh, error: unknown) => void` | -- | Callback when a high-res texture fails to load |
| `timeout` | `number` | `0` | Timeout in milliseconds for texture loads (0 = no timeout) |

### Methods

#### `register(mesh, lowResUrl, highResUrl, lodDistance)`

Register a mesh for LOD management. The low-res texture loads immediately; the high-res loads on demand when the camera comes within `lodDistance`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `mesh` | `THREE.Mesh` | Target mesh (must use `MeshStandardMaterial` or compatible) |
| `lowResUrl` | `string` | URL for the low-resolution texture (loaded eagerly) |
| `highResUrl` | `string` | URL for the high-resolution texture (loaded on demand) |
| `lodDistance` | `number` | Camera distance threshold in scene units |

#### `unregister(mesh)`

Remove a mesh from LOD management and dispose its textures. No-op if the mesh was never registered.

#### `update(camera)`

Evaluate all registered meshes and swap textures as needed. Call this once per frame in your render loop.

- Loads high-res when camera distance < `lodDistance`
- Reverts to low-res when camera distance > `lodDistance * 1.6` (hysteresis)

#### `dispose()`

Dispose all registered textures (both low- and high-res) and clear the internal registry.

### Example

```ts
import * as THREE from 'three'
import { LODTextureManager } from '@motioncomplex/cosmos-lib/three'

const lod = new LODTextureManager(THREE, {
  timeout: 8000,
  onError: (mesh, err) => console.warn('LOD load failed', mesh.name, err),
})

lod.register(earthMesh, '/tex/earth-1k.jpg', '/tex/earth-8k.jpg', 500)
lod.register(marsMesh,  '/tex/mars-1k.jpg',  '/tex/mars-8k.jpg',  400)

// In render loop:
function animate() {
  lod.update(camera)
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

// On teardown:
lod.dispose()
```

---

## `CameraFlight` Class

Smooth camera flight controller. Animates both camera position and `OrbitControls` target simultaneously using a cubic Bezier easing curve. No GSAP or tween library required.

### Constructor

```ts
new CameraFlight(
  camera: THREE.Camera,
  controls: OrbitControls,
  THREE: typeof import('three'),
)
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `camera` | `THREE.Camera` | The Three.js camera to animate |
| `controls` | `OrbitControls` | An OrbitControls-compatible object |
| `THREE` | `typeof import('three')` | Three.js module |

### Methods

#### `flyTo(toPosition, toTarget, opts?)`

Fly the camera to a world-space position while smoothly re-targeting the look-at point. Only one flight can be active at a time; starting a new flight cancels any in-progress one.

| Parameter | Type | Description |
|-----------|------|-------------|
| `toPosition` | `{ x, y, z }` | Destination camera position in world coordinates |
| `toTarget` | `{ x, y, z }` | Destination look-at point (OrbitControls target) |
| `opts` | `FlightOptions` | Animation options |

##### `FlightOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `duration` | `number` | `2000` | Animation duration in milliseconds |
| `easing` | `'in' \| 'out' \| 'inOut'` | `'inOut'` | Easing curve (cubic) |
| `onDone` | `() => void` | -- | Callback on completion |

#### `orbitAround(center, opts?)`

Continuously orbit the camera around a world-space point. Returns a stop handle. Multiple orbits can be active simultaneously.

| Parameter | Type | Description |
|-----------|------|-------------|
| `center` | `{ x, y, z }` | World-space point to orbit around |
| `opts` | `OrbitAroundOptions` | Orbit configuration |

##### `OrbitAroundOptions`

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `radius` | `number` | `200` | Orbit radius in scene units |
| `speed` | `number` | `0.0005` | Angular speed (radians per second, normalised to 60fps equivalent) |
| `elevation` | `number` | `0.2` | Camera elevation above the orbit plane (fraction of radius) |

**Returns** `{ stop: () => void }` -- call `handle.stop()` to halt the orbit.

#### `cancel()`

Cancel any in-progress `flyTo` animation. Active `orbitAround` loops are not affected.

#### `dispose()`

Stop all active orbits and cancel any in-progress flight. Call when tearing down the scene.

### Example

```ts
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CameraFlight } from '@motioncomplex/cosmos-lib/three'

const camera   = new THREE.PerspectiveCamera(60, w / h, 0.1, 100_000)
const controls = new OrbitControls(camera, renderer.domElement)
const flight   = new CameraFlight(camera, controls, THREE)

// Fly to Mars
flight.flyTo(
  { x: 200, y: 50, z: 200 },
  { x: 180, y: 0,  z: 0 },
  { duration: 3000, easing: 'inOut', onDone: () => console.log('arrived') },
)

// Orbit around a planet
const handle = flight.orbitAround(
  { x: 180, y: 0, z: 0 },
  { radius: 40, speed: 0.0008 },
)

// Stop orbiting later
handle.stop()

// On teardown:
flight.dispose()
```

---

## `SHADERS` Object

Built-in GLSL shader sources used by the Three.js integration layer. Currently contains the atmosphere glow shaders consumed by `createAtmosphere`.

```ts
const SHADERS: {
  readonly atmosphereVert: string
  readonly atmosphereFrag: string
}
```

### `atmosphereVert`

Vertex shader that computes per-vertex view direction and normal vectors in world space.

### `atmosphereFrag`

Fragment shader with the following uniforms:

| Uniform | Type | Description |
|---------|------|-------------|
| `uAtmColor` | `vec3` | Atmosphere RGB colour |
| `uIntensity` | `float` | Glow intensity multiplier |

The fragment alpha is derived from `pow(rim, 3.0) * uIntensity`, where `rim` is `1.0 - abs(dot(normal, viewDir))`, producing a Fresnel-based rim-lighting effect.

These shaders are used internally by `createAtmosphere` but are exported so you can use them in custom materials:

```ts
import { SHADERS } from '@motioncomplex/cosmos-lib/three'

const customMat = new THREE.ShaderMaterial({
  uniforms: {
    uAtmColor:  { value: new THREE.Color(0xff4400) },
    uIntensity: { value: 2.0 },
  },
  vertexShader:   SHADERS.atmosphereVert,
  fragmentShader: SHADERS.atmosphereFrag,
  side:           THREE.BackSide,
  blending:       THREE.AdditiveBlending,
  transparent:    true,
  depthWrite:     false,
})
```
