/**
 * Camera database — popular astrophotography cameras.
 *
 * Covers DSLR, mirrorless, and dedicated astronomy cameras from Canon, Nikon,
 * Sony, ZWO, QHY, and others. Sensor dimensions in mm, pixel size in μm.
 *
 * @module
 */
/** A camera body with sensor specifications. */
export interface Camera {
    /** Unique identifier (slugified name). */
    id: string;
    /** Display name. */
    name: string;
    /** Manufacturer. */
    brand: string;
    /** Camera type. */
    type: 'dslr' | 'mirrorless' | 'dedicated' | 'ccd';
    /** Sensor width in mm. */
    sensorWidth: number;
    /** Sensor height in mm. */
    sensorHeight: number;
    /** Pixel size in μm (micrometers). */
    pixelSize: number;
    /** Horizontal pixel count. */
    pixelsX: number;
    /** Vertical pixel count. */
    pixelsY: number;
    /** Whether the IR-cut filter is modified/removed for Ha sensitivity. */
    astroModified?: boolean | undefined;
}
export declare const CAMERAS: readonly Camera[];
