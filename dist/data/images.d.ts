import type { ImageRef } from '../types.js';
export declare const IMAGE_FALLBACKS: Readonly<Record<string, ImageRef[]>>;
export interface ResolvedImage {
    /** Multiple resolution URLs, highest quality first */
    urls: string[];
    /** Preview/thumbnail URL */
    previewUrl: string | null;
    title: string;
    credit: string;
    source: 'nasa' | 'esa';
}
export interface ResolveImageOptions {
    /** Which API source to search. Defaults to 'nasa'. */
    source?: 'nasa' | 'esa' | 'all';
    /** Maximum number of results. Defaults to 5. */
    limit?: number;
}
/**
 * Search NASA and/or ESA APIs for images of a celestial object by name.
 * Returns multi-resolution image results that can feed directly into
 * `Media.chainLoad()`, `Media.progressive()`, or `createNebula({ textureUrls })`.
 *
 * @param name  Object name to search (e.g. 'Orion Nebula', 'M42', 'Sirius')
 * @param opts  Search options
 */
export declare function resolveImages(name: string, opts?: ResolveImageOptions): Promise<ResolvedImage[]>;
