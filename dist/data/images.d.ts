import type { ImageRef } from '../types.js';
/**
 * Curated Wikimedia Commons image entries for the most iconic Messier objects.
 *
 * Each key is an object ID (e.g. `'m42'`) mapping to an array of
 * {@link ImageRef} records with a Wikimedia `filename` and `credit` string.
 * These are guaranteed-available with no API call needed, making them
 * ideal for offline fallbacks and static site generation.
 *
 * Use {@link Data.imageUrls}, {@link Data.progressiveImage}, or
 * {@link Data.imageSrcset} for convenient URL generation from this registry.
 *
 * @example
 * ```ts
 * import { IMAGE_FALLBACKS } from '@motioncomplex/cosmos-lib'
 *
 * const orionImages = IMAGE_FALLBACKS['m42']
 * console.log(orionImages?.[0].filename)
 * // => 'Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg'
 * console.log(orionImages?.[0].credit)
 * // => 'NASA . ESA . M. Robberto (STScI/ESA)'
 * ```
 */
export declare const IMAGE_FALLBACKS: Readonly<Record<string, ImageRef[]>>;
/**
 * A resolved image result from NASA or ESA image APIs.
 *
 * Contains multiple resolution URLs (highest quality first), a thumbnail
 * preview, and attribution metadata. Suitable for progressive loading,
 * fallback chains, or Three.js texture inputs.
 */
export interface ResolvedImage {
    /** Multiple resolution URLs, highest quality first. */
    urls: string[];
    /** Preview/thumbnail URL, or `null` if unavailable. */
    previewUrl: string | null;
    /** Image title from the source API. */
    title: string;
    /** Attribution/credit string. */
    credit: string;
    /** Which API the image came from. */
    source: 'nasa' | 'esa';
}
/**
 * Options for the {@link resolveImages} function.
 */
export interface ResolveImageOptions {
    /** Which API source to search. Defaults to `'nasa'`. */
    source?: 'nasa' | 'esa' | 'all';
    /** Maximum number of results. Defaults to `5`. */
    limit?: number;
}
/**
 * Search NASA and/or ESA APIs for images of a celestial object by name.
 *
 * Returns multi-resolution image results that can feed directly into
 * `Media.chainLoad()`, `Media.progressive()`, or `createNebula({ textureUrls })`.
 * Works for any object -- not limited to the static {@link IMAGE_FALLBACKS} registry.
 *
 * @param name - Object name to search (e.g. `'Orion Nebula'`, `'M42'`, `'Sirius'`).
 * @param opts - Search options controlling source and result count.
 * @returns A promise resolving to an array of {@link ResolvedImage} results.
 *
 * @example
 * ```ts
 * import { resolveImages } from '@motioncomplex/cosmos-lib'
 *
 * // Search NASA for Orion Nebula images
 * const images = await resolveImages('Orion Nebula', { limit: 3 })
 * console.log(images[0].title, images[0].urls[0])
 *
 * // Search both NASA and ESA
 * const all = await resolveImages('Crab Nebula', { source: 'all' })
 * ```
 */
export declare function resolveImages(name: string, opts?: ResolveImageOptions): Promise<ResolvedImage[]>;
