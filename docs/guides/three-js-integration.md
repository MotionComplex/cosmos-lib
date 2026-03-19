# Guide: Three.js Integration

A step-by-step guide to building interactive 3D astronomical scenes using `@motioncomplex/cosmos-lib/three`. Covers setup, starfields, planets with atmospheres, nebulae with fallback textures, LOD texture management, camera flights, and combining everything with catalog data.

---

## Prerequisites and Setup

### Install dependencies

`three` is an optional peer dependency -- cosmos-lib does not bundle it. Install both:

```bash
npm install @motioncomplex/cosmos-lib three
```

If using TypeScript, also install the Three.js types:

```bash
npm install -D @types/three
```

### Import pattern

The Three.js integration lives in a separate sub-path export to keep the core bundle small:

```ts
// Core library (no Three.js dependency)
import { Data, AstroMath, Media } from '@motioncomplex/cosmos-lib'

// Three.js integration (requires 'three' to be installed)
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

All factory functions accept the Three.js module as a runtime parameter. This means you control which version of Three.js is used:

```ts
import * as THREE from 'three'

const stars = createStarField({}, THREE) // pass THREE explicitly
```

---

## Creating a Basic Scene with Starfield

Start with a minimal Three.js scene and add a starfield background:

```ts
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createStarField } from '@motioncomplex/cosmos-lib/three'

// Scene setup
const scene    = new THREE.Scene()
const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200_000)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
document.body.appendChild(renderer.domElement)

// Controls
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

// Camera position
camera.position.set(0, 100, 500)
controls.update()

// Lighting
scene.add(new THREE.AmbientLight(0x222233, 0.5))
const sun = new THREE.DirectionalLight(0xffffff, 1.5)
sun.position.set(500, 200, 300)
scene.add(sun)

// Starfield
const stars = createStarField({
  count: 50_000,
  minRadius: 30_000,
  maxRadius: 150_000,
}, THREE)
scene.add(stars)

// Render loop
function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()
```

---

## Adding Planets with Textures and Atmospheres

Use `createPlanet` to add textured spheres with atmospheric glow:

```ts
import { createPlanet } from '@motioncomplex/cosmos-lib/three'

// Earth
const earth = createPlanet({
  radius: 6.5,
  textureUrl: '/textures/earth-bluemarble-4k.jpg',
  bumpUrl: '/textures/earth-bump.jpg',
  atmosphere: { color: 0x4488ff, intensity: 1.3 },
}, THREE)
earth.group.position.set(0, 0, 0)
scene.add(earth.group)

// Mars
const mars = createPlanet({
  radius: 3.4,
  textureUrl: '/textures/mars-4k.jpg',
  color: 0xdd6644,
}, THREE)
mars.group.position.set(200, 0, 0)
scene.add(mars.group)

// Saturn with rings
const saturn = createPlanet({
  radius: 9.5,
  textureUrl: '/textures/saturn-4k.jpg',
  rings: {
    inner: 1.2,
    outer: 2.3,
    color: 0xccaa77,
    opacity: 0.6,
    tilt: 0.4,  // radians
  },
  atmosphere: { color: 0xffddaa, intensity: 0.8 },
}, THREE)
saturn.group.position.set(-400, 0, 100)
scene.add(saturn.group)
```

### Using texture fallback chains

When you have multiple texture sources of varying reliability, use `textureUrls` instead of `textureUrl`. The factory calls `Media.chainLoad` internally:

```ts
const jupiter = createPlanet({
  radius: 11,
  textureUrls: [
    'https://cdn.example.com/jupiter-8k.jpg',  // try this first
    'https://cdn.example.com/jupiter-4k.jpg',  // fallback
    '/local-textures/jupiter-2k.jpg',           // final fallback
  ],
  atmosphere: { color: 0xffcc88, intensity: 0.6 },
}, THREE)
```

### Self-luminous objects (stars)

For stars, use `emissive` and `emissiveIntensity`:

```ts
const starMesh = createPlanet({
  radius: 20,
  color: 0xffdd88,
  emissive: 0xffdd88,
  emissiveIntensity: 2.0,
  atmosphere: { color: 0xffaa33, intensity: 2.0 },
}, THREE)
```

---

## Adding Nebulae with Fallback Texture Chains

Nebulae are rendered as additive-blended billboard sprites. The `textureUrls` array works as a fallback chain:

```ts
import { createNebula } from '@motioncomplex/cosmos-lib/three'
import { Data } from '@motioncomplex/cosmos-lib'

// Get image URLs from the built-in catalog
const imageUrls = Data.imageUrls('m42', 2048)

const orionNebula = createNebula({
  radius: 3000,
  textureUrls: [
    ...imageUrls,                    // catalog URLs first
    '/fallback/orion-nebula-low.jpg', // local fallback
  ],
  opacity: 0.85,
  aspect: 1.2, // wider than tall
}, THREE)

