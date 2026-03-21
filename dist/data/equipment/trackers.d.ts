/**
 * Star tracker / mount database — popular portable tracking mounts.
 *
 * Covers star trackers, portable EQ mounts, and GoTo mounts used
 * for tracked astrophotography.
 *
 * @module
 */
/** A star tracker or tracking mount. */
export interface Tracker {
    /** Unique identifier (slugified name). */
    id: string;
    /** Display name. */
    name: string;
    /** Manufacturer. */
    brand: string;
    /** Mount type. */
    type: 'star-tracker' | 'eq-mount' | 'goto-mount' | 'alt-az-tracker';
    /** Maximum payload capacity in kg (excluding counterweights). */
    maxPayloadKg: number;
    /** Periodic error in arcseconds (peak-to-peak, if known). Lower is better. */
    periodicError?: number | undefined;
    /** Whether the tracker has autoguiding support. */
    autoguide: boolean;
    /** Whether GoTo / object finding is supported. */
    goto: boolean;
    /** Practical max unguided exposure in seconds at a given focal length reference. */
    maxUnguidedExposure?: number | undefined;
    /** Reference focal length in mm for maxUnguidedExposure. */
    referenceFocalLength?: number | undefined;
}
export declare const TRACKERS: readonly Tracker[];
