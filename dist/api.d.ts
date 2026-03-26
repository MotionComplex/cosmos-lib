import type { NASAImageResult, APODResult, ESAHubbleResult, SimbadResult } from './types.js';
/**
 * Options for filtering and paginating NASA Image and Video Library searches.
 *
 * @see {@link NASA.searchImages} for usage.
 */
export interface NASASearchOptions {
    /** Media type filter. Defaults to `'image'`. */
    mediaType?: 'image' | 'video' | 'audio';
    /** Restrict results to items published on or after this year. */
    yearStart?: number;
    /** Restrict results to items published on or before this year. */
    yearEnd?: number;
    /** Number of results per page. Defaults to `10`. */
    pageSize?: number;
    /** 1-based page number for pagination. Defaults to `1`. */
    page?: number;
}
/**
 * Client for the NASA public APIs, including the Image and Video Library
 * and the Astronomy Picture of the Day (APOD) service.
 *
 * By default requests use the `DEMO_KEY` API key, which is subject to
 * strict rate limits. Call {@link NASA.setApiKey} with a free key from
 * {@link https://api.nasa.gov} before making production requests.
 *
 * @example
 * ```ts
 * import { NASA } from 'cosmos-lib'
 *
 * NASA.setApiKey('your-api-key')
 * const results = await NASA.searchImages('pillars of creation')
 * console.log(results[0].title)
 * ```
 */
export declare const NASA: {
    /**
     * Set the NASA API key used for APOD requests.
     *
     * The default key (`DEMO_KEY`) is heavily rate-limited (30 req/hr,
     * 50 req/day). Register for a free key at {@link https://api.nasa.gov}
     * to raise these limits to 1,000 req/hr.
     *
     * @param key - Your NASA API key.
     *
     * @example
     * ```ts
     * NASA.setApiKey('Ab12Cd34Ef56Gh78Ij90KlMnOpQrStUvWxYz0123')
     * ```
     */
    setApiKey(key: string): void;
    /**
     * Search the NASA Image and Video Library.
     *
     * Queries the public NASA images API and returns an array of
     * {@link NASAImageResult} objects containing metadata and preview URLs.
     *
     * @param query - Free-text search term (e.g. `'pillars of creation'`).
     * @param opts  - Optional filters and pagination settings.
     *
     * @returns An array of search results. An empty array is returned when
     *          the query matches nothing.
     *
     * @throws {Error} If the NASA API responds with a non-2xx status code.
     *
     * @example
     * ```ts
     * const results = await NASA.searchImages('pillars of creation', {
     *   yearStart: 2010,
     *   pageSize: 5,
     * })
     * for (const r of results) {
     *   console.log(r.title, r.previewUrl)
     * }
     * ```
     *
     * @see {@link https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf | NASA Image API docs}
     */
    searchImages(query: string, opts?: NASASearchOptions): Promise<NASAImageResult[]>;
    /**
     * Fetch all asset URLs for a given NASA image ID.
     *
     * Returns the full list of available renditions (JPEG, TIFF, etc.)
     * sorted by quality: original, large, medium, small, then thumbnail.
     *
     * @param nasaId - The NASA-assigned identifier (e.g. `'PIA06890'`).
     *
     * @returns An array of absolute URLs sorted from highest to lowest quality.
     *
     * @throws {Error} If the NASA asset endpoint responds with a non-2xx status.
     *
     * @example
     * ```ts
     * const urls = await NASA.getAssets('PIA06890')
     * console.log(urls[0]) // highest quality rendition
     * ```
     */
    getAssets(nasaId: string): Promise<string[]>;
    /**
     * Convenience helper that returns the single highest-quality image URL
     * for a NASA asset ID.
     *
     * Internally calls {@link NASA.getAssets} and filters for image file
     * extensions (JPEG, PNG, GIF, TIFF), returning the first match (which
     * is the original-resolution rendition when available).
     *
     * @param nasaId - The NASA-assigned identifier (e.g. `'PIA06890'`).
     *
     * @returns The URL of the best available image, or `null` if no image
     *          renditions exist for the given ID.
     *
     * @throws {Error} If the underlying {@link NASA.getAssets} call fails.
     *
     * @example
     * ```ts
     * const url = await NASA.getBestImageUrl('PIA06890')
     * if (url) {
     *   document.querySelector('img')!.src = url
     * }
     * ```
     */
    getBestImageUrl(nasaId: string): Promise<string | null>;
    /**
     * Fetch the NASA Astronomy Picture of the Day (APOD).
     *
     * Returns a single {@link APODResult} containing the title, explanation,
     * standard and HD image URLs, and copyright information.
     *
     * @param date - An ISO-8601 date string (`'2024-06-15'`) or a `Date`
     *               object. When omitted the API returns today's picture.
     *
     * @returns The APOD entry for the requested date.
     *
     * @throws {Error} If the APOD API responds with a non-2xx status code
     *                 (e.g. 403 for an invalid API key, 404 for a date with
     *                 no entry).
     *
     * @example
     * ```ts
     * // Today's APOD
     * const today = await NASA.apod()
     * console.log(today.title, today.hdUrl)
     *
     * // A specific date
     * const historic = await NASA.apod('1995-06-16')
     * ```
     */
    apod(date?: string | Date): Promise<APODResult>;
    /**
     * Fetch a random selection of recent APOD entries.
     *
     * Uses the `count` parameter of the APOD API to retrieve multiple
     * randomly-selected entries at once. Thumbnails are requested for
     * video entries.
     *
     * @param count - Number of random entries to return. Defaults to `7`.
     *                The NASA API supports a maximum of `100`.
     *
     * @returns An array of {@link APODResult} objects.
     *
     * @throws {Error} If the APOD API responds with a non-2xx status code.
     *
     * @example
     * ```ts
     * const week = await NASA.recentAPOD()
     * for (const entry of week) {
     *   console.log(`${entry.date}: ${entry.title}`)
     * }
     *
     * // Fetch 20 random entries
     * const batch = await NASA.recentAPOD(20)
     * ```
     */
    recentAPOD(count?: number): Promise<APODResult[]>;
};
/**
 * Client for the European Space Agency (ESA) Hubble Space Telescope
 * public image archive.
 *
 * @example
 * ```ts
 * import { ESA } from 'cosmos-lib'
 *
 * const images = await ESA.searchHubble('crab nebula', 5)
 * console.log(images[0].title, images[0].imageUrl)
 * ```
 */
