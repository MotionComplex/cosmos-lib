import type { ImageRef, ObjectImageResult, GetImageOptions, ProximityResult, EquatorialCoord } from '../types.js';
interface CatalogInfo {
    id: string;
    ra: number | null;
    dec: number | null;
    size_arcmin?: number | undefined;
    type: string;
    name: string;
    aliases: string[];
}
type CatalogLookupFn = (id: string) => CatalogInfo | null;
type NearbyFn = (center: EquatorialCoord, radiusDeg: number) => ProximityResult[];
/** @internal Wire the catalog lookup. Called once from index.ts. */
export declare function _setCatalogLookup(fn: CatalogLookupFn): void;
/** @internal Wire the nearby-search function. Called once from index.ts. */
export declare function _setNearbyFn(fn: NearbyFn): void;
/**
 * Curated Wikimedia Commons image entries for the most iconic celestial objects.
 *
 * Each key is an object ID (e.g. `'m42'`) mapping to an array of
 * {@link ImageRef} records with a Wikimedia `filename` and `credit` string.
 * These are guaranteed-available with no API call needed, making them
 * ideal for offline fallbacks and static site generation.
 *
 * @example
 * ```ts
 * import { IMAGE_FALLBACKS } from '@motioncomplex/cosmos-lib'
 *
 * const orionImages = IMAGE_FALLBACKS['m42']
 * console.log(orionImages?.[0].filename)
 * // => 'Orion_Nebula_-_Hubble_2006_mosaic_18000.jpg'
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
/**
 * Prefetch images for a list of object IDs in the background.
 *
 * Fires off `getObjectImage` for each ID concurrently (with `prefetch: false`
 * to avoid recursive expansion). Results are stored in the in-memory cache
 * so subsequent `Data.getImage()` calls for these objects resolve instantly.
 *
 * Call this when you know which objects the user is likely to view next —
 * e.g. when a list of objects renders or when filtering narrows the results.
 *
 * @param ids - Object IDs to prefetch (e.g. `['m1', 'm2', 'm3']`).
 *
 * @example
 * ```ts
 * // Prefetch when a filtered list renders
 * Data.prefetchImages(filteredObjects.map(o => o.id))
 *
 * // Later, when user taps M2:
 * const img = await Data.getImage('m2', 'M2') // instant from cache
 * ```
 */
export declare function prefetchImages(ids: string[]): void;
/**
 * Unified image pipeline that resolves the best available image for any
 * celestial object, with built-in auto-prefetching of nearby objects.
 *
 * The pipeline runs a cascade of sources in priority order:
 * 1. **In-memory cache** — instant (0ms) for previously resolved images.
 * 2. **Curated Wikimedia static registry** — hand-picked iconic images
 *    served via Wikimedia's thumbnail API with responsive `srcset`.
 *    No network validation — URLs are trusted for zero-latency resolution.
 * 3. **NASA / ESA text search** — high-quality press release imagery.
 * 4. **Pan-STARRS DR2 cutout** *(opt-in, `skipCutouts: false`)* —
 *    coordinate-based color composite. Accurate but raw survey data.
 * 5. **DSS cutout** *(opt-in)* — full-sky grayscale fallback.
 *
 * After resolving, the pipeline automatically prefetches images for nearby
 * objects in the background, so spatial browsing feels instant.
 *
 * @param id   - Object ID (e.g. `'mars'`, `'m42'`, `'sirius'`).
 * @param name - Object display name used for API searches when no
 *               coordinate-based source is available.
 * @param opts - Width, srcset, cutout, and prefetch options.
 * @returns The best available image, or `null` if no image could be found.
 *
 * @example
 * ```ts
 * // Just works — auto-prefetches nearby objects
 * const img = await Data.getImage('m42', 'Orion Nebula', { width: 1200 })
 * if (img) {
 *   heroEl.src = img.src
 *   heroEl.srcset = img.srcset ?? ''
 *   creditEl.textContent = img.credit
 * }
 *
 * // Disable auto-prefetch
 * const img2 = await Data.getImage('m42', 'Orion Nebula', { prefetch: false })
 * ```
 */
export declare function getObjectImage(id: string, name: string, opts?: GetImageOptions): Promise<ObjectImageResult | null>;
export {};
