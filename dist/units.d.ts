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
export declare const Units: {
    /**
     * Convert Astronomical Units to kilometres.
     * @param au - Distance in AU.
     * @returns Distance in kilometres.
     */
    readonly auToKm: (au: number) => number;
    /**
     * Convert kilometres to Astronomical Units.
     * @param km - Distance in kilometres.
     * @returns Distance in AU.
     */
    readonly kmToAu: (km: number) => number;
    /**
     * Convert light-years to parsecs.
     * @param ly - Distance in light-years.
     * @returns Distance in parsecs.
     */
    readonly lyToPc: (ly: number) => number;
    /**
     * Convert parsecs to light-years.
     * @param pc - Distance in parsecs.
     * @returns Distance in light-years.
     */
    readonly pcToLy: (pc: number) => number;
    /**
     * Convert parsecs to kilometres.
     * @param pc - Distance in parsecs.
     * @returns Distance in kilometres.
     */
    readonly pcToKm: (pc: number) => number;
    /**
     * Convert light-years to kilometres.
     * @param ly - Distance in light-years.
     * @returns Distance in kilometres.
     */
    readonly lyToKm: (ly: number) => number;
    /**
     * Convert kilometres to light-years.
     * @param km - Distance in kilometres.
     * @returns Distance in light-years.
     */
    readonly kmToLy: (km: number) => number;
    /**
     * Convert degrees to radians.
     * @param d - Angle in degrees.
     * @returns Angle in radians.
     */
    readonly degToRad: (d: number) => number;
    /**
     * Convert radians to degrees.
     * @param r - Angle in radians.
     * @returns Angle in degrees.
     */
    readonly radToDeg: (r: number) => number;
    /**
     * Convert arcseconds to degrees.
     * @param a - Angle in arcseconds.
     * @returns Angle in degrees.
     */
    readonly arcsecToDeg: (a: number) => number;
    /**
     * Convert degrees to arcseconds.
     * @param d - Angle in degrees.
     * @returns Angle in arcseconds.
     */
    readonly degToArcsec: (d: number) => number;
    /**
     * Convert Right Ascension from hours to degrees.
     * @param h - RA in hours (0–24).
     * @returns RA in degrees (0–360).
     */
    readonly hrsToDeg: (h: number) => number;
    /**
     * Convert Right Ascension from degrees to hours.
     * @param d - RA in degrees (0–360).
     * @returns RA in hours (0–24).
     */
    readonly degToHrs: (d: number) => number;
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
    readonly formatDistance: (km: number) => string;
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
    readonly formatAngle: (deg: number) => string;
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
    readonly formatRA: (deg: number) => string;
};
