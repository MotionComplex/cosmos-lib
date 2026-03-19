/**
 * Bright Star Catalog — Top ~300 named stars by apparent magnitude.
 * Source: IAU Working Group on Star Names + Yale Bright Star Catalog.
 * Coordinates are J2000 equatorial. Proper motions in milliarcseconds/year.
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
export declare const BRIGHT_STARS: readonly BrightStar[];
