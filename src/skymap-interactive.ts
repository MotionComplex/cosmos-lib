import { CONSTANTS } from './constants.js'
import { AstroMath } from './math.js'
import {
  renderSkyMap,
  stereographic,
  mollweide,
  gnomonic,
  spectralColor,
} from './skymap.js'
import { canvasToEquatorial, hitTest } from './skymap-hittest.js'
import type {
  CelestialObject,
  EquatorialCoord,
  InteractiveSkyMapOptions,
  ObserverParams,
  FOVOverlayOptions,
  HUDOptions,
  ProjectedObject,
  ProjectedPoint,
  ProjectionName,
  SkyMapEventMap,
  SkyMapViewState,
} from './types.js'

const D = CONSTANTS.DEG_TO_RAD

// ── Pointer state ────────────────────────────────────────────────────────────

interface PointerInfo {
  startX: number
  startY: number
  lastX: number
  lastY: number
  startTime: number
}

const TAP_MAX_MS = 250
const TAP_MAX_PX = 10

// ── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS = {
  panEnabled: true,
  zoomEnabled: true,
  selectEnabled: true,
  hoverEnabled: true,
  minScale: 50,
  maxScale: 5000,
  hitRadius: 15,
  realTimeInterval: 1000,
} as const

// ── Class ────────────────────────────────────────────────────────────────────

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
export class InteractiveSkyMap {
  private _canvas: HTMLCanvasElement
  private _ctx: CanvasRenderingContext2D
  private _objects: CelestialObject[]
  private _opts: InteractiveSkyMapOptions
  private _view: SkyMapViewState

  private _projectedCache: ProjectedObject[] = []
  private _selectedObject: CelestialObject | null = null
  private _hoveredObject: CelestialObject | null = null

  private _listeners = new Map<string, Set<Function>>()
  private _rafId: number | null = null
  private _dirty = false
  private _realTimeTimer: ReturnType<typeof setTimeout> | null = null
  private _pointers = new Map<number, PointerInfo>()
  private _abortController: AbortController
  private _disposed = false
  private _panAnimId: number | null = null

  constructor(
    canvas: HTMLCanvasElement,
    objects: CelestialObject[],
    opts: InteractiveSkyMapOptions = {},
  ) {
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas 2D context not available')

    this._canvas = canvas
    this._ctx = ctx
    this._objects = objects
    this._opts = opts

    this._view = {
      center: { ra: opts.center?.ra ?? 0, dec: opts.center?.dec ?? 0 },
      scale: opts.scale ?? 300,
      projection: opts.projection ?? 'stereographic',
    }

    // Register DOM events via AbortController for clean disposal
    this._abortController = new AbortController()
    const signal = this._abortController.signal

    canvas.addEventListener('pointerdown', this._onPointerDown, { signal })
    canvas.addEventListener('pointermove', this._onPointerMove, { signal })
    canvas.addEventListener('pointerup', this._onPointerUp, { signal })
    canvas.addEventListener('pointercancel', this._onPointerUp, { signal })
    canvas.addEventListener('wheel', this._onWheel, { passive: false, signal })

    // Prevent default touch actions (scrolling) on the canvas
    canvas.style.touchAction = 'none'

    // Auto-start real-time mode if configured
    if (opts.realTime) {
      this.startRealTime(opts.observer)
    }

    // Initial render
    this.render()
  }

  // ── Event emitter ────────────────────────────────────────────────────────

  /**
   * Subscribe to an interaction event.
   *
   * @param event   - Event name (`'select'`, `'hover'`, or `'viewchange'`).
   * @param handler - Callback invoked when the event fires.
   */
  on<K extends keyof SkyMapEventMap>(
    event: K,
    handler: (data: SkyMapEventMap[K]) => void,
  ): void {
    if (!this._listeners.has(event)) this._listeners.set(event, new Set())
    this._listeners.get(event)!.add(handler)
  }

  /**
   * Unsubscribe from an interaction event.
   */
  off<K extends keyof SkyMapEventMap>(
    event: K,
    handler: (data: SkyMapEventMap[K]) => void,
  ): void {
    this._listeners.get(event)?.delete(handler)
  }

  private _emit<K extends keyof SkyMapEventMap>(event: K, data: SkyMapEventMap[K]): void {
    const handlers = this._listeners.get(event)
    if (!handlers) return
    for (const fn of handlers) (fn as (d: SkyMapEventMap[K]) => void)(data)
  }

