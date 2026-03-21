import type { Camera } from './data/equipment/cameras.js';
import type { Telescope } from './data/equipment/telescopes.js';
import type { Lens } from './data/equipment/lenses.js';
import type { Tracker } from './data/equipment/trackers.js';
import type { ObserverParams } from './types.js';
import type { VisibleObject } from './planner.js';
export type { Camera } from './data/equipment/cameras.js';
export type { Telescope } from './data/equipment/telescopes.js';
export type { Lens } from './data/equipment/lenses.js';
export type { Tracker } from './data/equipment/trackers.js';
/** Field of view in degrees. */
export interface FOV {
    /** Horizontal FOV in degrees. */
    width: number;
    /** Vertical FOV in degrees. */
    height: number;
    /** Diagonal FOV in degrees. */
    diagonal: number;
}
/** Framing analysis for a specific object. */
export interface FramingResult {
    /** How much of the sensor the object fills (percentage). >100 means object is larger than FOV. */
    fillPercent: number;
    /** Whether the object fits within the FOV. */
    fits: boolean;
    /** Best orientation for fitting the object. */
    orientation: 'landscape' | 'portrait' | 'either';
    /** Number of mosaic panels needed if the object doesn't fit (with 20% overlap). */
    panels: number;
    /** Object angular size in arcminutes. */
    objectSize: number;
    /** FOV width in arcminutes. */
    fovWidth: number;
}
/** Sampling advice based on pixel scale vs. seeing. */
export interface SamplingAdvice {
    /** Pixel scale in arcseconds per pixel. */
    pixelScale: number;
    /** Seeing value used for comparison (arcseconds). */
    seeing: number;
    /** Whether the setup is oversampled, undersampled, or well-matched. */
    status: 'oversampled' | 'undersampled' | 'optimal';
    /** Human-readable advice. */
    advice: string;
}
/** Options for rig creation. */
export interface RigOptions {
    /** Camera name (looked up from database) or Camera object. */
    camera: string | Camera;
    /** Telescope name (looked up from database) or Telescope object. */
    telescope?: string | Telescope | undefined;
    /** Lens name (looked up from database) or Lens object. */
    lens?: string | Lens | undefined;
    /** Tracker/mount name (looked up from database) or Tracker object. */
    tracker?: string | Tracker | undefined;
    /** Barlow/reducer multiplier (e.g. 2.0 for 2x Barlow, 0.63 for focal reducer). */
    barlow?: number | undefined;
    /** Custom focal length in mm (used when no telescope or lens is specified). */
    focalLength?: number | undefined;
    /** Custom aperture in mm. */
    aperture?: number | undefined;
}
/**
 * An astrophotography rig — a camera paired with optics.
 *
 * Provides FOV, pixel scale, framing analysis, exposure calculation,
 * target recommendations, and sampling advice.
 *
 * @example
 * ```ts
 * const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8' })
 * console.log(rig.fov())         // { width: 0.60°, height: 0.40° }
 * console.log(rig.pixelScale())  // 0.60 arcsec/px
 * console.log(rig.framing('m42')) // { fillPercent: 140, fits: false, panels: 2 }
 * ```
 */
