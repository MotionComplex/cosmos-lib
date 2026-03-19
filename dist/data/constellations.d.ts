/**
 * All 88 IAU constellations with metadata and stick-figure asterism line segments.
 *
 * Coordinates are J2000 epoch, in degrees.
 * Stick-figure segments connect the major naked-eye stars of each traditional
 * Western asterism (similar to Stellarium's default patterns).
 * Each segment is [ra1, dec1, ra2, dec2] in degrees.
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
export declare const CONSTELLATIONS: readonly Constellation[];
