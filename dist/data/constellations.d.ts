/**
 * All 88 IAU constellations with metadata and stick-figure asterism line segments.
 *
 * Coordinates are J2000 epoch, in degrees.
 * Stick-figure segments connect the major naked-eye stars of each traditional
 * Western asterism (similar to Stellarium's default patterns).
 * Each segment is `[ra1, dec1, ra2, dec2]` in degrees.
 *
 * @module
 */
/**
 * An IAU constellation with boundary metadata and a stick-figure asterism.
 *
 * Contains the official 3-letter abbreviation, full and genitive names,
 * approximate center coordinates for label placement, the official area
 * in square degrees, the brightest star name, and an array of line
 * segments that form the traditional stick-figure pattern.
 */
export interface Constellation {
    /** 3-letter IAU abbreviation (e.g., "Ori") */
    abbr: string;
    /** Full name (e.g., "Orion") */
    name: string;
    /** Genitive form (e.g., "Orionis") */
    genitive: string;
    /** Approximate center RA for labeling (degrees) */
    ra: number;
    /** Approximate center Dec for labeling (degrees) */
    dec: number;
    /** IAU official area in square degrees */
    area: number;
    /** Array of line segments, each [ra1_deg, dec1_deg, ra2_deg, dec2_deg] */
    stickFigure: number[][];
    /** IAU proper name of the brightest star */
    brightestStar: string;
}
/**
 * All 88 IAU constellations with stick-figure asterism data.
 *
 * Each constellation includes center coordinates for label placement,
 * its official area in square degrees, its brightest star, and an array
 * of line segments (`[ra1, dec1, ra2, dec2]`) defining the traditional
 * Western asterism pattern.
 *
 * @example
 * ```ts
 * import { CONSTELLATIONS } from '@motioncomplex/cosmos-lib'
 *
 * const orion = CONSTELLATIONS.find(c => c.abbr === 'Ori')
 * console.log(orion?.name)          // 'Orion'
 * console.log(orion?.brightestStar) // 'Rigel'
 * console.log(orion?.stickFigure.length) // number of line segments
 *
 * // Get all constellations larger than 1000 sq deg
 * const large = CONSTELLATIONS.filter(c => c.area > 1000)
 * ```
 */
export declare const CONSTELLATIONS: readonly Constellation[];
