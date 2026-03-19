import { resolveImages } from './images.js';
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
export { IMAGE_FALLBACKS, resolveImages } from './images.js';
export declare const Data: {
    /** Get object by exact id. Returns null if not found. */
    get(id: string): CelestialObject | null;
    /** Get object by name or alias (case-insensitive). Returns null if not found. */
    getByName(name: string): CelestialObject | null;
    /** Return a copy of the full unified catalog. */
    all(): CelestialObject[];
    /** Filter by object type. */
    getByType(type: ObjectType): CelestialObject[];
    /** Filter by tag string (e.g. 'messier', 'stellar-nursery'). */
    getByTag(tag: string): CelestialObject[];
    /**
     * Fuzzy search across name, aliases, description, and tags.
     * Results are sorted by relevance score (highest first).
     */
    search(query: string): CelestialObject[];
    /**
     * Find all objects within a given angular radius of a sky position.
     * Only considers objects with known RA/Dec (not solar-system bodies).
     * Results sorted by separation (nearest first).
     */
    nearby(center: EquatorialCoord, radiusDeg: number): ProximityResult[];
    /**
     * Get static Wikimedia image URLs for an object from the fallback registry.
     * Returns an empty array if the object has no static images.
     */
    imageUrls(id: string, width?: number): string[];
    /**
     * Build a ProgressiveImageOptions config from the static fallback registry.
     * Returns null if the object has no static images.
     */
    progressiveImage(id: string, width?: number): ProgressiveImageOptions | null;
    /**
     * Generate a srcset string from the static fallback registry.
     * Returns null if the object has no static images.
     */
    imageSrcset(id: string, widths?: number[]): string | null;
    /**
     * Search NASA and/or ESA APIs for images of any object by name.
     * Returns multi-resolution image results suitable for progressive loading,
     * fallback chains, or Three.js textures.
     *
     * Works for ANY object — not limited to the static fallback registry.
     */
    resolveImages: typeof resolveImages;
    /** Get all bright stars (~300 IAU named stars). */
    stars(): readonly BrightStar[];
    /** Get a bright star by IAU proper name (case-insensitive). */
    getStarByName(name: string): BrightStar | null;
    /** Get all bright stars in a given constellation (3-letter IAU abbreviation). */
    getStarsByConstellation(con: string): BrightStar[];
    /**
     * Find bright stars within a given angular radius.
     * Results sorted by separation (nearest first).
     */
    nearbyStars(center: EquatorialCoord, radiusDeg: number): Array<{
        star: BrightStar;
        separation: number;
    }>;
    /** Get all 88 IAU constellations. */
    constellations(): readonly Constellation[];
    /** Get a constellation by 3-letter IAU abbreviation (case-insensitive). */
    getConstellation(abbr: string): Constellation | null;
    /** Get all 110 Messier objects. */
    messier(): readonly MessierObject[];
    /** Get a Messier object by number (1-110). */
    getMessier(number: number): MessierObject | null;
    /** Get all meteor showers. */
    showers(): readonly MeteorShower[];
    /**
     * Get meteor showers that are active on a given date.
     * Compares the Sun's ecliptic longitude against each shower's activity window.
     */
    getActiveShowers(date: Date): MeteorShower[];
};