orionNebula.group.position.set(5000, 0, -2000)
scene.add(orionNebula.group)
```

### Raycasting nebulae

Sprites are difficult to raycast. `createNebula` includes an invisible `hitMesh` for click detection:

```ts
const raycaster = new THREE.Raycaster()

function onClick(event: MouseEvent) {
  const mouse = new THREE.Vector2(
    (event.clientX / window.innerWidth) * 2 - 1,
    -(event.clientY / window.innerHeight) * 2 + 1,
  )
  raycaster.setFromCamera(mouse, camera)

  const hits = raycaster.intersectObject(orionNebula.hitMesh)
  if (hits.length > 0) {
    console.log('Clicked on Orion Nebula!')
  }
}
renderer.domElement.addEventListener('click', onClick)
```

---

## Setting Up LOD Texture Management

For scenes with many textured planets, loading 8K textures for every body is wasteful. `LODTextureManager` swaps between low-res and high-res textures based on camera distance:

```ts
import { LODTextureManager } from '@motioncomplex/cosmos-lib/three'

const lod = new LODTextureManager(THREE, {
  timeout: 10_000, // 10s timeout for texture loads
  onError: (mesh, err) => console.warn('LOD failed:', mesh.name, err),
})

// Register planets with low/high texture URLs and threshold distances
lod.register(earth.mesh, '/tex/earth-1k.jpg', '/tex/earth-8k.jpg', 200)
lod.register(mars.mesh,  '/tex/mars-1k.jpg',  '/tex/mars-8k.jpg',  150)
lod.register(saturn.mesh, '/tex/saturn-1k.jpg', '/tex/saturn-8k.jpg', 300)

// Update in the render loop
function animate() {
  requestAnimationFrame(animate)
  lod.update(camera) // evaluates distances and swaps textures
  controls.update()
  renderer.render(scene, camera)
}
animate()
```

How it works:
1. Low-res textures are loaded immediately when you call `register`.
2. When the camera comes within `lodDistance` of a mesh, the high-res texture is loaded and applied.
3. When the camera moves beyond `lodDistance * 1.6` (hysteresis factor), the high-res texture is disposed and the low-res is restored.

### Cleanup

```ts
// Remove a single mesh from LOD management
lod.unregister(mars.mesh)

// Dispose all textures and clear the registry
lod.dispose()
```

---

## Animating Camera Flights

`CameraFlight` provides smooth, frame-rate-independent camera animations:

```ts
import { CameraFlight } from '@motioncomplex/cosmos-lib/three'

const flight = new CameraFlight(camera, controls, THREE)

// Fly to Earth
flight.flyTo(
  { x: 30, y: 15, z: 30 },   // camera destination
  { x: 0, y: 0, z: 0 },      // look-at target (Earth's position)
  {
    duration: 3000,
    easing: 'inOut',
    onDone: () => console.log('Arrived at Earth'),
  },
)
```

### Continuous orbit

```ts
// Orbit around Saturn
const orbitHandle = flight.orbitAround(
  { x: -400, y: 0, z: 100 }, // Saturn's position
  {
    radius: 60,
    speed: 0.0008,
    elevation: 0.3,
  },
)

// Stop orbiting when the user clicks
renderer.domElement.addEventListener('click', () => {
  orbitHandle.stop()
})
```

### Chaining flights

Since `flyTo` only supports a callback (not a promise), chain flights in the `onDone` callback:

```ts
// Tour: Earth -> Mars -> Saturn
flight.flyTo(
  { x: 30, y: 15, z: 30 }, { x: 0, y: 0, z: 0 },
  {
    duration: 2000,
    onDone: () => {
      flight.flyTo(
        { x: 230, y: 20, z: 50 }, { x: 200, y: 0, z: 0 },
        {
          duration: 3000,
          onDone: () => {
            flight.flyTo(
              { x: -360, y: 40, z: 150 }, { x: -400, y: 0, z: 100 },
              { duration: 4000, easing: 'out' },
            )
          },
        },
      )
    },
  },
)
```

---

## Combining with the Data Module

Place catalog objects in 3D space by mapping their RA/Dec to positions on a celestial sphere:

```ts
import { Data, AstroMath } from '@motioncomplex/cosmos-lib'
import { createNebula } from '@motioncomplex/cosmos-lib/three'

const SPHERE_RADIUS = 50_000 // radius of the celestial sphere in scene units

function raDecTo3D(ra: number, dec: number, radius: number): THREE.Vector3 {
  const raRad  = ra * (Math.PI / 180)
  const decRad = dec * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.cos(decRad) * Math.cos(raRad),
     radius * Math.sin(decRad),
     radius * Math.cos(decRad) * Math.sin(raRad),
  )
}

// Place all Messier nebulae as sprites on the celestial sphere
const messierNebulae = Data.getByType('nebula').filter(o => o.ra !== null)

