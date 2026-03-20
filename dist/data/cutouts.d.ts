/**
 * Runtime coordinate-based image cutout functions.
 *
 * These query Pan-STARRS DR2 and DSS by exact RA/Dec coordinates,
 * guaranteeing the returned image is the correct object. The precomputed
 * file list in {@link PS1_FILES} eliminates the first of Pan-STARRS'
 * two-step request flow, cutting latency roughly in half.
 *
 * @module
 */
/** Result from a coordinate-based cutout request. */
export interface CutoutResult {
    /** Direct image URL. */
    url: string;
    /** Image format. */
    format: 'jpg' | 'gif';
    /** Attribution string. */
    credit: string;
    /** Source identifier. */
    source: 'panstarrs' | 'dss';
}
/** Options controlling cutout generation. */
export interface CutoutOptions {
    /** Desired output width in pixels. @defaultValue `1024` */
    outputSize?: number;
    /** FOV multiplier around object angular size. @defaultValue `1.6` */
    padding?: number;
    /** Minimum FOV floor in arcminutes. @defaultValue `4` */
    minFov?: number;
    /** Maximum FOV ceiling in arcminutes. @defaultValue `120` */
    maxFov?: number;
    /** Timeout in milliseconds for each API call. @defaultValue `15000` */
    timeout?: number;
}
/**
 * Compute the field-of-view in arcminutes for a given object.
 *
 * Uses the object's angular size with padding when known, or a
 * type-based default. Clamped to `[minFov, maxFov]`.
 *
 * @param sizeArcmin - Angular diameter in arcminutes, or `undefined`.
 * @param objectType - Object type string (e.g. `'nebula'`, `'star'`).
 * @param opts       - Padding and clamping overrides.
 */
export declare function computeFov(sizeArcmin: number | undefined, objectType: string, opts?: Pick<CutoutOptions, 'padding' | 'minFov' | 'maxFov'>): number;
/**
 * Build a Pan-STARRS DR2 color cutout URL using the precomputed file list.
 *
 * Returns `null` if dec < -30 (below coverage), no precomputed file list
 * exists for this object, or the HEAD check fails.
 *
 * @param id         - Object identifier for the precomputed lookup.
 * @param ra         - Right Ascension in degrees (J2000).
 * @param dec        - Declination in degrees (J2000).
 * @param fovArcmin  - Desired field of view in arcminutes.
 * @param opts       - Output size and timeout options.
 */
export declare function tryPanSTARRS(id: string, ra: number, dec: number, fovArcmin: number, opts?: CutoutOptions): Promise<CutoutResult | null>;
/**
 * Build a DSS cutout URL via MAST and verify it exists.
 *
 * Full-sky grayscale coverage. Uses POSS2/UKSTU Red for dec > -40,
 * DSS1 Red for the extreme south.
 *
 * @param ra         - Right Ascension in degrees (J2000).
 * @param dec        - Declination in degrees (J2000).
 * @param fovArcmin  - Desired field of view in arcminutes.
 * @param opts       - Timeout options.
 */
export declare function tryDSS(ra: number, dec: number, fovArcmin: number, opts?: CutoutOptions): Promise<CutoutResult | null>;
