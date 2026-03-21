import { resolveImages, getObjectImage, prefetchImages } from './images.js';
import type { CelestialObject, ObjectType, ProximityResult, EquatorialCoord, ProgressiveImageOptions } from '../types.js';
import type { BrightStar } from './stars.js';
import type { Constellation } from './constellations.js';
import type { MessierObject } from './messier.js';
import type { MeteorShower } from './showers.js';
export type { BrightStar } from './stars.js';
export type { Constellation } from './constellations.js';
export type { MessierObject } from './messier.js';
export type { MeteorShower } from './showers.js';
export type { SolarSystemBody } from './solar-system.js';
export type { ResolvedImage, ResolveImageOptions } from './images.js';
export { SOLAR_SYSTEM } from './solar-system.js';
export { DEEP_SKY_EXTRAS } from './deep-sky.js';
export { BRIGHT_STARS } from './stars.js';
export { CONSTELLATIONS } from './constellations.js';
export { MESSIER_CATALOG } from './messier.js';
export { METEOR_SHOWERS } from './showers.js';
export { IMAGE_FALLBACKS, resolveImages, getObjectImage, prefetchImages } from './images.js';
export { computeFov, tryPanSTARRS, tryDSS } from './cutouts.js';
export type { CutoutResult, CutoutOptions } from './cutouts.js';
/** Compact star record used by tier data files. */
export interface TierStar {
    ra: number;
    dec: number;
    mag: number;
    bv: number;
}
/**
 * Unified data-access facade for all built-in astronomical catalogs.
 *
 * Merges solar-system bodies, bright stars, Messier objects, and deep-sky
 * extras into a single searchable collection. Also exposes typed accessors
 * for individual catalogs (stars, constellations, Messier, meteor showers)
 * and image-resolution helpers.
 *
 * @example
 * ```ts
 * import { Data } from '@motioncomplex/cosmos-lib'
 *
 * const orion = Data.search('orion')
 * const sirius = Data.getByName('Sirius')
 * const m42 = Data.getMessier(42)
 * ```
 */
