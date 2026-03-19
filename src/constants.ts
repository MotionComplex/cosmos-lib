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
export const CONSTANTS = {
  /** One Astronomical Unit in kilometres (IAU 2012 exact definition). */
  AU_TO_KM:        149_597_870.7,
  /** One light-year in kilometres. */
  LY_TO_KM:        9_460_730_472_580.8,
  /** One parsec in light-years. */
  PC_TO_LY:        3.261_563_777,
  /** One parsec in kilometres. */
  PC_TO_KM:        3.085_677_581e13,
  /** Speed of light in km/s (exact, SI definition). */
  C_KM_S:          299_792.458,
  /** Newtonian gravitational constant in m^3 kg^-1 s^-2 (CODATA 2018). */
  G:               6.674e-11,
  /** Solar mass in kilograms. */
  SOLAR_MASS_KG:   1.989e30,
  /** Solar radius in kilometres. */
  SOLAR_RADIUS_KM: 695_700,
  /** Earth mass in kilograms. */
  EARTH_MASS_KG:   5.972e24,
  /** Mean Earth radius in kilometres (IUGG). */
  EARTH_RADIUS_KM: 6_371,
  /** Julian Date of the J2000.0 epoch (2000-01-01T12:00:00 TT). */
  J2000:           2_451_545.0,
  /** Mean obliquity of the ecliptic at J2000.0, in degrees. */
  ECLIPTIC_OBL:    23.439_291_1,
  /** Conversion factor: degrees to radians. */
  DEG_TO_RAD:      Math.PI / 180,
  /** Conversion factor: radians to degrees. */
  RAD_TO_DEG:      180 / Math.PI,
} as const

/** The type of the {@link CONSTANTS} object. */
export type Constants = typeof CONSTANTS
