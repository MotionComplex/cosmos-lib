/**
 * Runtime coordinate-based image cutout functions.
 *
 * These query HiPS2FITS (CDS), Pan-STARRS DR2, and DSS by exact RA/Dec
 * coordinates, guaranteeing the returned image is the correct object.
 * The precomputed file list in {@link PS1_FILES} eliminates the first of
 * Pan-STARRS' two-step request flow, cutting latency roughly in half.
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
    source: 'panstarrs' | 'hips' | 'dss';
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
/** Pixel stretch functions supported by the hips2fits service. */
export type HiPSStretch = 'linear' | 'sqrt' | 'log' | 'asinh' | 'power';
/** Options specific to HiPS2FITS cutout requests. */
export interface HiPSOptions extends CutoutOptions {
    /** HiPS survey identifier. @defaultValue `'CDS/P/DSS2/color'` */
    hips?: string;
    /** Pixel stretch function. @defaultValue `'linear'` */
    stretch?: HiPSStretch;
    /** Colormap name (matplotlib). @defaultValue `'Greys_r'` */
    cmap?: string;
}
/**
 * Build a hips2fits URL for the given sky coordinates.
 *
 * Useful when you need the raw URL without a HEAD-check — e.g. for
 * Three.js textures, custom projections, or batch prefetching.
 *
 * @param ra        - Right Ascension in degrees (J2000).
 * @param dec       - Declination in degrees (J2000).
 * @param fovDeg    - Field of view in **degrees**.
 * @param width     - Output width in pixels.
 * @param height    - Output height in pixels.
 * @param opts      - Survey, stretch, and colormap overrides.
 */
export declare function buildHips2fitsUrl(ra: number, dec: number, fovDeg: number, width: number, height: number, opts?: Pick<HiPSOptions, 'hips' | 'stretch' | 'cmap'>): string;
/**
 * Fetch a HiPS2FITS cutout via CDS for the given sky coordinates.
 *
 * Full-sky coverage through any HiPS survey. Defaults to `CDS/P/DSS2/color`
 * which provides colour imagery for the entire sky — making it a strict
 * upgrade over the grayscale DSS fallback for most objects.
 *
 * @param ra         - Right Ascension in degrees (J2000).
 * @param dec        - Declination in degrees (J2000).
 * @param fovArcmin  - Desired field of view in arcminutes.
 * @param opts       - Output size, survey, stretch, and timeout options.
 */
export declare function tryHiPS(ra: number, dec: number, fovArcmin: number, opts?: HiPSOptions): Promise<CutoutResult | null>;
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
