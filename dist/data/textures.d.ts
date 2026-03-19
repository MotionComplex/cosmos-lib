/**
 * Curated public-domain texture URL registry.
 *
 * Does **not** bundle binary assets -- provides URLs to known-good sources
 * (primarily Wikimedia Commons). Multiple fallback URLs per texture for
 * use with `Media.chainLoad`.
 *
 * @module
 */
/**
 * Metadata for a single texture asset, including resolution and licensing.
 *
 * Each texture has one or more URLs ordered by quality (highest first).
 * The multiple-URL design enables fallback loading via `Media.chainLoad`.
 */
export interface TextureInfo {
    /** Unique identifier (e.g. `'earth'`, `'saturn_ring'`). */
    id: string;
    /** Human-readable name (e.g. `'Earth Blue Marble'`). */
    name: string;
    /** URLs ordered by quality (highest first). Multiple entries for fallback. */
    urls: string[];
    /** Attribution/credit string. */
    credit: string;
    /** License type. */
    license: 'public-domain' | 'CC0' | 'CC-BY';
    /** Texture width in pixels. */
    width: number;
    /** Texture height in pixels. */
    height: number;
}
/**
 * Planet and moon surface textures -- NASA/JPL public-domain imagery.
 *
 * Includes the Sun, all eight planets (with atmosphere/cloud/night variants
 * for Earth and Venus), Saturn's ring, and the Moon. Keyed by body ID.
 *
 * @example
 * ```ts
 * import { PLANET_TEXTURES } from '@motioncomplex/cosmos-lib'
 *
 * const earth = PLANET_TEXTURES['earth']
 * console.log(earth.name)   // 'Earth Blue Marble'
 * console.log(earth.width)  // 8192
 * console.log(earth.urls[0]) // Wikimedia Commons URL
 *
 * // Load with fallback chain
 * const marsUrl = await Media.chainLoad(PLANET_TEXTURES['mars'].urls)
 * ```
 */
export declare const PLANET_TEXTURES: Readonly<Record<string, TextureInfo>>;
/**
 * Star field and Milky Way panorama textures for sky-sphere backgrounds.
 *
 * @example
 * ```ts
 * import { STAR_TEXTURES } from '@motioncomplex/cosmos-lib'
 *
 * const milkyWay = STAR_TEXTURES['milky_way']
 * console.log(milkyWay.credit)  // 'ESO/S. Brunier'
 * console.log(milkyWay.license) // 'CC-BY'
 *
 * const starField = STAR_TEXTURES['star_field']
 * console.log(starField.width)  // 8192
 * ```
 */
export declare const STAR_TEXTURES: Readonly<Record<string, TextureInfo>>;
