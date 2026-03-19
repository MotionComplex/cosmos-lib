import { CONSTANTS } from './constants.js'
import type {
  EquatorialCoord,
  ProjectedPoint,
  SkyMapRenderOptions,
} from './types.js'
import type { CelestialObject } from './types.js'

const D = CONSTANTS.DEG_TO_RAD

// ── Projections ───────────────────────────────────────────────────────────────

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
export function stereographic(
  coord: EquatorialCoord,
  center: EquatorialCoord,
  scale = 500,
): ProjectedPoint {
  const ra1 = center.ra * D, dec1 = center.dec * D
  const ra2  = coord.ra  * D, dec2  = coord.dec  * D
  const dra  = ra2 - ra1

  const cosC = Math.sin(dec1) * Math.sin(dec2) +
               Math.cos(dec1) * Math.cos(dec2) * Math.cos(dra)
  const k    = 2 / (1 + cosC)

  return {
    x:       k * Math.cos(dec2) * Math.sin(dra) * scale,
    y:       k * (Math.cos(dec1) * Math.sin(dec2) -
                  Math.sin(dec1) * Math.cos(dec2) * Math.cos(dra)) * scale,
    visible: cosC > -0.95,
  }
}

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
export function mollweide(
  coord: EquatorialCoord,
  canvas: { width: number; height: number },
): ProjectedPoint {
  const { width: W, height: H } = canvas

  const lambda = (coord.ra - 180) * D
  const phi    = coord.dec * D

  // Newton-Raphson to solve 2θ + sin(2θ) = π·sin(φ)
  let theta = phi
  for (let i = 0; i < 10; i++) {
    const denom = 4 * Math.cos(theta) ** 2 + 2
    if (Math.abs(denom) < 1e-9) break
    theta -= (2 * theta + Math.sin(2 * theta) - Math.PI * Math.sin(phi)) / denom
  }

  const x = W / 2 + (W / (2 * Math.PI)) * (2 * Math.SQRT2 / Math.PI) * lambda * Math.cos(theta)
  const y = H / 2 - (H / 2) * Math.SQRT2 * Math.sin(theta)

  return { x, y, visible: true }
}

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
export function gnomonic(
  coord: EquatorialCoord,
  center: EquatorialCoord,
  scale = 400,
): ProjectedPoint {
  const ra1 = center.ra * D, dec1 = center.dec * D
  const ra2  = coord.ra  * D, dec2  = coord.dec  * D
  const dra  = ra2 - ra1

  const cosD = Math.sin(dec1) * Math.sin(dec2) +
               Math.cos(dec1) * Math.cos(dec2) * Math.cos(dra)
  if (cosD <= 0) return { x: 0, y: 0, visible: false }

  return {
    x:       scale * Math.cos(dec2) * Math.sin(dra) / cosD,
    y:       scale * (Math.cos(dec1) * Math.sin(dec2) -
                      Math.sin(dec1) * Math.cos(dec2) * Math.cos(dra)) / cosD,
    visible: cosD > 0,
  }
}

// ── Canvas renderer ───────────────────────────────────────────────────────────

/**
 * Map a {@link CelestialObject} to a CSS colour string based on its spectral
 * class (for stars) or object type (nebula, galaxy, cluster, black hole).
 *
 * @internal Not part of the public API -- used by {@link renderSkyMap}.
 * @param obj - The celestial object to colour.
 * @returns A CSS hex colour string (e.g. `'#9bb0ff'` for an O-type star).
 */
