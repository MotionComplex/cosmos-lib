/**
 * Tier 2 Star Catalog — ~120,000 stars to magnitude 9+ (binocular/telescope limit).
 *
 * Source: Based on the HYG Database v3.8 (public domain).
 * Attribution: David Nash, "HYG Stellar Database",
 * https://github.com/astronexus/HYG-Database
 *
 * Data is stored as a compact base64-encoded Float32Array (4 floats per star:
 * ra, dec, mag, bv). This is the binary format option — ~1.9 MB base64,
 * decodes to ~1.9 MB Float32Array.
 *
 * @module
 */
import type { TierStar } from './index.js';
/**
 * Decode and return the Tier 2 star catalog.
 * Results are cached after first call.
 */
export declare function loadTier2Stars(): TierStar[];
