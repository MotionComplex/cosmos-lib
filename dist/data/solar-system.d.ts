import type { CelestialObject } from '../types.js';
/**
 * A solar-system body with physical properties extending {@link CelestialObject}.
 *
 * Includes diameter, mass, moon count, and surface temperature in addition
 * to the standard celestial-object fields. Solar-system bodies have `null`
 * RA/Dec because their positions are computed dynamically.
 */
export interface SolarSystemBody extends CelestialObject {
    /** Equatorial diameter in kilometres. */
    diameter_km: number;
    /** Mass in kilograms. Omitted for some minor bodies. */
    mass_kg?: number;
    /** Number of known natural satellites. */
    moons?: number;
    /** Mean surface (or cloud-top) temperature in Kelvin. */
    surface_temp_K?: number;
}
/**
 * All major solar-system bodies: the Sun, eight planets, and the Moon.
 *
 * Each entry is a {@link SolarSystemBody} with RA/Dec set to `null`
 * (positions should be computed at runtime via `AstroMath.planetEcliptic`).
 *
 * @example
 * ```ts
 * import { SOLAR_SYSTEM } from '@motioncomplex/cosmos-lib'
 *
 * const jupiter = SOLAR_SYSTEM.find(b => b.id === 'jupiter')
 * console.log(jupiter?.diameter_km) // 139820
 * console.log(jupiter?.moons)       // 95
 * ```
 */
export declare const SOLAR_SYSTEM: readonly SolarSystemBody[];