export declare const ESA: {
    /**
     * Search the ESA Hubble Space Telescope image archive.
     *
     * Scrapes the ESA/Hubble image search page and extracts the embedded
     * result data. Returns an array of {@link ESAHubbleResult} objects with
     * CDN image URLs.
     *
     * @param query - Free-text search term (e.g. `'crab nebula'`).
     * @param limit - Maximum number of results to return. Defaults to `10`.
     *
     * @returns An array of matching Hubble image results. Each result
     *          includes both a full-resolution `imageUrl` and a
     *          screen-sized `thumbUrl`.
     *
     * @throws {Error} If the ESA site responds with a non-2xx status code
     *                 or the page format cannot be parsed.
     *
     * @example
     * ```ts
     * const results = await ESA.searchHubble('crab nebula', 3)
     * for (const r of results) {
     *   console.log(r.title, r.thumbUrl)
     * }
     * ```
     *
     * @see {@link https://esahubble.org/images/ | ESA Hubble image archive}
     */
    searchHubble(query: string, limit?: number): Promise<ESAHubbleResult[]>;
};
/**
 * Resolve an astronomical object name through the CDS SIMBAD TAP service.
 *
 * Performs an ADQL query against the SIMBAD database at the Strasbourg
 * Astronomical Data Centre (CDS) and returns the J2000 equatorial
 * coordinates and object type for the first match.
 *
 * @param objectName - Any object identifier recognised by SIMBAD
 *                     (e.g. `'M1'`, `'NGC 6611'`, `'Betelgeuse'`).
 *
 * @returns A {@link SimbadResult} with the main identifier, RA/Dec in
 *          degrees, and the SIMBAD object-type code, or `null` if the
 *          object name could not be resolved.
 *
 * @throws {Error} If the SIMBAD TAP endpoint responds with a non-2xx
 *                 status code.
 *
 * @example
 * ```ts
 * import { resolveSimbad } from 'cosmos-lib'
 *
 * const m1 = await resolveSimbad('M1')
 * if (m1) {
 *   console.log(`RA: ${m1.ra}, Dec: ${m1.dec}, Type: ${m1.type}`)
 * }
 *
 * const star = await resolveSimbad('Betelgeuse')
 * // => { id: '* alf Ori', ra: 88.792..., dec: 7.407..., type: 'LP*' }
 * ```
 */
export declare function resolveSimbad(objectName: string): Promise<SimbadResult | null>;
