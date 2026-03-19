import type { EquatorialCoord, ProjectedObject, ProjectionName } from './types.js';
/**
 * Inverse stereographic projection.
 *
 * Converts pixel offsets (relative to canvas centre, with y increasing
 * **upward**) back to equatorial coordinates given the projection centre
 * and scale.
 *
 * @param px     - Horizontal pixel offset from canvas centre.
 * @param py     - Vertical pixel offset from canvas centre (positive = up).
 * @param center - Projection centre in equatorial coordinates.
 * @param scale  - Pixel scale factor (same value passed to the forward projection).
 * @returns The equatorial coordinate, or `null` if the point is at the
 *          antipodal singularity.
 */
export declare function stereographicInverse(px: number, py: number, center: EquatorialCoord, scale: number): EquatorialCoord | null;
/**
 * Inverse gnomonic (tangent-plane) projection.
 *
 * @param px     - Horizontal pixel offset from canvas centre.
 * @param py     - Vertical pixel offset from canvas centre (positive = up).
 * @param center - Projection tangent point in equatorial coordinates.
 * @param scale  - Pixel scale factor.
 * @returns The equatorial coordinate, or `null` if the result is invalid.
 */
export declare function gnomonicInverse(px: number, py: number, center: EquatorialCoord, scale: number): EquatorialCoord | null;
/**
 * Inverse Mollweide (equal-area) projection.
 *
 * Takes **absolute** canvas pixel coordinates (matching the forward
 * projection output) and returns equatorial coordinates.
 *
 * @param canvasX - Absolute x pixel position on the canvas.
 * @param canvasY - Absolute y pixel position on the canvas.
 * @param width   - Canvas width in pixels.
 * @param height  - Canvas height in pixels.
 * @returns The equatorial coordinate, or `null` if the point falls outside
 *          the Mollweide ellipse boundary.
 */
export declare function mollweideInverse(canvasX: number, canvasY: number, width: number, height: number): EquatorialCoord | null;
/**
 * Convert a canvas pixel position to equatorial coordinates.
 *
 * Dispatches to the appropriate inverse projection based on the current
 * projection mode. The `canvasX` / `canvasY` values should be in the
 * **canvas coordinate space** (i.e. after accounting for DPI scaling).
 *
 * @param canvasX    - Pixel x on the canvas.
 * @param canvasY    - Pixel y on the canvas.
 * @param width      - Canvas width in pixels.
 * @param height     - Canvas height in pixels.
 * @param projection - Active projection mode.
 * @param center     - Current view centre (ignored for Mollweide).
 * @param scale      - Current zoom scale factor (ignored for Mollweide).
 * @returns The equatorial coordinate at that pixel, or `null` if outside
 *          the valid projection area.
 */
export declare function canvasToEquatorial(canvasX: number, canvasY: number, width: number, height: number, projection: ProjectionName, center: EquatorialCoord, scale: number): EquatorialCoord | null;
/**
 * Find the nearest projected object within a pixel radius of a given point.
 *
 * @param cache     - Array of projected objects (rebuilt each render frame).
 * @param canvasX   - Pixel x on the canvas.
 * @param canvasY   - Pixel y on the canvas.
 * @param hitRadius - Maximum distance in pixels to consider a match.
 * @returns The closest {@link ProjectedObject}, or `null` if nothing is
 *          within range.
 */
export declare function hitTest(cache: readonly ProjectedObject[], canvasX: number, canvasY: number, hitRadius: number): ProjectedObject | null;
