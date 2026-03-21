/**
 * Tier 1 Star Catalog — ~9,110 stars to magnitude 6.5 (naked-eye limit).
 *
 * Source: Based on the HYG Database v3.8 (public domain).
 * Attribution: David Nash, "HYG Stellar Database",
 * https://github.com/astronexus/HYG-Database
 *
 * Data is stored as a compact base64-encoded Float32Array (4 floats per star:
 * ra, dec, mag, bv). Decoded on first call to loadTier1Stars().
 *
 * @module
 */
import type { TierStar } from './index.js';
/**
 * Decode and return the Tier 1 star catalog.
 * Results are cached after first call.
 */
export declare function loadTier1Stars(): TierStar[];
