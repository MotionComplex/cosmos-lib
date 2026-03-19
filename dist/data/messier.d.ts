/**
 * Complete Messier Catalog — all 110 objects.
 * Source: SEDS Messier Database.
 * Coordinates are J2000 equatorial.
 */
export interface MessierObject {
    /** Messier number (1-110) */
    messier: number;
    /** Common name */
    name: string;
    /** NGC/IC cross-reference */
    ngc?: string;
    /** Object type */
    type: 'nebula' | 'cluster' | 'galaxy';
    /** Subtype for more detail */
    subtype: string;
    /** 3-letter constellation abbreviation */
    constellation: string;
    /** Right Ascension in degrees (J2000) */
    ra: number;
    /** Declination in degrees (J2000) */
    dec: number;
    /** Apparent visual magnitude */
    mag: number | null;
    /** Angular size in arcminutes */
    size_arcmin?: number;
    /** Distance in kilo-light-years */
    distance_kly?: number;
    /** Brief description */
    description: string;
}
export declare const MESSIER_CATALOG: readonly MessierObject[];
