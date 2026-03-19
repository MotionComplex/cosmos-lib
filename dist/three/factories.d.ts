import type * as THREE from 'three';
import type { PlanetOptions, PlanetResult, NebulaOptions, NebulaResult, StarFieldOptions, OrbitOptions } from './types.js';
/**
 * Create a planet/star mesh.
 * Supports textures, bump maps, atmospheric glow, and ring systems.
 */
export declare function createPlanet(opts: PlanetOptions, THREE: typeof import('three')): PlanetResult;
/**
 * Create a nebula / galaxy sprite using additive blending.
 * Attempts each URL in `textureUrls` in order, using the first that loads.
 */
export declare function createNebula(opts: NebulaOptions, THREE: typeof import('three')): NebulaResult;
/**
 * Create an atmospheric glow rim around a sphere.
 * Uses a custom shader with additive blending on the back face.
 */
export declare function createAtmosphere(radius: number, colorHex: number, THREE: typeof import('three'), intensity?: number): THREE.Mesh;
/**
 * Create a randomised star-field point cloud.
 */
export declare function createStarField(opts: StarFieldOptions | undefined, THREE: typeof import('three')): THREE.Points;
/**
 * Create a circular orbit line.
 */
export declare function createOrbit(distance: number, opts: OrbitOptions | undefined, THREE: typeof import('three')): THREE.Line;
