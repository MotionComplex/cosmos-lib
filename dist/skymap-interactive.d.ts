import type { CelestialObject, EquatorialCoord, InteractiveSkyMapOptions, ObserverParams, FOVOverlayOptions, SkyMapEventMap, SkyMapViewState } from './types.js';
/**
 * Interactive sky map that wraps a `<canvas>` element with pan, zoom,
 * click-to-identify, hover detection, FOV overlays, a configurable HUD,
 * and optional real-time sidereal tracking.
 *
 * Renders via the existing {@link renderSkyMap} for the base layer, then
 * overlays interactive highlights and HUD elements on top.
 *
 * @example
 * ```ts
 * import { createInteractiveSkyMap, Data } from '@motioncomplex/cosmos-lib'
 *
 * const skymap = createInteractiveSkyMap(canvas, Data.all(), {
 *   projection: 'stereographic',
 *   center: { ra: 83.8, dec: -5.4 },
 *   scale: 400,
 *   panEnabled: true,
 *   zoomEnabled: true,
 *   fov: { radiusDeg: 5, label: 'Telescope' },
 * })
 *
 * skymap.on('select', ({ object }) => console.log(object.name))
 * skymap.on('viewchange', ({ center, scale }) => updateURL(center, scale))
 *
 * // Later:
 * skymap.dispose()
 * ```
 */
export declare class InteractiveSkyMap {
    private _canvas;
    private _ctx;
    private _objects;
    private _opts;
    private _view;
    private _projectedCache;
    private _selectedObject;
    private _hoveredObject;
    private _listeners;
    private _rafId;
    private _dirty;
    private _realTimeTimer;
    private _pointers;
    private _abortController;
    private _disposed;
    private _panAnimId;
    constructor(canvas: HTMLCanvasElement, objects: CelestialObject[], opts?: InteractiveSkyMapOptions);
    /**
     * Subscribe to an interaction event.
     *
     * @param event   - Event name (`'select'`, `'hover'`, or `'viewchange'`).
     * @param handler - Callback invoked when the event fires.
     */
    on<K extends keyof SkyMapEventMap>(event: K, handler: (data: SkyMapEventMap[K]) => void): void;
    /**
     * Unsubscribe from an interaction event.
     */
    off<K extends keyof SkyMapEventMap>(event: K, handler: (data: SkyMapEventMap[K]) => void): void;
    private _emit;
    /** Get the current view state. */
    getView(): Readonly<SkyMapViewState>;
    /**
     * Programmatically set the view centre, scale, and/or projection.
     * Triggers a re-render and emits `'viewchange'`.
     */
    setView(view: Partial<SkyMapViewState>): void;
    /**
     * Animate the view to a new centre and/or scale.
     *
     * @param center     - Target centre in equatorial coordinates.
     * @param opts.scale - Target scale (optional, defaults to current).
     * @param opts.durationMs - Animation duration in ms (default 800).
     */
    panTo(center: EquatorialCoord, opts?: {
        scale?: number;
        durationMs?: number;
    }): void;
    /** The currently selected object, or `null`. */
    get selectedObject(): CelestialObject | null;
    /** The currently hovered object, or `null`. */
    get hoveredObject(): CelestialObject | null;
    /**
     * Programmatically select an object by its `id`. Pass `null` to clear.
     */
    select(objectId: string | null): void;
    /**
     * Return the celestial object at a given canvas pixel position, or `null`.
     */
    objectAt(canvasX: number, canvasY: number): CelestialObject | null;
    /** Replace the objects array and re-render. */
    setObjects(objects: CelestialObject[]): void;
    /** Merge new options and re-render. */
    setOptions(opts: Partial<InteractiveSkyMapOptions>): void;
    /** Set or clear the FOV indicator overlay(s). */
    setFOV(fov: FOVOverlayOptions | FOVOverlayOptions[] | null): void;
    /**
     * Start real-time sidereal tracking. The view centre follows the local
     * sidereal time so the sky drifts naturally.
     *
     * @param observer - Observer parameters. If omitted, uses the value from
     *                   {@link InteractiveSkyMapOptions.observer}.
     * @throws If no observer parameters are available.
     */
    startRealTime(observer?: ObserverParams): void;
    /** Stop real-time sidereal tracking. */
    stopRealTime(): void;
    /**
     * Force an immediate re-render. Normally renders happen automatically
     * via the dirty-flag mechanism; call this only if you need a synchronous
     * update.
     */
    render(): void;
    /**
     * Remove all event listeners, cancel animations, and release resources.
     * The instance should not be used after calling `dispose()`.
     */
    dispose(): void;
    /** Convert a pointer event to canvas-space coordinates (DPI-aware). */
    private _canvasCoords;
    private _onPointerDown;
    private _onPointerMove;
    private _onPointerUp;
    private _onWheel;
    private _markDirty;
    private _clampScale;
    private _emitViewChange;
    /**
     * Unified forward-project helper (same logic as renderSkyMap's internal
     * `project` function) returning absolute canvas coordinates.
     */
    private _project;
    /** Rebuild the projected-object cache used for hit-testing and highlights. */
    private _rebuildProjectedCache;
    /** Draw a highlight ring around a specific object. */
    private _drawHighlight;
    /** Draw FOV indicator overlay(s). */
    private _drawFOV;
    /** Draw HUD elements (cardinal labels, horizon line, zenith marker). */
    private _drawHUD;
    private _realTimeLoop;
}
/**
 * Create an {@link InteractiveSkyMap} on the given canvas.
 *
 * This is a convenience wrapper around the class constructor for consumers
 * who prefer a functional style.
 *
 * @param canvas  - Target `<canvas>` element.
 * @param objects - Celestial objects to render (e.g. `Data.all()`).
 * @param opts    - Interactive sky map options.
 * @returns A new {@link InteractiveSkyMap} instance.
 */
export declare function createInteractiveSkyMap(canvas: HTMLCanvasElement, objects: CelestialObject[], opts?: InteractiveSkyMapOptions): InteractiveSkyMap;
