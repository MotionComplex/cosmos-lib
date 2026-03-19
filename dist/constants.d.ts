/**
 * Fundamental astronomical and physical constants used throughout the library.
 *
 * All values follow IAU 2012 / IERS conventions unless otherwise noted.
 *
 * @example
 * ```ts
 * import { CONSTANTS } from '@motioncomplex/cosmos-lib'
 * const earthSunKm = 1 * CONSTANTS.AU_TO_KM // 149 597 870.7
 * ```
 */
export declare const CONSTANTS: {
    /** One Astronomical Unit in kilometres (IAU 2012 exact definition). */
    readonly AU_TO_KM: 149597870.7;
    /** One light-year in kilometres. */
    readonly LY_TO_KM: 9460730472580.8;
    /** One parsec in light-years. */
    readonly PC_TO_LY: 3.261563777;
    /** One parsec in kilometres. */
    readonly PC_TO_KM: 30856775810000;
    /** Speed of light in km/s (exact, SI definition). */
    readonly C_KM_S: 299792.458;
    /** Newtonian gravitational constant in m^3 kg^-1 s^-2 (CODATA 2018). */
    readonly G: 6.674e-11;
    /** Solar mass in kilograms. */
    readonly SOLAR_MASS_KG: 1.989e+30;
    /** Solar radius in kilometres. */
    readonly SOLAR_RADIUS_KM: 695700;
    /** Earth mass in kilograms. */
    readonly EARTH_MASS_KG: 5.972e+24;
    /** Mean Earth radius in kilometres (IUGG). */
    readonly EARTH_RADIUS_KM: 6371;
    /** Julian Date of the J2000.0 epoch (2000-01-01T12:00:00 TT). */
    readonly J2000: 2451545;
    /** Mean obliquity of the ecliptic at J2000.0, in degrees. */
    readonly ECLIPTIC_OBL: 23.4392911;
    /** Conversion factor: degrees to radians. */
    readonly DEG_TO_RAD: number;
    /** Conversion factor: radians to degrees. */
    readonly RAD_TO_DEG: number;
};
/** The type of the {@link CONSTANTS} object. */
export type Constants = typeof CONSTANTS;
