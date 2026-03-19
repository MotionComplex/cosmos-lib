import type { CelestialObject } from '../types.js';
export interface SolarSystemBody extends CelestialObject {
    diameter_km: number;
    mass_kg?: number;
    moons?: number;
    surface_temp_K?: number;
}
export declare const SOLAR_SYSTEM: readonly SolarSystemBody[];
