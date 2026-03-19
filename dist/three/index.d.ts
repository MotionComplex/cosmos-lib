/**
 * Optional Three.js integration layer for `@motioncomplex/cosmos-lib`.
 *
 * Import from the `/three` sub-path to access scene-object factories,
 * camera flight controls, LOD texture management, and built-in GLSL shaders:
 *
 * ```ts
 * import { createPlanet, CameraFlight, LODTextureManager } from '@motioncomplex/cosmos-lib/three'
 * ```
 *
 * All factory functions accept the Three.js module as a runtime parameter
 * (`THREE`) so that this package does **not** bundle or depend on `three`
 * directly -- consumers supply their own Three.js instance.
 *
 * @packageDocumentation
 */
export { createPlanet, createNebula, createAtmosphere, createStarField, createOrbit } from './factories.js';
export { LODTextureManager } from './lod.js';
export { CameraFlight } from './flight.js';
export { SHADERS } from './shaders.js';
export type { PlanetOptions, PlanetResult, NebulaOptions, NebulaResult, StarFieldOptions, OrbitOptions, FlightOptions, OrbitAroundOptions, } from './types.js';
