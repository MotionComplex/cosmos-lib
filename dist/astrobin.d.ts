import type { Camera } from './data/equipment/cameras.js';
import type { Telescope } from './data/equipment/telescopes.js';
/** Raw Astrobin camera result. */
export interface AstrobinCamera {
    /** Astrobin resource URI. */
    id: string;
    /** Brand name. */
    make: string;
    /** Model name. */
    name: string;
    /** Whether it's been modified for astrophotography. */
    modified: boolean;
    /** Camera type on Astrobin. */
    type: string;
}
/** Raw Astrobin telescope result. */
export interface AstrobinTelescope {
    /** Astrobin resource URI. */
    id: string;
    /** Brand name. */
    make: string;
    /** Model name. */
    name: string;
    /** Telescope type on Astrobin. */
    type: string;
    /** Aperture in mm (may be null). */
    aperture: number | null;
    /** Focal length in mm (may be null). */
    min_focal_length: number | null;
    /** Max focal length for zoom scopes (may be null). */
    max_focal_length: number | null;
}
/** Options for Astrobin equipment search. */
export interface AstrobinSearchOptions {
    /** Maximum results to return. @defaultValue `20` */
    limit?: number;
}
/**
 * Astrobin equipment search API.
 *
 * Search the Astrobin community database for cameras, telescopes, and
 * other astrophotography equipment. Results can be converted to cosmos-lib
 * equipment types for use with {@link Equipment.rig}.
 *
 * @remarks
 * Requires an Astrobin API key and secret. Get them at
 * {@link https://www.astrobin.com/api/request-key/}. Without keys,
 * search requests will fail with 401.
 *
 * @example
 * ```ts
 * import { Astrobin } from '@motioncomplex/cosmos-lib'
 *
 * Astrobin.setCredentials('your-api-key', 'your-api-secret')
 *
 * const cameras = await Astrobin.searchCameras('ASI2600')
 * const scopes = await Astrobin.searchTelescopes('Esprit')
 *
 * // Convert to cosmos-lib Camera for use with Equipment.rig()
 * const cam = Astrobin.toCamera(cameras[0], { pixelSize: 3.76, sensorWidth: 23.5, sensorHeight: 15.7 })
 * ```
 */
export declare const Astrobin: {
    /**
     * Set Astrobin API credentials.
     *
     * @param apiKey - Your Astrobin API key.
     * @param apiSecret - Your Astrobin API secret.
     */
    readonly setCredentials: (apiKey: string, apiSecret: string) => void;
    /**
     * Search for cameras on Astrobin.
     *
     * @param query - Search query (brand, model name, etc.).
     * @param options - Search options.
     * @returns Array of matching cameras.
     *
     * @example
     * ```ts
     * const results = await Astrobin.searchCameras('ZWO ASI')
     * results.forEach(c => console.log(c.make, c.name))
     * ```
     */
    readonly searchCameras: (query: string, options?: AstrobinSearchOptions) => Promise<AstrobinCamera[]>;
    /**
     * Search for telescopes on Astrobin.
     *
     * @param query - Search query (brand, model name, etc.).
     * @param options - Search options.
     * @returns Array of matching telescopes.
     *
     * @example
     * ```ts
     * const results = await Astrobin.searchTelescopes('Celestron C8')
     * results.forEach(t => console.log(t.make, t.name, t.aperture))
     * ```
     */
    readonly searchTelescopes: (query: string, options?: AstrobinSearchOptions) => Promise<AstrobinTelescope[]>;
    /**
     * Convert an Astrobin camera result to a cosmos-lib Camera.
     *
     * Astrobin doesn't store sensor dimensions or pixel size, so you must
     * provide them. Use this when you find a camera on Astrobin and want
     * to use it with `Equipment.rig()`.
     *
     * @param astrobinCamera - The Astrobin camera result.
     * @param specs - Sensor specs not available from Astrobin.
     * @returns A Camera object compatible with `Equipment.rig()`.
     *
     * @example
     * ```ts
     * const results = await Astrobin.searchCameras('ASI2600')
     * const cam = Astrobin.toCamera(results[0], {
     *   sensorWidth: 23.5, sensorHeight: 15.7, pixelSize: 3.76, pixelsX: 6248, pixelsY: 4176
     * })
     * const rig = Equipment.rig({ camera: cam, telescope: 'Celestron C8' })
     * ```
     */
    readonly toCamera: (astrobinCamera: AstrobinCamera, specs: {
        sensorWidth: number;
        sensorHeight: number;
        pixelSize: number;
        pixelsX?: number;
        pixelsY?: number;
    }) => Camera;
    /**
     * Convert an Astrobin telescope result to a cosmos-lib Telescope.
     *
     * Astrobin usually provides aperture and focal length.
     *
     * @param astrobinTelescope - The Astrobin telescope result.
     * @param overrides - Override aperture/focal length if Astrobin data is missing.
     * @returns A Telescope object compatible with `Equipment.rig()`.
     *
     * @example
     * ```ts
     * const results = await Astrobin.searchTelescopes('Esprit 100')
     * const scope = Astrobin.toTelescope(results[0])
     * const rig = Equipment.rig({ camera: 'Sony A7 III', telescope: scope })
     * ```
     */
    readonly toTelescope: (astrobinTelescope: AstrobinTelescope, overrides?: {
        aperture?: number;
        focalLength?: number;
    }) => Telescope;
};