for (const obj of messierNebulae) {
  const pos = raDecTo3D(obj.ra!, obj.dec!, SPHERE_RADIUS)

  // Try to get image URLs from the catalog
  const imageUrls = Data.imageUrls(obj.id, 1024)
  if (imageUrls.length === 0) continue

  const nebula = createNebula({
    radius: 2000,
    textureUrls: imageUrls,
    opacity: 0.8,
  }, THREE)

  nebula.group.position.copy(pos)
  nebula.group.lookAt(0, 0, 0) // face the centre
  scene.add(nebula.group)
}
```

### Placing bright stars as point lights or glowing spheres

```ts
const brightStars = Data.stars().filter(s => s.mag < 2)

for (const star of brightStars) {
  const pos = raDecTo3D(star.ra, star.dec, SPHERE_RADIUS)

  const starObj = createPlanet({
    radius: Math.max(50, (3 - star.mag) * 100),
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1.5,
  }, THREE)

  starObj.group.position.copy(pos)
  scene.add(starObj.group)
}
```

---

## Full Working Example

A complete minimal scene with a starfield, Earth, the Moon, orbit lines, LOD management, and camera flight:

```ts
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import {
  createPlanet,
  createStarField,
  createOrbit,
  LODTextureManager,
  CameraFlight,
} from '@motioncomplex/cosmos-lib/three'

// ── Scene setup ──────────────────────────────────────────────
const scene    = new THREE.Scene()
const camera   = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200_000)
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
renderer.toneMapping = THREE.ACESFilmicToneMapping
document.body.appendChild(renderer.domElement)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
camera.position.set(0, 50, 150)

// ── Lighting ─────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x222233, 0.4))
const sunLight = new THREE.DirectionalLight(0xffffff, 2)
sunLight.position.set(1000, 500, 500)
scene.add(sunLight)

// ── Starfield ────────────────────────────────────────────────
const stars = createStarField({ count: 60_000 }, THREE)
scene.add(stars)

// ── Earth ────────────────────────────────────────────────────
const earth = createPlanet({
  radius: 6.5,
  textureUrls: [
    'https://cdn.example.com/earth-8k.jpg',
    '/textures/earth-4k.jpg',
    '/textures/earth-2k.jpg',
  ],
  bumpUrl: '/textures/earth-bump.jpg',
  atmosphere: { color: 0x4488ff, intensity: 1.3 },
}, THREE)
scene.add(earth.group)

// ── Moon ─────────────────────────────────────────────────────
const moon = createPlanet({
  radius: 1.7,
  textureUrl: '/textures/moon-4k.jpg',
  bumpUrl: '/textures/moon-bump.jpg',
}, THREE)
moon.group.position.set(40, 0, 0)
scene.add(moon.group)

// ── Orbit line ───────────────────────────────────────────────
const moonOrbit = createOrbit(40, { color: 0x4488ff, opacity: 0.2 }, THREE)
scene.add(moonOrbit)

// ── LOD texture management ───────────────────────────────────
const lod = new LODTextureManager(THREE, { timeout: 8000 })
lod.register(earth.mesh, '/textures/earth-1k.jpg', '/textures/earth-8k.jpg', 50)
lod.register(moon.mesh,  '/textures/moon-1k.jpg',  '/textures/moon-4k.jpg',  30)

// ── Camera flight ────────────────────────────────────────────
const flight = new CameraFlight(camera, controls, THREE)

// Fly to Earth on load
flight.flyTo(
  { x: 20, y: 10, z: 20 },
  { x: 0, y: 0, z: 0 },
  { duration: 3000, easing: 'inOut' },
)

// ── Animate ──────────────────────────────────────────────────
const clock = new THREE.Clock()

function animate() {
  requestAnimationFrame(animate)

  const t = clock.getElapsedTime()

  // Rotate Earth
  earth.mesh.rotation.y = t * 0.1

  // Orbit the Moon
  moon.group.position.x = Math.cos(t * 0.3) * 40
  moon.group.position.z = Math.sin(t * 0.3) * 40

  lod.update(camera)
  controls.update()
  renderer.render(scene, camera)
}
animate()

// ── Cleanup on page unload ───────────────────────────────────
window.addEventListener('beforeunload', () => {
  earth.dispose()
  moon.dispose()
  moonOrbit.userData.dispose()
  stars.userData.dispose()
  lod.dispose()
  flight.dispose()
  renderer.dispose()
})
```

---

## Cleanup Checklist

When tearing down a scene, dispose all GPU resources:

| Object | Dispose method |
|--------|---------------|
| `createPlanet` result | `result.dispose()` |
| `createNebula` result | `result.dispose()` |
| `createStarField` result | `result.userData.dispose()` |
| `createOrbit` result | `result.userData.dispose()` |
| `createAtmosphere` result | Iterate `mesh.userData._toDispose` |
| `LODTextureManager` | `lod.dispose()` |
| `CameraFlight` | `flight.dispose()` |
