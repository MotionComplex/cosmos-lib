/**
 * Complete Messier Catalog -- all 110 objects.
 *
 * Source: SEDS Messier Database.
 * Coordinates are J2000 equatorial.
 *
 * @module
 */
/**
 * A Messier catalog entry with position, photometry, and classification.
 *
 * Each object has a Messier number (1-110), an optional NGC/IC cross-reference,
 * and is typed as `'nebula'`, `'cluster'`, or `'galaxy'` with a more specific subtype.
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
/**
 * The complete Messier catalog: all 110 deep-sky objects cataloged by
 * Charles Messier in the 18th century.
 *
 * Includes nebulae, star clusters, and galaxies with J2000 coordinates,
 * apparent magnitudes, angular sizes, and distances.
 *
 * @example
 * ```ts
 * import { MESSIER_CATALOG } from '@motioncomplex/cosmos-lib'
 *
 * const m42 = MESSIER_CATALOG.find(m => m.messier === 42)
 * console.log(m42?.name)         // 'Orion Nebula'
 * console.log(m42?.distance_kly) // 1.34
 *
 * // Get all galaxies in the catalog
 * const galaxies = MESSIER_CATALOG.filter(m => m.type === 'galaxy')
 * console.log(galaxies.length) // 40
 * ```
 */
export declare const MESSIER_CATALOG: readonly MessierObject[];