export declare const Data: {
    /**
     * Look up a celestial object by its exact identifier.
     *
     * @param id - The unique object ID (e.g. `'mars'`, `'m42'`, `'sirius'`).
     * @returns The matching {@link CelestialObject}, or `null` if not found.
     *
     * @example
     * ```ts
     * const mars = Data.get('mars')
     * // => { id: 'mars', name: 'Mars', type: 'planet', ... }
     *
     * const missing = Data.get('nonexistent')
     * // => null
     * ```
     */
    get(id: string): CelestialObject | null;
    /**
     * Look up a celestial object by name or any known alias (case-insensitive).
     *
     * @param name - The common name or alias (e.g. `'Sirius'`, `'Morning Star'`, `'NGC 1976'`).
     * @returns The matching {@link CelestialObject}, or `null` if no match.
     *
     * @example
     * ```ts
     * const sirius = Data.getByName('Sirius')
     * // => { id: 'sirius', name: 'Sirius', type: 'star', ... }
     *
     * const venus = Data.getByName('morning star')
     * // => { id: 'venus', name: 'Venus', ... }
     * ```
     */
    getByName(name: string): CelestialObject | null;
    /**
     * Return a shallow copy of the full unified catalog.
     *
     * The returned array is a new instance on every call, so it is safe to
     * sort, filter, or mutate without affecting the internal data.
     *
     * @returns A new array containing every {@link CelestialObject} in the catalog.
     *
     * @example
     * ```ts
     * const catalog = Data.all()
     * console.log(catalog.length) // ~420+ objects
     * ```
     */
    all(): CelestialObject[];
    /**
     * Filter the unified catalog by object type.
     *
     * @param type - The {@link ObjectType} to filter on (e.g. `'planet'`, `'nebula'`, `'galaxy'`).
     * @returns All objects matching the given type.
     *
     * @example
     * ```ts
     * const nebulae = Data.getByType('nebula')
     * // => [{ id: 'm1', name: 'Crab Nebula', ... }, ...]
     *
     * const planets = Data.getByType('planet')
     * // => [{ id: 'mercury', ... }, { id: 'venus', ... }, ...]
     * ```
     */
    getByType(type: ObjectType): CelestialObject[];
    /**
     * Filter the unified catalog by a tag string.
     *
     * @param tag - A tag to match (e.g. `'messier'`, `'solar-system'`, `'globular'`).
     * @returns All objects whose `tags` array includes the given string.
     *
     * @example
     * ```ts
     * const messierObjects = Data.getByTag('messier')
     * // => all 110 Messier catalog entries
     *
     * const solarSystem = Data.getByTag('solar-system')
     * // => Sun, planets, and Moon
     * ```
     */
    getByTag(tag: string): CelestialObject[];
    /**
     * Fuzzy search across name, aliases, description, and tags.
     *
     * Results are ranked by a weighted relevance score: exact ID and name
     * matches rank highest, followed by alias matches, partial name matches,
     * description hits, and tag hits. Results are sorted highest-score first.
     *
     * @param query - The search term (case-insensitive). An empty string returns `[]`.
     * @returns Matching {@link CelestialObject CelestialObjects} sorted by relevance.
     *
     * @example
     * ```ts
     * const results = Data.search('orion')
     * // => [Orion Nebula (M42), De Mairan's Nebula (M43), Betelgeuse, ...]
     *
     * const galaxies = Data.search('spiral')
     * // => all objects with 'spiral' in name, subtype, description, or tags
     * ```
     */
    search(query: string): CelestialObject[];
    /**
     * Find all objects within a given angular radius of a sky position.
     *
     * Only considers objects with known RA/Dec coordinates (solar-system
     * bodies with `null` RA/Dec are excluded). Results are sorted by
     * angular separation, nearest first.
     *
     * @param center - The sky position to search around, in J2000 equatorial coordinates.
     * @param radiusDeg - Search radius in degrees.
     * @returns An array of {@link ProximityResult} objects, each containing the
     *   matched object and its angular separation from the center.
     *
     * @example
     * ```ts
     * // Find objects within 5 degrees of the Orion Nebula
     * const nearby = Data.nearby({ ra: 83.82, dec: -5.39 }, 5)
     * nearby.forEach(r =>
     *   console.log(`${r.object.name}: ${r.separation.toFixed(2)}deg`)
     * )
     * ```
     */
    nearby(center: EquatorialCoord, radiusDeg: number): ProximityResult[];
    /**
     * Get static Wikimedia image URLs for an object from the fallback registry.
     *
     * Uses the curated {@link IMAGE_FALLBACKS} registry (no API call needed).
     * Returns an empty array if the object has no static images registered.
     *
     * @param id - The object ID (e.g. `'m42'`, `'m31'`).
     * @param width - Optional pixel width for Wikimedia thumbnail resizing.
     * @returns An array of Wikimedia Commons thumbnail URLs.
     *
     * @example
     * ```ts
     * const urls = Data.imageUrls('m42', 1280)
     * // => ['https://upload.wikimedia.org/...Orion_Nebula.../1280px-...']
     *
     * const empty = Data.imageUrls('mercury')
     * // => []
     * ```
     */
    imageUrls(id: string, width?: number): string[];
    /**
     * Build a {@link ProgressiveImageOptions} config from the static fallback registry.
     *
     * Produces a tiny 64 px placeholder, a standard-resolution source, and a
     * 2x HD source -- ready to feed into `Media.progressive()`.
     * Returns `null` if the object has no static images registered.
     *
     * @param id - The object ID (e.g. `'m42'`, `'m51'`).
     * @param width - Target width in pixels for the standard source. Defaults to `800`.
     * @returns A {@link ProgressiveImageOptions} object, or `null`.
     *
     * @example
     * ```ts
     * const prog = Data.progressiveImage('m42', 1024)
     * // => { placeholder: '...64px...', src: '...1024px...', srcHD: '...2048px...' }
     * ```
     */
    progressiveImage(id: string, width?: number): ProgressiveImageOptions | null;
    /**
     * Generate an HTML `srcset` string from the static fallback registry.
     *
     * Produces a comma-separated list of `<url> <width>w` entries suitable
     * for the `srcset` attribute of an `<img>` element.
     * Returns `null` if the object has no static images registered.
     *
     * @param id - The object ID (e.g. `'m31'`).
     * @param widths - Array of pixel widths to include. Defaults to `[640, 1280, 1920]`.
     * @returns A `srcset`-formatted string, or `null`.
     *
     * @example
     * ```ts
     * const srcset = Data.imageSrcset('m31')
     * // => '...640px-... 640w, ...1280px-... 1280w, ...1920px-... 1920w'
     * ```
     */
    imageSrcset(id: string, widths?: number[]): string | null;
    /**
     * Search NASA and/or ESA APIs for images of any celestial object by name.
     *
     * Returns multi-resolution {@link ResolvedImage} results suitable for
     * progressive loading, fallback chains, or Three.js textures.
     * Unlike the static `imageUrls` / `imageSrcset` helpers, this method
     * works for **any** object -- it is not limited to the curated fallback registry.
     *
     * @param name - Object name to search (e.g. `'Orion Nebula'`, `'M42'`, `'Sirius'`).
     * @param opts - Optional {@link ResolveImageOptions} to control source and limit.
     * @returns A promise resolving to an array of {@link ResolvedImage} results.
     *
     * @example
     * ```ts
     * const images = await Data.resolveImages('Crab Nebula', { source: 'all', limit: 3 })
     * images.forEach(img => console.log(img.title, img.urls[0]))
     * ```
     */
    resolveImages: typeof resolveImages;
    /**
     * Unified image pipeline — resolves the best available image for any
     * celestial object and returns it in an optimized, ready-to-render format.
     *
     * Runs a cascading lookup: static registry (instant) → NASA → ESA.
     * Results from API sources are cached in memory. The consumer only needs
     * to provide the object ID and name — the pipeline handles source selection,
     * URL construction, and responsive `srcset` generation.
     *
     * @param id   - Object ID (e.g. `'mars'`, `'m42'`, `'sirius'`).
     * @param name - Display name for API search fallback (e.g. `'Mars'`).
     * @param opts - Width, srcset, and source preferences.
     * @returns The best available image, or `null` if nothing was found.
     *
     * @example
     * ```ts
     * const img = await Data.getImage('mars', 'Mars')
     * if (img) {
     *   heroEl.src = img.src
     *   heroEl.srcset = img.srcset ?? ''
     *   creditEl.textContent = img.credit
     * }
     * ```
     */
    getImage: typeof getObjectImage;
    /**
     * Prefetch images for a list of object IDs in the background.
     *
     * Results are stored in the in-memory cache so subsequent
     * {@link Data.getImage} calls resolve instantly.
     *
     * @param ids - Object IDs to prefetch.
     *
     * @example
     * ```ts
     * Data.prefetchImages(filteredObjects.map(o => o.id))
     * ```
     */
    prefetchImages: typeof prefetchImages;
    /**
     * Get all bright stars in the catalog (~200 IAU named stars).
     *
     * @returns The full {@link BRIGHT_STARS} array (readonly).
     *
     * @example
     * ```ts
     * const stars = Data.stars()
     * console.log(stars[0].name) // 'Sirius'
     * ```
     */
    stars(): readonly BrightStar[];
    /**
     * Look up a bright star by its IAU proper name (case-insensitive).
     *
     * @param name - The IAU proper name (e.g. `'Sirius'`, `'Betelgeuse'`, `'Polaris'`).
     * @returns The matching {@link BrightStar}, or `null` if not found.
     *
     * @example
     * ```ts
     * const sirius = Data.getStarByName('Sirius')
     * // => { id: 'sirius', name: 'Sirius', con: 'CMa', mag: -1.46, ... }
     * ```
     */
    getStarByName(name: string): BrightStar | null;
    /**
     * Get all bright stars belonging to a given constellation.
     *
     * @param con - The 3-letter IAU constellation abbreviation (case-insensitive),
     *   e.g. `'Ori'`, `'CMa'`, `'UMa'`.
     * @returns All {@link BrightStar BrightStars} in that constellation.
     *
     * @example
     * ```ts
     * const orionStars = Data.getStarsByConstellation('Ori')
     * // => [Rigel, Betelgeuse, Bellatrix, Alnilam, Alnitak, Mintaka, Saiph]
     * ```
     */
    getStarsByConstellation(con: string): BrightStar[];
    /**
     * Find bright stars within a given angular radius of a sky position.
     *
     * Results are sorted by angular separation (nearest first).
     *
     * @param center - The sky position to search around, in J2000 equatorial coordinates.
     * @param radiusDeg - Search radius in degrees.
     * @returns An array of objects, each containing the matched {@link BrightStar}
     *   and its angular `separation` in degrees from the center.
     *
     * @example
     * ```ts
     * // Find bright stars within 10 degrees of Sirius
     * const nearby = Data.nearbyStars({ ra: 101.287, dec: -16.716 }, 10)
     * nearby.forEach(r =>
     *   console.log(`${r.star.name}: ${r.separation.toFixed(2)}deg`)
     * )
     * ```
     */
    nearbyStars(center: EquatorialCoord, radiusDeg: number): Array<{
        star: BrightStar;
        separation: number;
    }>;
    /**
     * Get all 88 IAU constellations.
     *
     * @returns The full {@link CONSTELLATIONS} array (readonly).
     *
     * @example
     * ```ts
     * const all = Data.constellations()
     * console.log(all.length) // 88
     * ```
     */
    constellations(): readonly Constellation[];
    /**
     * Look up a constellation by its 3-letter IAU abbreviation (case-insensitive).
     *
     * @param abbr - The abbreviation (e.g. `'Ori'`, `'UMa'`, `'Sco'`).
     * @returns The matching {@link Constellation}, or `null` if not found.
     *
     * @example
     * ```ts
     * const orion = Data.getConstellation('Ori')
     * // => { abbr: 'Ori', name: 'Orion', genitive: 'Orionis', area: 594, ... }
     * ```
     */
    getConstellation(abbr: string): Constellation | null;
    /**
     * Get all 110 Messier objects.
     *
     * @returns The full {@link MESSIER_CATALOG} array (readonly).
     *
     * @example
     * ```ts
     * const catalog = Data.messier()
     * console.log(catalog.length) // 110
     * ```
     */
    messier(): readonly MessierObject[];
    /**
     * Look up a Messier object by its catalog number.
     *
     * @param number - The Messier number, from 1 to 110.
     * @returns The matching {@link MessierObject}, or `null` if out of range.
     *
     * @example
     * ```ts
     * const m42 = Data.getMessier(42)
     * // => { messier: 42, name: 'Orion Nebula', type: 'nebula', mag: 4.0, ... }
     *
     * const m1 = Data.getMessier(1)
     * // => { messier: 1, name: 'Crab Nebula', ... }
     * ```
     */
    getMessier(number: number): MessierObject | null;
    /**
     * Get all meteor showers in the catalog (~23 significant annual showers).
     *
     * @returns The full {@link METEOR_SHOWERS} array (readonly).
     *
     * @example
     * ```ts
     * const showers = Data.showers()
     * const perseids = showers.find(s => s.id === 'perseids')
     * console.log(perseids?.zhr) // 100
     * ```
     */
    showers(): readonly MeteorShower[];
    /**
     * Get meteor showers that are active on a given date.
     *
     * Computes the Sun's ecliptic longitude for the date and compares it
     * against each shower's peak solar longitude, returning those within
     * a +/-20 degree activity window.
     *
     * @param date - The date to check for active showers.
     * @returns An array of {@link MeteorShower MeteorShowers} active on the given date.
     *
     * @example
     * ```ts
     * // Check for active showers on August 12 (Perseid peak)
     * const active = Data.getActiveShowers(new Date('2025-08-12'))
     * console.log(active.map(s => s.name))
     * // => ['Perseids', 'Kappa Cygnids', ...]
     * ```
     */
    getActiveShowers(date: Date): MeteorShower[];
    /**
     * Load an expanded star tier into the catalog.
     *
     * - **Tier 0** (default): ~200 IAU named bright stars — always bundled
     * - **Tier 1**: ~9,100 stars to magnitude 6.5 (naked-eye limit) — ~145 KB
     * - **Tier 2**: ~120,000 stars to magnitude 9+ — ~1.9 MB (compact binary)
     *
     * Loaded stars are merged into the unified catalog and become available
     * to `search()`, `nearby()`, `all()`, `getByType('star')`, and sky map
     * rendering. Loading is idempotent — calling again for an already-loaded
     * tier is a no-op.
     *
     * @param tier - The tier to load (1 or 2).
     * @returns A promise that resolves with the number of stars added.
     *
     * @remarks
     * Star data is sourced from the HYG Database v3.8 (public domain).
     * Attribution: David Nash, "HYG Stellar Database", https://github.com/astronexus/HYG-Database
     *
     * @example
     * ```ts
     * // Load naked-eye stars
     * const added = await Data.loadStarTier(1)
     * console.log(`Added ${added} stars`)
     *
     * // Now search finds fainter stars
     * const faint = Data.search('hip 12345')
     *
     * // Sky map renders more stars
     * renderSkyMap(canvas, Data.all(), { showMagnitudeLimit: 6.5 })
     * ```
     */
    loadStarTier(tier: 1 | 2): Promise<number>;
    /**
     * Check which star tiers are currently loaded.
     *
     * @returns A set of loaded tier numbers (always includes 0).
     *
     * @example
     * ```ts
     * Data.loadedStarTiers() // Set { 0 }
     * await Data.loadStarTier(1)
     * Data.loadedStarTiers() // Set { 0, 1 }
     * ```
     */
    loadedStarTiers(): ReadonlySet<number>;
};
