/**
 * Lens database — popular lenses for wide-field astrophotography.
 *
 * Covers wide-angle to telephoto primes commonly used for Milky Way,
 * constellation, and tracked deep-sky photography.
 *
 * @module
 */
/** A camera lens with optical specs. */
export interface Lens {
    /** Unique identifier (slugified name). */
    id: string;
    /** Display name. */
    name: string;
    /** Manufacturer. */
    brand: string;
    /** Focal length in mm. */
    focalLength: number;
    /** Maximum aperture diameter in mm (focal length / f-number). */
    maxAperture: number;
    /** Maximum aperture f-number. */
    fNumber: number;
    /** Mount type. */
    mount: 'canon-ef' | 'canon-rf' | 'nikon-f' | 'nikon-z' | 'sony-e' | 'fuji-x' | 'mft' | 'universal';
}
export declare const LENSES: readonly Lens[];
