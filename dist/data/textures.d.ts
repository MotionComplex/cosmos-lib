/**
 * Curated public-domain texture URL registry.
 * Does NOT bundle binary assets — provides URLs to known-good sources.
 * Multiple fallback URLs per texture for use with Media.chainLoad.
 */
export interface TextureInfo {
    /** Unique identifier */
    id: string;
    /** Human-readable name */
    name: string;
    /** URLs ordered by quality (highest first). Multiple for fallback. */
    urls: string[];
    /** Attribution/credit string */
    credit: string;
    /** License type */
    license: 'public-domain' | 'CC0' | 'CC-BY';
    /** Texture width in pixels */
    width: number;
    /** Texture height in pixels */
    height: number;
}
/** Planet surface textures — NASA/JPL public domain imagery. */
export declare const PLANET_TEXTURES: Readonly<Record<string, TextureInfo>>;
/** Star field and milky way textures. */
export declare const STAR_TEXTURES: Readonly<Record<string, TextureInfo>>;