  // ── View ─────────────────────────────────────────────────────────────────

  /** Get the current view state. */
  getView(): Readonly<SkyMapViewState> {
    return { ...this._view }
  }

  /**
   * Programmatically set the view centre, scale, and/or projection.
   * Triggers a re-render and emits `'viewchange'`.
   */
  setView(view: Partial<SkyMapViewState>): void {
    if (view.center) this._view.center = { ...view.center }
    if (view.scale !== undefined) this._view.scale = this._clampScale(view.scale)
    if (view.projection) this._view.projection = view.projection
    this._markDirty()
    this._emitViewChange()
  }

  /**
   * Animate the view to a new centre and/or scale.
   *
   * @param center     - Target centre in equatorial coordinates.
   * @param opts.scale - Target scale (optional, defaults to current).
   * @param opts.durationMs - Animation duration in ms (default 800).
   */
  panTo(
    center: EquatorialCoord,
    opts: { scale?: number; durationMs?: number } = {},
  ): void {
    // Cancel any running panTo animation
    if (this._panAnimId !== null) {
      cancelAnimationFrame(this._panAnimId)
      this._panAnimId = null
    }

    const { scale: targetScale, durationMs = 800 } = opts
    const fromCenter = { ...this._view.center }
    const fromScale = this._view.scale
    const toScale = targetScale !== undefined ? this._clampScale(targetScale) : fromScale
    const start = performance.now()

    // Compute shortest RA arc
    let dRA = center.ra - fromCenter.ra
    if (dRA > 180) dRA -= 360
    if (dRA < -180) dRA += 360

    const tick = (now: number): void => {
      if (this._disposed) return
      const t = Math.min((now - start) / durationMs, 1)
      // Ease-in-out quadratic
      const ease = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2

      this._view.center = {
        ra: ((fromCenter.ra + dRA * ease) % 360 + 360) % 360,
        dec: fromCenter.dec + (center.dec - fromCenter.dec) * ease,
      }
      this._view.scale = fromScale + (toScale - fromScale) * ease

      this.render()

      if (t < 1) {
        this._panAnimId = requestAnimationFrame(tick)
      } else {
        this._panAnimId = null
        this._emitViewChange()
      }
    }
    this._panAnimId = requestAnimationFrame(tick)
  }

  // ── Selection / hover ────────────────────────────────────────────────────

  /** The currently selected object, or `null`. */
  get selectedObject(): CelestialObject | null {
    return this._selectedObject
  }

  /** The currently hovered object, or `null`. */
  get hoveredObject(): CelestialObject | null {
    return this._hoveredObject
  }

  /**
   * Programmatically select an object by its `id`. Pass `null` to clear.
   */
  select(objectId: string | null): void {
    if (objectId === null) {
      this._selectedObject = null
    } else {
      this._selectedObject = this._objects.find(o => o.id === objectId) ?? null
    }
    this._markDirty()
  }

  /**
   * Return the celestial object at a given canvas pixel position, or `null`.
   */
  objectAt(canvasX: number, canvasY: number): CelestialObject | null {
    const hr = this._opts.hitRadius ?? DEFAULTS.hitRadius
    const po = hitTest(this._projectedCache, canvasX, canvasY, hr)
    return po?.object ?? null
  }

  // ── Data ─────────────────────────────────────────────────────────────────

  /** Replace the objects array and re-render. */
  setObjects(objects: CelestialObject[]): void {
    this._objects = objects
    this._markDirty()
  }

  /** Merge new options and re-render. */
  setOptions(opts: Partial<InteractiveSkyMapOptions>): void {
    this._opts = { ...this._opts, ...opts }
    if (opts.center) this._view.center = { ...opts.center }
    if (opts.scale !== undefined) this._view.scale = this._clampScale(opts.scale)
    if (opts.projection) this._view.projection = opts.projection
    this._markDirty()
  }

  // ── FOV ──────────────────────────────────────────────────────────────────

  /** Set or clear the FOV indicator overlay(s). */
  setFOV(fov: FOVOverlayOptions | FOVOverlayOptions[] | null): void {
    if (fov === null) {
      delete this._opts.fov
    } else {
      this._opts.fov = fov
    }
    this._markDirty()
  }

  // ── Real-time mode ───────────────────────────────────────────────────────

