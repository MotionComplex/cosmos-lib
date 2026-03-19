import type { EquatorialCoord, ProjectedPoint, SkyMapRenderOptions } from './types.js';
import type { CelestialObject } from './types.js';
/**
 * Stereographic projection centred on `center`.
 * Good for detailed star charts around a specific point.
 * Returns offsets in pixels relative to the canvas center.
 */
export declare function stereographic(coord: EquatorialCoord, center: EquatorialCoord, scale?: number): ProjectedPoint;
/**
 * Mollweide (equal-area) projection.
 * Suited to all-sky maps.
 * Returns absolute pixel coordinates for a canvas of the given dimensions.
 */
export declare function mollweide(coord: EquatorialCoord, canvas: {
    width: number;
    height: number;
}): ProjectedPoint;
/**
 * Gnomonic (tangent-plane) projection.
 * Minimal distortion near the center; used for telescope FOV charts.
 * Returns offsets in pixels relative to the canvas center.
 */
export declare function gnomonic(coord: EquatorialCoord, center: EquatorialCoord, scale?: number): ProjectedPoint;
/**
 * Render a sky chart onto a canvas element.
 *
 * @param canvas   target HTMLCanvasElement
 * @param objects  array of CelestialObject (from Data.all() or Data.search())
 * @param opts     render options
 */
export declare function renderSkyMap(canvas: HTMLCanvasElement, objects: CelestialObject[], opts?: SkyMapRenderOptions): void;
/** @deprecated Use named exports instead. Kept for backwards compatibility. */
export declare const SkyMap: {
    stereographic: typeof stereographic;
    mollweide: typeof mollweide;
    gnomonic: typeof gnomonic;
    render: typeof renderSkyMap;
};
