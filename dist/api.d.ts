import type { NASAImageResult, APODResult, ESAHubbleResult, SimbadResult } from './types.js';
export interface NASASearchOptions {
    mediaType?: 'image' | 'video' | 'audio';
    yearStart?: number;
    yearEnd?: number;
    pageSize?: number;
    page?: number;
}
export declare const NASA: {
    /** Set a NASA API key for higher rate limits. Get one free at https://api.nasa.gov */
    setApiKey(key: string): void;
    /**
     * Search the NASA Image and Video Library.
     * Docs: https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf
     */
    searchImages(query: string, opts?: NASASearchOptions): Promise<NASAImageResult[]>;
    /**
     * Fetch all asset URLs for a given NASA image ID.
     * Returns URLs sorted: original → large → medium → small → thumb.
     */
    getAssets(nasaId: string): Promise<string[]>;
    /**
     * Convenience: get the highest-quality image URL for a NASA ID.
     * Tries orig → large → medium → small in order.
     */
    getBestImageUrl(nasaId: string): Promise<string | null>;
    /**
     * Astronomy Picture of the Day.
     * @param date  optional ISO date string or Date (defaults to today)
     */
    apod(date?: string | Date): Promise<APODResult>;
    /**
     * Fetch a random selection of recent APOD entries.
     * @param count  number of entries to fetch (default 7)
     */
    recentAPOD(count?: number): Promise<APODResult[]>;
};
export declare const ESA: {
    /**
     * Search the ESA Hubble Space Telescope image archive.
     * Docs: https://esahubble.org/api/v1/
     */
    searchHubble(query: string, limit?: number): Promise<ESAHubbleResult[]>;
};
/**
 * Resolve any object name recognised by CDS Simbad.
 * Returns basic coordinates and type, or null if not found.
 */
export declare function resolveSimbad(objectName: string): Promise<SimbadResult | null>;
