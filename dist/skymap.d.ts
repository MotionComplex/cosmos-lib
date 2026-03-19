import type { EquatorialCoord, ProjectedPoint, SkyMapRenderOptions } from './types.js';
import type { CelestialObject } from './types.js';
/**
 * Stereographic projection centred on `center`.
 *
 * Good for detailed star charts around a specific point. Preserves angles
 * (conformal) but distorts areas away from the centre. Returns offsets in
 * pixels relative to the canvas centre.
 *
 * @param coord  - Equatorial coordinates (RA/Dec in degrees) of the point to project.
 * @param center - Equatorial coordinates of the projection centre.
 * @param scale  - Pixel scale factor applied to the projection. Higher values zoom in.
 *                 Defaults to `500`.
 * @returns A {@link ProjectedPoint} with `x`/`y` offsets from canvas centre and a
 *          `visible` flag (`false` when the point is on the far side of the sphere).
 *
 * @example
 * ```ts
 * import { stereographic } from '@motioncomplex/cosmos-lib'
 *
 * // Project Betelgeuse relative to the centre of Orion
 * const orionCenter = { ra: 83.8, dec: 1.2 }
 * const betelgeuse  = { ra: 88.79, dec: 7.41 }
 * const pt = stereographic(betelgeuse, orionCenter, 600)
 * // pt.x / pt.y are pixel offsets; pt.visible === true
 * ```
 */
export declare function stereographic(coord: EquatorialCoord, center: EquatorialCoord, scale?: number): ProjectedPoint;
/**
 * Mollweide (equal-area) projection.
 *
 * Suited to full-sky maps where preserving relative area is important.
 * Unlike the stereographic and gnomonic projections, this returns
 * **absolute** pixel coordinates rather than offsets from centre.
 * Internally solves the auxiliary angle with Newton-Raphson iteration.
 *
 * @param coord  - Equatorial coordinates (RA/Dec in degrees) of the point to project.
 * @param canvas - Dimensions of the target canvas (`{ width, height }` in pixels).
 * @returns A {@link ProjectedPoint} with absolute `x`/`y` pixel coordinates.
 *          The `visible` flag is always `true` for Mollweide (full-sky coverage).
 *
 * @example
 * ```ts
 * import { mollweide } from '@motioncomplex/cosmos-lib'
 *
 * // Project Polaris onto an 800x400 all-sky canvas
 * const polaris = { ra: 37.95, dec: 89.26 }
 * const pt = mollweide(polaris, { width: 800, height: 400 })
 * ctx.fillRect(pt.x - 2, pt.y - 2, 4, 4)
 * ```
 */
export declare function mollweide(coord: EquatorialCoord, canvas: {
    width: number;
    height: number;
}): ProjectedPoint;
/**
 * Gnomonic (tangent-plane) projection.
 *
 * Minimal distortion near the centre; commonly used for telescope
 * field-of-view charts and narrow-field imaging. Great circles are
 * projected as straight lines, but the usable area is limited to
 * roughly a hemisphere. Returns offsets in pixels relative to the
 * canvas centre.
 *
 * @param coord  - Equatorial coordinates (RA/Dec in degrees) of the point to project.
 * @param center - Equatorial coordinates of the tangent point (projection centre).
 * @param scale  - Pixel scale factor applied to the projection. Defaults to `400`.
 * @returns A {@link ProjectedPoint} with `x`/`y` offsets from canvas centre.
 *          `visible` is `false` when the point falls behind the tangent plane.
 *
 * @example
 * ```ts
 * import { gnomonic } from '@motioncomplex/cosmos-lib'
 *
 * // Project the Orion Nebula (M42) relative to Orion's belt centre
 * const beltCenter = { ra: 84.05, dec: -1.2 }
 * const m42        = { ra: 83.82, dec: -5.39 }
 * const pt = gnomonic(m42, beltCenter, 500)
 * if (pt.visible) {
 *   ctx.arc(cx + pt.x, cy - pt.y, 4, 0, Math.PI * 2)
 * }
 * ```
 */
export declare function gnomonic(coord: EquatorialCoord, center: EquatorialCoord, scale?: number): ProjectedPoint;
/**
 * Render an interactive sky chart onto a `<canvas>` element.
 *
 * Draws a coordinate grid (RA/Dec), constellation stick-figure lines and
 * labels, and all supplied celestial objects -- each rendered with a shape
 * and colour appropriate to its type (star glow, galaxy ellipse, nebula
 * square, cluster circle). Stars brighter than magnitude 3.5 are labelled
 * automatically when `showLabels` is enabled.
 *
 * Supports three projection modes via {@link SkyMapRenderOptions.projection}:
 * `'stereographic'` (default), `'mollweide'`, and `'gnomonic'`.
 *
 * @param canvas  - The target `HTMLCanvasElement` to draw on. Must support a
 *                  2D rendering context.
 * @param objects - Array of {@link CelestialObject} entries to plot (e.g. from
 *                  `Data.all()` or `Data.search()`). Objects with `null` RA/Dec
 *                  or magnitudes above `showMagnitudeLimit` are skipped.
 * @param opts    - Render options controlling projection, grid, labels,
 *                  magnitude limit, colours, and constellation overlays.
 *                  See {@link SkyMapRenderOptions} for defaults.
 * @throws If the canvas does not support a 2D context.
 *
 * @example
 * ```ts
 * import { renderSkyMap } from '@motioncomplex/cosmos-lib'
 * import { Data } from '@motioncomplex/cosmos-lib'
 *
 * const canvas = document.querySelector<HTMLCanvasElement>('#sky')!
 * canvas.width = 1200
 * canvas.height = 800
 *
 * // Render the Orion region with a stereographic projection
 * renderSkyMap(canvas, Data.all(), {
 *   projection: 'stereographic',
 *   center: { ra: 83.8, dec: 1.2 },   // centre of Orion
 *   scale: 400,
 *   showGrid: true,
 *   showLabels: true,
 *   showMagnitudeLimit: 6,
 *   background: '#0a0a18',
 * })
 * ```
 *
 * @example
 * ```ts
 * // Full-sky Mollweide map
 * renderSkyMap(canvas, Data.all(), {
 *   projection: 'mollweide',
 *   showGrid: true,
 *   showLabels: true,
 *   showMagnitudeLimit: 5,
 * })
 * ```
 */
export declare function renderSkyMap(canvas: HTMLCanvasElement, objects: CelestialObject[], opts?: SkyMapRenderOptions): void;
/**
 * Legacy namespace re-exporting all sky-map functions.
 *
 * @deprecated Use the named exports `stereographic`, `mollweide`, `gnomonic`,
 * and `renderSkyMap` directly instead. This object is retained solely for
 * backwards compatibility and will be removed in a future major release.
 *
 * @example
 * ```ts
 * // Before (deprecated)
 * import { SkyMap } from '@motioncomplex/cosmos-lib'
 * SkyMap.render(canvas, objects)
 *
 * // After (preferred)
 * import { renderSkyMap } from '@motioncomplex/cosmos-lib'
 * renderSkyMap(canvas, objects)
 * ```
 */
export declare const SkyMap: {
    stereographic: typeof stereographic;
    mollweide: typeof mollweide;
    gnomonic: typeof gnomonic;
    render: typeof renderSkyMap;
};
