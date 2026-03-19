/**
 * Bright Star Catalog -- Top ~200 named stars by apparent magnitude.
 *
 * Source: IAU Working Group on Star Names + Yale Bright Star Catalog.
 * Coordinates are J2000 equatorial. Proper motions in milliarcseconds/year.
 *
 * @module
 */
/**
 * A named bright star from the IAU catalog with astrometric data.
 *
 * Contains position (J2000), photometry, spectral type, and proper motion.
 * Stars are identified by their slugified IAU proper name.
 */
export interface BrightStar {
    /** Unique identifier (IAU name, slugified) */
    id: string;
    /** IAU proper name */
    name: string;
    /** 3-letter IAU constellation abbreviation */
    con: string;
    /** Harvard Revised (HR/BS) catalog number */
    hr: number;
    /** Right Ascension in degrees (J2000) */
    ra: number;
    /** Declination in degrees (J2000) */
    dec: number;
    /** Apparent visual magnitude */
    mag: number;
    /** Spectral type */
    spec: string;
    /** Proper motion in RA (mas/yr, includes cos(dec) factor) */
    pmRa: number;
    /** Proper motion in Dec (mas/yr) */
    pmDec: number;
    /** B-V color index */
    bv: number;
}
/**
 * IAU-named stars sorted by apparent visual magnitude (brightest first).
 *
 * RA/Dec are J2000.0 epoch in degrees. Proper motions are in mas/yr
 * (pmRA includes the cos(dec) factor). Magnitudes are V-band.
 *
 * @example
 * ```ts
 * import { BRIGHT_STARS } from '@motioncomplex/cosmos-lib'
 *
 * const sirius = BRIGHT_STARS.find(s => s.name === 'Sirius')
 * console.log(sirius?.mag)  // -1.46
 * console.log(sirius?.spec) // 'A1V'
 *
 * // Get the 10 brightest stars
 * const top10 = BRIGHT_STARS.slice(0, 10)
 * ```
 */
export declare const BRIGHT_STARS: readonly BrightStar[];