export function spectralColor(obj: CelestialObject): string {
  if (obj.type === 'nebula')      return '#ff7744'
  if (obj.type === 'galaxy')      return '#ffddaa'
  if (obj.type === 'cluster')     return '#aaccff'
  if (obj.type === 'black-hole')  return '#ff4400'

  const sp = obj.spectral?.[0]
  const MAP: Record<string, string> = {
    O: '#9bb0ff', B: '#aabfff', A: '#cad7ff',
    F: '#f8f7ff', G: '#fff4e8', K: '#ffd2a1', M: '#ffcc6f',
  }
  return (sp && sp in MAP) ? MAP[sp] ?? '#ffffff' : '#ffffff'
}

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
export function renderSkyMap(
  canvas: HTMLCanvasElement,
  objects: CelestialObject[],
  opts: SkyMapRenderOptions = {},
): void {
  const {
    projection           = 'stereographic',
    center               = { ra: 0, dec: 0 },
    scale                = 300,
    showGrid             = true,
    showLabels           = true,
    showMagnitudeLimit   = 8,
    background           = '#000008',
    gridColor            = 'rgba(255,255,255,0.12)',
    labelColor           = 'rgba(255,255,255,0.7)',
  } = opts

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context not available')

  const W = canvas.width
  const H = canvas.height
  const cx = W / 2
  const cy = H / 2

  // Unified project function — normalises all projections to absolute canvas coords
  const project = (coord: EquatorialCoord): ProjectedPoint => {
    if (projection === 'mollweide') {
      return mollweide(coord, { width: W, height: H })
    }
    const pt = projection === 'gnomonic'
      ? gnomonic(coord, center, scale)
      : stereographic(coord, center, scale)
    return { x: cx + pt.x, y: cy - pt.y, visible: pt.visible }
  }

  // Background
  ctx.fillStyle = background
  ctx.fillRect(0, 0, W, H)

  // RA/Dec grid
  if (showGrid) {
    ctx.strokeStyle = gridColor
    ctx.lineWidth   = 0.5

    // Declination circles every 30°
    for (let dec = -90; dec <= 90; dec += 30) {
      ctx.beginPath()
      let started = false
      for (let ra = 0; ra <= 360; ra += 4) {
        const p = project({ ra, dec })
        if (!p.visible || p.x < -W || p.x > 2 * W) { started = false; continue }
        if (!started) { ctx.moveTo(p.x, p.y); started = true }
        else ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }

    // RA meridians every 30°
    for (let ra = 0; ra < 360; ra += 30) {
      ctx.beginPath()
      let started = false
      for (let dec = -90; dec <= 90; dec += 4) {
        const p = project({ ra, dec })
        if (!p.visible || p.y < -H || p.y > 2 * H) { started = false; continue }
        if (!started) { ctx.moveTo(p.x, p.y); started = true }
        else ctx.lineTo(p.x, p.y)
      }
      ctx.stroke()
    }
  }

  // Constellation lines
  if (opts.showConstellationLines && opts.constellations) {
    ctx.strokeStyle = opts.constellationLineColor ?? 'rgba(100,149,237,0.35)'
    ctx.lineWidth   = 0.8

    for (const con of opts.constellations) {
      for (const seg of con.stickFigure) {
        const p1 = project({ ra: seg[0]!, dec: seg[1]! })
        const p2 = project({ ra: seg[2]!, dec: seg[3]! })
        if (!p1.visible || !p2.visible) continue
        if (p1.x < -50 || p1.x > W + 50 || p2.x < -50 || p2.x > W + 50) continue

        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      }
    }
  }

  // Constellation labels
  if (opts.showConstellationLabels && opts.constellations) {
    ctx.fillStyle = opts.constellationLabelColor ?? 'rgba(100,149,237,0.5)'
    ctx.font      = '11px sans-serif'
    ctx.textAlign = 'center'

    for (const con of opts.constellations) {
      const p = project({ ra: con.ra, dec: con.dec })
      if (!p.visible) continue
      if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) continue
      ctx.fillText(con.name, p.x, p.y)
    }

    ctx.textAlign = 'left' // reset
  }

  // Objects
  for (const obj of objects) {
    if (obj.ra === null || obj.dec === null) continue
    if (obj.magnitude !== null && obj.magnitude > showMagnitudeLimit) continue

    const p = project({ ra: obj.ra, dec: obj.dec })
    if (!p.visible) continue
    if (p.x < -50 || p.x > W + 50 || p.y < -50 || p.y > H + 50) continue

    const mag  = obj.magnitude ?? 5
    const size = Math.max(1.5, Math.min(10, (6 - mag) * 0.9 + 1.5))
    const color = spectralColor(obj)

    ctx.save()

    if (obj.type === 'galaxy') {
      ctx.strokeStyle = color
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.ellipse(p.x, p.y, size * 2.5, size * 1.2, 0.4, 0, Math.PI * 2)
      ctx.stroke()
    } else if (obj.type === 'nebula') {
      ctx.fillStyle   = color + '33'
      ctx.strokeStyle = color
      ctx.lineWidth   = 0.8
      ctx.beginPath()
      ctx.rect(p.x - size, p.y - size, size * 2, size * 2)
      ctx.fill()
      ctx.stroke()
    } else if (obj.type === 'cluster') {
      ctx.strokeStyle = color
      ctx.lineWidth   = 1
      ctx.beginPath()
      ctx.arc(p.x, p.y, size * 1.8, 0, Math.PI * 2)
      ctx.stroke()
      if (obj.subtype === 'globular') {
        ctx.beginPath()
        ctx.moveTo(p.x - size * 1.8, p.y); ctx.lineTo(p.x + size * 1.8, p.y)
        ctx.moveTo(p.x, p.y - size * 1.8); ctx.lineTo(p.x, p.y + size * 1.8)
        ctx.stroke()
      }
    } else {
      // Star glow
      const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2.5)
      grd.addColorStop(0,   color)
      grd.addColorStop(0.3, color + 'cc')
      grd.addColorStop(1,   color + '00')
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2)
      ctx.fill()
    }

    if (showLabels && mag < 3.5) {
      ctx.fillStyle = labelColor
      ctx.font      = `${Math.max(10, 13 - mag)}px sans-serif`
      ctx.fillText(obj.name, p.x + size + 4, p.y - size)
    }

    ctx.restore()
  }
}

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
export const SkyMap = { stereographic, mollweide, gnomonic, render: renderSkyMap }
