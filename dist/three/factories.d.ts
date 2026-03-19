import type * as THREE from 'three';
import type { PlanetOptions, PlanetResult, NebulaOptions, NebulaResult, StarFieldOptions, OrbitOptions } from './types.js';
/**
 * Create a planet or star mesh with optional textures, bump maps,
 * atmospheric glow, and ring systems.
 *
 * The returned group contains the sphere mesh and any extras (atmosphere shell,
 * ring geometry). Call `dispose()` on the result when removing the planet from
 * the scene to free all GPU resources.
 *
 * @param opts  - Planet configuration (radius, textures, atmosphere, rings, etc.).
 * @param THREE - The Three.js module, passed at runtime to avoid a hard dependency
 *                on `three` in the library bundle.
 * @returns A {@link PlanetResult} containing the `group`, the surface `mesh`, and
 *          a `dispose` function.
 *
 * @example
 * ```ts
 * import * as THREE from 'three'
 * import { createPlanet } from '@motioncomplex/cosmos-lib/three'
 *
 * const { group, mesh, dispose } = createPlanet({
 *   radius: 6.5,
 *   textureUrl: '/textures/earth-bluemarble-4k.jpg',
 *   bumpUrl: '/textures/earth-bump.jpg',
 *   atmosphere: { color: 0x4488ff, intensity: 1.3 },
 *   rings: { inner: 1.2, outer: 2.0, color: 0xaaaaaa, opacity: 0.6 },
 * }, THREE)
 *
 * scene.add(group)
 * // later, when removing:
 * scene.remove(group)
 * dispose()
 * ```
 */
export declare function createPlanet(opts: PlanetOptions, THREE: typeof import('three')): PlanetResult;
/**
 * Create a nebula or galaxy sprite using additive blending.
 *
 * Attempts each URL in `textureUrls` in order via {@link Media.chainLoad},
 * applying the first texture that loads successfully. An invisible hit-mesh
 * is added alongside the sprite so the nebula can be raycasted for click
 * detection despite being a billboard.
 *
 * @param opts  - Nebula configuration (radius, texture URLs, opacity, aspect ratio).
 * @param THREE - The Three.js module, passed at runtime to avoid a hard dependency
 *                on `three` in the library bundle.
 * @returns A {@link NebulaResult} containing the `group`, the `sprite`, an invisible
 *          `hitMesh` for raycasting, and a `dispose` function.
 *
 * @example
 * ```ts
 * import * as THREE from 'three'
 * import { createNebula } from '@motioncomplex/cosmos-lib/three'
 *
 * const { group, hitMesh, dispose } = createNebula({
 *   radius: 3000,
 *   textureUrls: [
 *     'https://cdn.example.com/orion-hubble.jpg',
 *     '/fallback/orion-low.jpg',
 *   ],
 *   opacity: 0.9,
 * }, THREE)
 *
 * scene.add(group)
 *
 * // Use hitMesh for raycasting
 * raycaster.intersectObject(hitMesh)
 * ```
 */
export declare function createNebula(opts: NebulaOptions, THREE: typeof import('three')): NebulaResult;
/**
 * Create an atmospheric glow rim around a sphere.
 *
 * Renders a slightly larger back-face sphere with a custom Fresnel-based shader
 * and additive blending, producing a soft halo effect. Typically called
 * internally by {@link createPlanet} when `atmosphere` is specified, but can
 * also be used standalone.
 *
 * The mesh stores its disposable resources in `mesh.userData._toDispose`.
 *
 * @param radius   - Radius of the parent sphere. The atmosphere shell is
 *                   generated at `radius * 1.06`.
 * @param colorHex - Glow colour as a hex number (e.g. `0x4488ff`).
 * @param THREE    - The Three.js module, passed at runtime to avoid a hard
 *                   dependency on `three` in the library bundle.
 * @param intensity - Glow intensity multiplier.
 * @returns A `THREE.Mesh` with the atmospheric glow shader applied.
 *
 * @example
 * ```ts
 * import * as THREE from 'three'
 * import { createAtmosphere } from '@motioncomplex/cosmos-lib/three'
 *
 * const atm = createAtmosphere(6.5, 0x4488ff, THREE, 1.4)
 * scene.add(atm)
 * ```
 */
export declare function createAtmosphere(radius: number, colorHex: number, THREE: typeof import('three'), intensity?: number): THREE.Mesh;
/**
 * Create a randomised star-field point cloud.
 *
 * Generates `count` points distributed uniformly on a spherical shell between
 * `minRadius` and `maxRadius`. Each star is given a randomised colour
 * (warm white, cool blue, or neutral) and brightness for a natural look.
 *
 * Call `points.userData.dispose()` when removing the star field to free the
 * underlying buffer geometry and material.
 *
 * @param opts  - Star-field configuration (count, radius range, point size, opacity).
 *                All properties are optional and have sensible defaults.
 * @param THREE - The Three.js module, passed at runtime to avoid a hard dependency
 *                on `three` in the library bundle.
 * @returns A `THREE.Points` object ready to be added to the scene.
 *
 * @example
 * ```ts
 * import * as THREE from 'three'
 * import { createStarField } from '@motioncomplex/cosmos-lib/three'
 *
 * const stars = createStarField({
 *   count: 50_000,
 *   minRadius: 30_000,
 *   maxRadius: 150_000,
 * }, THREE)
 *
 * scene.add(stars)
 * // later:
 * scene.remove(stars)
 * stars.userData.dispose()
 * ```
 */
export declare function createStarField(opts: StarFieldOptions | undefined, THREE: typeof import('three')): THREE.Points;
/**
 * Create a circular orbit line lying on the XZ plane.
 *
 * Generates a closed circle of `segments` line segments at the given
 * `distance` from the origin. Useful for visualising planetary orbits
 * or other radial guides.
 *
 * Call `line.userData.dispose()` when removing the orbit to free the
 * underlying buffer geometry and material.
 *
 * @param distance - Orbit radius in scene units.
 * @param opts     - Visual options (colour, opacity, segment count).
 * @param THREE    - The Three.js module, passed at runtime to avoid a hard
 *                   dependency on `three` in the library bundle.
 * @returns A `THREE.Line` representing the circular orbit.
 *
 * @example
 * ```ts
 * import * as THREE from 'three'
 * import { createOrbit } from '@motioncomplex/cosmos-lib/three'
 *
 * // Draw Earth's orbit at 150 scene units
 * const orbit = createOrbit(150, { color: 0x4488ff, opacity: 0.3 }, THREE)
 * scene.add(orbit)
 * ```
 */
export declare function createOrbit(distance: number, opts: OrbitOptions | undefined, THREE: typeof import('three')): THREE.Line;
