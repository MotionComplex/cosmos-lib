import type { CelestialObject } from '../types.js';
/**
 * Notable deep-sky objects not covered by the Messier catalog.
 *
 * Includes prominent non-Messier objects such as the Helix Nebula,
 * the Milky Way itself, Omega Centauri, and supermassive black holes
 * (Sgr A* and M87's black hole). These are merged into the unified
 * catalog by {@link Data}.
 *
 * @remarks
 * This collection is intentionally small and curated. It supplements
 * the Messier catalog with objects that are either too famous to omit
 * (e.g. the Milky Way, Sgr A*) or are among the finest deep-sky objects
 * in the southern sky (e.g. Omega Centauri, Helix Nebula).
 *
 * @example
 * ```ts
 * import { DEEP_SKY_EXTRAS } from '@motioncomplex/cosmos-lib'
 *
 * const helix = DEEP_SKY_EXTRAS.find(o => o.id === 'ngc7293')
 * console.log(helix?.name) // 'Helix Nebula'
 *
 * const sgrA = DEEP_SKY_EXTRAS.find(o => o.id === 'sgr-a-star')
 * console.log(sgrA?.aliases) // ['Sgr A*', 'SgrA*']
 * ```
 */
export declare const DEEP_SKY_EXTRAS: readonly CelestialObject[];