export declare class Rig {
    /** The camera. */
    readonly camera: Camera;
    /** Effective focal length in mm (after barlow/reducer). */
    readonly focalLength: number;
    /** Aperture in mm (if known). */
    readonly aperture: number | null;
    /** Barlow/reducer multiplier applied. */
    readonly barlowFactor: number;
    /** The tracker/mount, if specified. */
    readonly tracker: Tracker | null;
    constructor(camera: Camera, focalLength: number, aperture: number | null, barlowFactor: number, tracker?: Tracker | null);
    /**
     * Field of view in degrees.
     */
    fov(): FOV;
    /**
     * Pixel scale in arcseconds per pixel.
     */
    pixelScale(): number;
    /**
     * Framing analysis for a catalog object.
     *
     * @param objectId - Catalog object ID (e.g. `'m42'`, `'m31'`).
     * @param overlapPercent - Mosaic overlap percentage. @defaultValue `20`
     */
    framing(objectId: string, overlapPercent?: number): FramingResult | null;
    /**
     * Maximum exposure time before star trails.
     *
     * **Without tracker:** Uses the NPF formula (untracked).
     * **With tracker:** Scales the tracker's reference max exposure by
     * focal length ratio, giving a practical tracked exposure limit.
     *
     * @param observer - Observer location (used for declination correction if objectId provided).
     * @param objectId - Optional target — adjusts for declination.
     */
    maxExposure(observer?: ObserverParams, objectId?: string): number;
    /**
     * Check if the tracker can handle this rig's payload.
     *
     * Estimates the camera + optics weight and compares to the tracker's
     * max payload capacity. Returns null if no tracker is set.
     *
     * @param opticsWeightKg - Weight of telescope/lens in kg. Estimated if not provided.
     */
    payloadCheck(opticsWeightKg?: number): {
        withinLimits: boolean;
        estimatedPayloadKg: number;
        maxPayloadKg: number;
        headroomPercent: number;
    } | null;
    /**
     * Whether this rig is tracked (has a tracker/mount).
     */
    get isTracked(): boolean;
    /**
     * Best targets visible tonight that fit well in this rig's FOV.
     *
     * Returns objects where `size_arcmin` is between 10% and 100% of the
     * FOV width — well-framed, not too small, not too large.
     *
     * @param observer - Observer location and time.
     * @param limit - Max results. @defaultValue `10`
     */
    bestTargets(observer: ObserverParams, limit?: number): Array<VisibleObject & {
        framing: FramingResult;
    }>;
    /**
     * Effective resolution and comparison to typical seeing.
     */
    resolution(): {
        pixelScale: number;
        dawesLimit: number;
        raleighLimit: number;
    };
    /**
     * Sampling advice — is this setup oversampled, undersampled, or optimal?
     *
     * @param seeing - Typical seeing in arcseconds. @defaultValue `2.5`
     */
    samplingAdvice(seeing?: number): SamplingAdvice;
}
/**
 * Equipment database and rig builder for astrophotography.
 *
 * Browse cameras, telescopes, and lenses, then combine them into a
 * {@link Rig} that computes FOV, pixel scale, framing, exposure limits,
 * and target recommendations.
 *
 * @example
 * ```ts
 * import { Equipment } from '@motioncomplex/cosmos-lib'
 *
 * // Browse the database
 * const cameras = Equipment.cameras()
 * const sony = Equipment.camera('Sony A7 III')
 *
 * // Build a rig
 * const rig = Equipment.rig({ camera: 'ZWO ASI2600MC Pro', telescope: 'Sky-Watcher Esprit 100ED' })
 * console.log(rig.fov())        // { width: 2.45°, height: 1.63° }
 * console.log(rig.pixelScale()) // 1.41 arcsec/px
 *
 * // With a reducer
 * const rig2 = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8', barlow: 0.63 })
 * ```
 */
export declare const Equipment: {
    /**
     * Get all cameras in the database.
     */
    readonly cameras: () => readonly Camera[];
    /**
     * Look up a camera by name (case-insensitive partial match).
     */
    readonly camera: (name: string) => Camera | null;
    /**
     * Get all telescopes in the database.
     */
    readonly telescopes: () => readonly Telescope[];
    /**
     * Look up a telescope by name (case-insensitive partial match).
     */
    readonly telescope: (name: string) => Telescope | null;
    /**
     * Get all lenses in the database.
     */
    readonly lenses: () => readonly Lens[];
    /**
     * Look up a lens by name (case-insensitive partial match).
     */
    readonly lens: (name: string) => Lens | null;
    /**
     * Get all trackers/mounts in the database.
     */
    readonly trackers: () => readonly Tracker[];
    /**
     * Look up a tracker/mount by name (case-insensitive partial match).
     */
    readonly tracker: (name: string) => Tracker | null;
    /**
     * Build an astrophotography rig from equipment names or specs.
     *
     * @example
     * ```ts
     * // From database names
     * const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: 'Celestron C8' })
     *
     * // With a focal reducer
     * const rig2 = Equipment.rig({ camera: 'ZWO ASI294MC Pro', telescope: 'Sky-Watcher 200PDS', barlow: 0.73 })
     *
     * // Camera + lens
     * const rig3 = Equipment.rig({ camera: 'Canon EOS Ra', lens: 'Canon EF 135mm f/2L USM' })
     *
     * // Custom specs
     * const rig4 = Equipment.rig({
     *   camera: { id: 'custom', name: 'My Camera', brand: 'Custom', type: 'dedicated',
     *     sensorWidth: 17.6, sensorHeight: 13.2, pixelSize: 3.8, pixelsX: 4656, pixelsY: 3520 },
     *   focalLength: 530,
     *   aperture: 100,
     * })
     * ```
     */
    readonly rig: (options: RigOptions) => Rig;
    /**
     * Search all equipment (cameras, telescopes, lenses) by name.
     *
     * Returns a unified list of matches across all categories, scored
     * by relevance. Useful for a single search bar UI.
     *
     * @param query - Search query (case-insensitive partial match).
     * @param limit - Max results. @defaultValue `20`
     * @returns Matches with category label and the equipment object.
     *
     * @example
     * ```ts
     * const results = Equipment.search('ASI')
     * // => [{ category: 'camera', name: 'ZWO ASI2600MC Pro', item: Camera }, ...]
     *
     * const results2 = Equipment.search('200mm')
     * // => cameras, telescopes, AND lenses matching "200mm"
     * ```
     */
    readonly search: (query: string, limit?: number) => Array<{
        category: "camera" | "telescope" | "lens" | "tracker";
        name: string;
        item: Camera | Telescope | Lens | Tracker;
    }>;
};
