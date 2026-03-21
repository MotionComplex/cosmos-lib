/**
 * Telescope database — popular OTAs for astrophotography and visual.
 *
 * Covers refractors, reflectors (Newtonian), SCTs, Maksutovs, and
 * Ritchey-Chrétien designs from major manufacturers.
 *
 * @module
 */
/** A telescope optical tube assembly. */
export interface Telescope {
    /** Unique identifier (slugified name). */
    id: string;
    /** Display name. */
    name: string;
    /** Manufacturer. */
    brand: string;
    /** Optical design. */
    type: 'refractor' | 'reflector' | 'sct' | 'maksutov' | 'rc';
    /** Aperture in mm. */
    aperture: number;
    /** Native focal length in mm. */
    focalLength: number;
    /** Focal ratio (f/number). */
    focalRatio: number;
}
export declare const TELESCOPES: readonly Telescope[];