  /**
   * Start real-time sidereal tracking. The view centre follows the local
   * sidereal time so the sky drifts naturally.
   *
   * @param observer - Observer parameters. If omitted, uses the value from
   *                   {@link InteractiveSkyMapOptions.observer}.
   * @throws If no observer parameters are available.
   */
  startRealTime(observer?: ObserverParams): void {
    if (observer) this._opts.observer = observer
    if (!this._opts.observer) {
      throw new Error('Observer parameters required for real-time mode')
    }
    this.stopRealTime()
    this._realTimeLoop()
  }

  /** Stop real-time sidereal tracking. */
  stopRealTime(): void {
    if (this._realTimeTimer !== null) {
      clearTimeout(this._realTimeTimer)
      this._realTimeTimer = null
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  /**
   * Force an immediate re-render. Normally renders happen automatically
   * via the dirty-flag mechanism; call this only if you need a synchronous
   * update.
   */
  render(): void {
    if (this._disposed) return

    const canvas = this._canvas
    const ctx = this._ctx
    const W = canvas.width
    const H = canvas.height

    // 1. Base layer: delegate to the existing stateless renderer
    renderSkyMap(canvas, this._objects, {
      ...this._opts,
      center: this._view.center,
      scale: this._view.scale,
      projection: this._view.projection,
    })

    // 2. Rebuild projected object cache
    this._rebuildProjectedCache()

    // 3. Hover highlight
    if (this._hoveredObject) {
      this._drawHighlight(ctx, this._hoveredObject, 'hover', W, H)
    }

    // 4. Selection highlight
    if (this._selectedObject) {
      this._drawHighlight(ctx, this._selectedObject, 'select', W, H)
    }

    // 5. FOV overlay
    if (this._opts.fov) {
      this._drawFOV(ctx, W, H)
    }

    // 6. HUD
    if (this._opts.hud) {
      this._drawHUD(ctx, W, H)
    }

    this._dirty = false
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  /**
   * Remove all event listeners, cancel animations, and release resources.
   * The instance should not be used after calling `dispose()`.
   */
  dispose(): void {
    this._disposed = true
    this._abortController.abort()
    this.stopRealTime()
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId)
      this._rafId = null
    }
    if (this._panAnimId !== null) {
      cancelAnimationFrame(this._panAnimId)
      this._panAnimId = null
    }
    this._listeners.clear()
    this._projectedCache = []
    this._pointers.clear()
  }

  // ── Pointer handling (private) ───────────────────────────────────────────

  /** Convert a pointer event to canvas-space coordinates (DPI-aware). */
  private _canvasCoords(e: PointerEvent | WheelEvent): { x: number; y: number } {
    const rect = this._canvas.getBoundingClientRect()
    const scaleX = this._canvas.width / rect.width
    const scaleY = this._canvas.height / rect.height
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }

  private _onPointerDown = (e: PointerEvent): void => {
    if (this._disposed) return
    this._canvas.setPointerCapture(e.pointerId)
    const { x, y } = this._canvasCoords(e)
    this._pointers.set(e.pointerId, {
      startX: x,
      startY: y,
      lastX: x,
      lastY: y,
      startTime: performance.now(),
    })
  }

  private _onPointerMove = (e: PointerEvent): void => {
    if (this._disposed) return
    const { x, y } = this._canvasCoords(e)

    const info = this._pointers.get(e.pointerId)

    // ── Dragging ───────────────────────────────────────────────────────
    if (info && this._pointers.size === 1 && (this._opts.panEnabled ?? DEFAULTS.panEnabled)) {
      const dx = x - info.lastX
      const dy = y - info.lastY
      info.lastX = x
      info.lastY = y

      // Convert pixel delta to RA/Dec delta
      // For stereographic/gnomonic: Δcoord ≈ Δpx / scale (in radians)
      // For mollweide: use inverse projection difference
      if (this._view.projection === 'mollweide') {
        const W = this._canvas.width
        const H = this._canvas.height
        const before = canvasToEquatorial(x - dx, y - dy, W, H, 'mollweide', this._view.center, this._view.scale)
        const after = canvasToEquatorial(x, y, W, H, 'mollweide', this._view.center, this._view.scale)
        if (before && after) {
          let dRA = before.ra - after.ra
          if (dRA > 180) dRA -= 360
          if (dRA < -180) dRA += 360
          this._view.center = {
            ra: ((this._view.center.ra + dRA) % 360 + 360) % 360,
            dec: Math.max(-90, Math.min(90, this._view.center.dec + (before.dec - after.dec))),
          }
          this._markDirty()
          this._emitViewChange()
        }
      } else {
        // Direct pixel-to-radian conversion
        const dRA = (dx / this._view.scale) / D  // negative because dragging right moves view left
        const dDec = (dy / this._view.scale) / D
        this._view.center = {
          ra: ((this._view.center.ra - dRA) % 360 + 360) % 360,
          dec: Math.max(-90, Math.min(90, this._view.center.dec + dDec)),
        }
        this._markDirty()
        this._emitViewChange()
      }
      return
    }

    // ── Pinch zoom ─────────────────────────────────────────────────────
    if (info && this._pointers.size === 2 && (this._opts.zoomEnabled ?? DEFAULTS.zoomEnabled)) {
      info.lastX = x
      info.lastY = y

      const ids = [...this._pointers.keys()]
      const p1 = this._pointers.get(ids[0]!)!
      const p2 = this._pointers.get(ids[1]!)!

      const curDist = Math.hypot(p1.lastX - p2.lastX, p1.lastY - p2.lastY)
      const prevDist = Math.hypot(
        (ids[0] === e.pointerId ? x - (x - info.lastX + (info.lastX - p1.lastX)) : p1.lastX) - p2.lastX,
        (ids[0] === e.pointerId ? y - (y - info.lastY + (info.lastY - p1.lastY)) : p1.lastY) - p2.lastY,
      )

      if (prevDist > 0) {
        const ratio = curDist / prevDist
        this._view.scale = this._clampScale(this._view.scale * ratio)
        this._markDirty()
        this._emitViewChange()
      }
      return
    }

    // ── Hover (no buttons pressed) ─────────────────────────────────────
    if (this._pointers.size === 0 && (this._opts.hoverEnabled ?? DEFAULTS.hoverEnabled)) {
      const hr = this._opts.hitRadius ?? DEFAULTS.hitRadius
      const po = hitTest(this._projectedCache, x, y, hr)
      const newHovered = po?.object ?? null

      if (newHovered !== this._hoveredObject) {
        this._hoveredObject = newHovered
        this._markDirty()
        this._emit('hover', {
          object: newHovered,
          point: po ? { x: po.x, y: po.y, visible: true } : null,
          event: e,
        })
      }
    }
  }

  private _onPointerUp = (e: PointerEvent): void => {
    if (this._disposed) return
    const info = this._pointers.get(e.pointerId)
    this._pointers.delete(e.pointerId)

    if (!info) return

    // Tap detection
    const elapsed = performance.now() - info.startTime
    const dist = Math.hypot(info.lastX - info.startX, info.lastY - info.startY)

    if (
      elapsed < TAP_MAX_MS &&
      dist < TAP_MAX_PX &&
      (this._opts.selectEnabled ?? DEFAULTS.selectEnabled)
    ) {
      const hr = this._opts.hitRadius ?? DEFAULTS.hitRadius
      const po = hitTest(this._projectedCache, info.lastX, info.lastY, hr)

      if (po) {
        this._selectedObject = po.object
        this._markDirty()
        this._emit('select', {
          object: po.object,
          point: { x: po.x, y: po.y, visible: true },
          event: e,
        })
      } else {
        // Tap on empty space clears selection
        if (this._selectedObject) {
          this._selectedObject = null
          this._markDirty()
        }
      }
    }
  }

  private _onWheel = (e: WheelEvent): void => {
    if (this._disposed) return
    if (!(this._opts.zoomEnabled ?? DEFAULTS.zoomEnabled)) return

    e.preventDefault()

    const factor = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = this._clampScale(this._view.scale * factor)
    if (newScale !== this._view.scale) {
      this._view.scale = newScale
      this._markDirty()
      this._emitViewChange()
    }
  }

  // ── Rendering helpers (private) ──────────────────────────────────────────

  private _markDirty(): void {
    if (this._dirty || this._disposed) return
    this._dirty = true
    this._rafId = requestAnimationFrame(() => {
      this._rafId = null
      if (this._dirty && !this._disposed) this.render()
    })
  }

  private _clampScale(s: number): number {
    const min = this._opts.minScale ?? DEFAULTS.minScale
    const max = this._opts.maxScale ?? DEFAULTS.maxScale
    return Math.max(min, Math.min(max, s))
  }

  private _emitViewChange(): void {
    this._emit('viewchange', {
      center: { ...this._view.center },
      scale: this._view.scale,
      projection: this._view.projection,
    })
  }

  /**
   * Unified forward-project helper (same logic as renderSkyMap's internal
   * `project` function) returning absolute canvas coordinates.
   */
  private _project(coord: EquatorialCoord): ProjectedPoint {
    const W = this._canvas.width
    const H = this._canvas.height

    if (this._view.projection === 'mollweide') {
      return mollweide(coord, { width: W, height: H })
    }
    const pt =
      this._view.projection === 'gnomonic'
        ? gnomonic(coord, this._view.center, this._view.scale)
        : stereographic(coord, this._view.center, this._view.scale)
    return { x: W / 2 + pt.x, y: H / 2 - pt.y, visible: pt.visible }
  }

  /** Rebuild the projected-object cache used for hit-testing and highlights. */
  private _rebuildProjectedCache(): void {
    const magLimit = this._opts.showMagnitudeLimit ?? 8
    const W = this._canvas.width
    const H = this._canvas.height
    const cache: ProjectedObject[] = []

    for (const obj of this._objects) {
      if (obj.ra === null || obj.dec === null) continue
      if (obj.magnitude !== null && obj.magnitude > magLimit) continue

      const p = this._project({ ra: obj.ra, dec: obj.dec })
      if (!p.visible) continue
      if (p.x < -50 || p.x > W + 50 || p.y < -50 || p.y > H + 50) continue

      const mag = obj.magnitude ?? 5
      const size = Math.max(1.5, Math.min(10, (6 - mag) * 0.9 + 1.5))

      cache.push({ object: obj, x: p.x, y: p.y, radius: size * 2.5 })
    }

    this._projectedCache = cache
  }

  /** Draw a highlight ring around a specific object. */
  private _drawHighlight(
    ctx: CanvasRenderingContext2D,
    obj: CelestialObject,
    mode: 'hover' | 'select',
    _W: number,
    _H: number,
  ): void {
    // Find the object in the projected cache
    const po = this._projectedCache.find(p => p.object === obj)
    if (!po) return

    const highlightOpts =
      mode === 'hover' ? this._opts.hoverHighlight : this._opts.selectHighlight

    const color =
      highlightOpts?.color ??
      (mode === 'hover' ? 'rgba(255,255,255,0.6)' : 'rgba(100,200,255,0.8)')
    const radius = highlightOpts?.radius ?? (mode === 'hover' ? 20 : 24)

    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = mode === 'hover' ? 1.5 : 2
    ctx.beginPath()
    ctx.arc(po.x, po.y, radius, 0, Math.PI * 2)
    ctx.stroke()

    // Show label on hover
    if (
      mode === 'hover' &&
      (this._opts.hoverHighlight?.showLabel ?? true)
    ) {
      const labelColor = this._opts.labelColor ?? 'rgba(255,255,255,0.9)'
      ctx.fillStyle = labelColor
      ctx.font = '13px sans-serif'
      ctx.textAlign = 'left'

      const name = obj.name
      const mag = obj.magnitude !== null ? ` (${obj.magnitude.toFixed(1)})` : ''
      ctx.fillText(name + mag, po.x + radius + 6, po.y - 4)

      ctx.textAlign = 'left' // reset
    }

    ctx.restore()
  }

  /** Draw FOV indicator overlay(s). */
  private _drawFOV(ctx: CanvasRenderingContext2D, _W: number, _H: number): void {
    const fovList = Array.isArray(this._opts.fov)
      ? this._opts.fov
      : this._opts.fov
        ? [this._opts.fov]
        : []

    for (const fov of fovList) {
      if (!fov) continue
      const center = fov.center ?? this._view.center
      const color = fov.color ?? 'rgba(255,255,100,0.6)'
      const lineWidth = fov.lineWidth ?? 1.5

      ctx.save()
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.setLineDash([6, 4])
      ctx.beginPath()

      const STEPS = 72
      let started = false
      for (let i = 0; i <= STEPS; i++) {
        const angle = (i / STEPS) * 2 * Math.PI
        const dec = center.dec + fov.radiusDeg * Math.sin(angle)
        const cosDec = Math.cos(center.dec * D)
        const ra =
          center.ra +
          (cosDec > 1e-6 ? (fov.radiusDeg * Math.cos(angle)) / cosDec : 0)

        const p = this._project({ ra, dec: Math.max(-90, Math.min(90, dec)) })
        if (!p.visible) {
          started = false
          continue
        }
        if (!started) {
          ctx.moveTo(p.x, p.y)
          started = true
        } else {
          ctx.lineTo(p.x, p.y)
        }
      }
      ctx.stroke()
      ctx.setLineDash([])

      // Label
      if (fov.label) {
        const labelP = this._project({
          ra: center.ra,
          dec: Math.max(-90, Math.min(90, center.dec + fov.radiusDeg)),
        })
        if (labelP.visible) {
          ctx.fillStyle = color
          ctx.font = '11px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(fov.label, labelP.x, labelP.y - 6)
          ctx.textAlign = 'left'
        }
      }

      ctx.restore()
    }
  }

  /** Draw HUD elements (cardinal labels, horizon line, zenith marker). */
  private _drawHUD(
    ctx: CanvasRenderingContext2D,
    W: number,
    H: number,
  ): void {
    const hud = this._opts.hud!
    const color = hud.color ?? 'rgba(255,255,255,0.5)'
    const observer = hud.observer ?? this._opts.observer

    ctx.save()
    ctx.fillStyle = color
    ctx.strokeStyle = color
    ctx.font = '14px sans-serif'

    // Cardinal directions — placed at the map edges
    if (hud.cardinalDirections) {
      ctx.textAlign = 'center'
      ctx.fillText('N', W / 2, 18)
      ctx.fillText('S', W / 2, H - 6)

      ctx.textAlign = 'left'
      ctx.fillText('E', 6, H / 2 + 5)

      ctx.textAlign = 'right'
      ctx.fillText('W', W - 6, H / 2 + 5)

      ctx.textAlign = 'left'
    }

    // Horizon line and zenith require an observer
    if (observer) {
      const obs = { ...observer, date: observer.date ?? new Date() }

      // Horizon line (alt=0 across all azimuths)
      if (hud.horizonLine) {
        ctx.strokeStyle = hud.color ?? 'rgba(0,200,100,0.4)'
        ctx.lineWidth = 1
        ctx.setLineDash([4, 4])
        ctx.beginPath()

        let started = false
        for (let az = 0; az <= 360; az += 2) {
          const eq = AstroMath.horizontalToEquatorial({ alt: 0, az }, obs)
          const p = this._project(eq)
          if (!p.visible) {
            started = false
            continue
          }
          if (!started) {
            ctx.moveTo(p.x, p.y)
            started = true
          } else {
            ctx.lineTo(p.x, p.y)
          }
        }
        ctx.stroke()
        ctx.setLineDash([])
      }

      // Zenith marker (alt=90)
      if (hud.zenithMarker) {
        const zenith = AstroMath.horizontalToEquatorial({ alt: 90, az: 0 }, obs)
        const p = this._project(zenith)
        if (p.visible) {
          ctx.strokeStyle = hud.color ?? 'rgba(255,255,255,0.5)'
          ctx.lineWidth = 1.5
          const r = 8
          ctx.beginPath()
          ctx.moveTo(p.x - r, p.y)
          ctx.lineTo(p.x + r, p.y)
          ctx.moveTo(p.x, p.y - r)
          ctx.lineTo(p.x, p.y + r)
          ctx.stroke()

          ctx.fillStyle = color
          ctx.font = '11px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('Z', p.x, p.y - r - 4)
          ctx.textAlign = 'left'
        }
      }
    }

    ctx.restore()
  }

  // ── Real-time internals ──────────────────────────────────────────────────

  private _realTimeLoop(): void {
    if (this._disposed) return
    const obs = this._opts.observer
    if (!obs) return

    const now = new Date()
    const lst = AstroMath.lst(now, obs.lng)

    this._view.center = { ra: lst, dec: obs.lat }
    this._markDirty()
    this._emitViewChange()

    this._realTimeTimer = setTimeout(
      () => this._realTimeLoop(),
      this._opts.realTimeInterval ?? DEFAULTS.realTimeInterval,
    )
  }
}

// ── Factory ──────────────────────────────────────────────────────────────────

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
export function createInteractiveSkyMap(
  canvas: HTMLCanvasElement,
  objects: CelestialObject[],
  opts?: InteractiveSkyMapOptions,
): InteractiveSkyMap {
  return new InteractiveSkyMap(canvas, objects, opts)
}
