import { CONSTANTS } from './constants.js'

/**
 * Unit conversion and formatting utilities for astronomical distances,
 * angles, and Right Ascension values.
 *
 * @example
 * ```ts
 * import { Units } from '@motioncomplex/cosmos-lib'
 * Units.auToKm(1)            // 149597870.7
 * Units.formatRA(83.822)      // '5h 35m 17.3s'
 * Units.formatDistance(4.07e13) // '4.307 ly'
 * ```
 */
export const Units = {
  // ── Distance ───────────────────────────────────────────────────────────────

  /**
   * Convert Astronomical Units to kilometres.
   * @param au - Distance in AU.
   * @returns Distance in kilometres.
   */
  auToKm:    (au: number): number => au * CONSTANTS.AU_TO_KM,

  /**
   * Convert kilometres to Astronomical Units.
   * @param km - Distance in kilometres.
   * @returns Distance in AU.
   */
  kmToAu:    (km: number): number => km / CONSTANTS.AU_TO_KM,

  /**
   * Convert light-years to parsecs.
   * @param ly - Distance in light-years.
   * @returns Distance in parsecs.
   */
  lyToPc:    (ly: number): number => ly / CONSTANTS.PC_TO_LY,

  /**
   * Convert parsecs to light-years.
   * @param pc - Distance in parsecs.
   * @returns Distance in light-years.
   */
  pcToLy:    (pc: number): number => pc * CONSTANTS.PC_TO_LY,

  /**
   * Convert parsecs to kilometres.
   * @param pc - Distance in parsecs.
   * @returns Distance in kilometres.
   */
  pcToKm:    (pc: number): number => pc * CONSTANTS.PC_TO_KM,

  /**
   * Convert light-years to kilometres.
   * @param ly - Distance in light-years.
   * @returns Distance in kilometres.
   */
  lyToKm:    (ly: number): number => ly * CONSTANTS.LY_TO_KM,

  /**
   * Convert kilometres to light-years.
   * @param km - Distance in kilometres.
   * @returns Distance in light-years.
   */
  kmToLy:    (km: number): number => km / CONSTANTS.LY_TO_KM,

  // ── Angular ────────────────────────────────────────────────────────────────

  /**
   * Convert degrees to radians.
   * @param d - Angle in degrees.
   * @returns Angle in radians.
   */
  degToRad:    (d: number): number => d * CONSTANTS.DEG_TO_RAD,

  /**
   * Convert radians to degrees.
   * @param r - Angle in radians.
   * @returns Angle in degrees.
   */
  radToDeg:    (r: number): number => r * CONSTANTS.RAD_TO_DEG,

  /**
   * Convert arcseconds to degrees.
   * @param a - Angle in arcseconds.
   * @returns Angle in degrees.
   */
  arcsecToDeg: (a: number): number => a / 3600,

  /**
   * Convert degrees to arcseconds.
   * @param d - Angle in degrees.
   * @returns Angle in arcseconds.
   */
  degToArcsec: (d: number): number => d * 3600,

  /**
   * Convert Right Ascension from hours to degrees.
   * @param h - RA in hours (0–24).
   * @returns RA in degrees (0–360).
   */
  hrsToDeg:    (h: number): number => h * 15,

  /**
   * Convert Right Ascension from degrees to hours.
   * @param d - RA in degrees (0–360).
   * @returns RA in hours (0–24).
   */
  degToHrs:    (d: number): number => d / 15,

  /**
   * Format a distance in kilometres into a human-readable string,
   * automatically choosing the most appropriate unit (km, AU, ly, or Mly).
   *
   * @param km - Distance in kilometres.
   * @returns Formatted string with unit suffix.
   *
   * @example
   * ```ts
   * Units.formatDistance(384_400)               // '0.002570 AU'
   * Units.formatDistance(9_460_730_472_580 * 8.6) // '8.600 ly'
   * ```
   */
  formatDistance(km: number): string {
    const au = km / CONSTANTS.AU_TO_KM
    if (au < 0.01) return `${km.toFixed(0)} km`
    if (au < 1_000) return `${au.toPrecision(4)} AU`
    const ly = km / CONSTANTS.LY_TO_KM
    if (ly < 1_000_000) return `${ly.toPrecision(4)} ly`
    return `${(ly / 1_000_000).toPrecision(4)} Mly`
  },

  /**
   * Format decimal degrees as d°m′s″ (signed).
   *
   * @param deg - Angle in decimal degrees.
   * @returns Formatted DMS string.
   *
   * @example
   * ```ts
   * Units.formatAngle(-16.716)  // '-16°42′57.6″'
   * Units.formatAngle(83.822)   // '83°49′19.2″'
   * ```
   */
  formatAngle(deg: number): string {
    const sign = deg < 0 ? '-' : ''
    const abs  = Math.abs(deg)
    const d    = Math.floor(abs)
    const m    = Math.floor((abs - d) * 60)
    const s    = ((abs - d) * 60 - m) * 60
    return `${sign}${d}°${m}′${s.toFixed(1)}″`
  },

  /**
   * Format Right Ascension from decimal degrees into hours/minutes/seconds.
   *
   * @param deg - RA in decimal degrees (0–360).
   * @returns Formatted string like `'5h 35m 17.3s'`.
   *
   * @example
   * ```ts
   * Units.formatRA(83.822)  // '5h 35m 17.3s'
   * Units.formatRA(0)       // '0h 0m 0.0s'
   * ```
   */
  formatRA(deg: number): string {
    const total = ((deg % 360) + 360) % 360  // normalise to [0, 360)
    const h = Math.floor(total / 15)
    const m = Math.floor(((total / 15) - h) * 60)
    const s = (((total / 15) - h) * 60 - m) * 60
    return `${h}h ${m}m ${s.toFixed(1)}s`
  },
} as const
