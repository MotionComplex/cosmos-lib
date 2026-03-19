import { CONSTANTS } from './constants.js'
import type {
  EquatorialCoord,
  ProjectedObject,
  ProjectionName,
} from './types.js'

const D = CONSTANTS.DEG_TO_RAD
const R = 1 / D // radians → degrees

// ── Inverse projections ──────────────────────────────────────────────────────

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
export function stereographicInverse(
  px: number,
  py: number,
  center: EquatorialCoord,
  scale: number,
): EquatorialCoord | null {
  const xn = px / scale
  const yn = py / scale
  const rho = Math.sqrt(xn * xn + yn * yn)

  if (rho === 0) return { ra: center.ra, dec: center.dec }

  const c = 2 * Math.atan(rho / 2)
  const sinC = Math.sin(c)
  const cosC = Math.cos(c)

  const dec1 = center.dec * D
  const ra1 = center.ra * D

  const dec = Math.asin(cosC * Math.sin(dec1) + (yn * sinC * Math.cos(dec1)) / rho) * R
  const ra =
    (ra1 +
      Math.atan2(
        xn * sinC,
        rho * Math.cos(dec1) * cosC - yn * Math.sin(dec1) * sinC,
      )) *
    R

  if (!isFinite(ra) || !isFinite(dec)) return null
  return { ra: ((ra % 360) + 360) % 360, dec }
}

/**
 * Inverse gnomonic (tangent-plane) projection.
 *
 * @param px     - Horizontal pixel offset from canvas centre.
 * @param py     - Vertical pixel offset from canvas centre (positive = up).
 * @param center - Projection tangent point in equatorial coordinates.
 * @param scale  - Pixel scale factor.
 * @returns The equatorial coordinate, or `null` if the result is invalid.
 */
export function gnomonicInverse(
  px: number,
  py: number,
  center: EquatorialCoord,
  scale: number,
): EquatorialCoord | null {
  const xn = px / scale
  const yn = py / scale
  const rho = Math.sqrt(xn * xn + yn * yn)

  const dec1 = center.dec * D
  const ra1 = center.ra * D

  const c = Math.atan(rho)
  const sinC = Math.sin(c)
  const cosC = Math.cos(c)

  let dec: number
  let ra: number

  if (rho === 0) {
    dec = center.dec
    ra = center.ra
  } else {
    dec = Math.asin(cosC * Math.sin(dec1) + (yn * sinC * Math.cos(dec1)) / rho) * R
    ra =
      (ra1 +
        Math.atan2(
          xn * sinC,
          rho * Math.cos(dec1) * cosC - yn * Math.sin(dec1) * sinC,
        )) *
      R
  }

  if (!isFinite(ra) || !isFinite(dec)) return null
  return { ra: ((ra % 360) + 360) % 360, dec }
}

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
export function mollweideInverse(
  canvasX: number,
  canvasY: number,
  width: number,
  height: number,
): EquatorialCoord | null {
  // Normalise to projection space (matching forward projection formulas)
  const yNorm = -(canvasY - height / 2) / (height / 2)   // −1 to +1
  const sinTheta = yNorm / Math.SQRT2

  // Outside the ellipse boundary
  if (Math.abs(sinTheta) > 1) return null
  const theta = Math.asin(sinTheta)

  const xNorm = (canvasX - width / 2) / (width / (2 * Math.PI))
  const cosTheta = Math.cos(theta)
  if (Math.abs(cosTheta) < 1e-12) {
    // At the poles the x equation degenerates
    return { ra: 180, dec: sinTheta > 0 ? 90 : -90 }
  }

  const lambda = xNorm / ((2 * Math.SQRT2 / Math.PI) * cosTheta) // radians

  // Check ellipse boundary on x axis
  if (Math.abs(lambda) > Math.PI) return null

  const sinPhi = (2 * theta + Math.sin(2 * theta)) / Math.PI
  if (Math.abs(sinPhi) > 1) return null

  const phi = Math.asin(sinPhi) // latitude in radians

  const ra = ((lambda * R + 180) % 360 + 360) % 360
  const dec = phi * R

  if (!isFinite(ra) || !isFinite(dec)) return null
  return { ra, dec }
}

// ── Dispatcher ───────────────────────────────────────────────────────────────

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
export function canvasToEquatorial(
  canvasX: number,
  canvasY: number,
  width: number,
  height: number,
  projection: ProjectionName,
  center: EquatorialCoord,
  scale: number,
): EquatorialCoord | null {
  if (projection === 'mollweide') {
    return mollweideInverse(canvasX, canvasY, width, height)
  }

  // For stereographic & gnomonic the forward projection returns offsets from
  // canvas centre with y‑up, and renderSkyMap converts via:
  //   screenX = cx + pt.x     → pt.x = screenX − cx
  //   screenY = cy − pt.y     → pt.y = cy − screenY
  const cx = width / 2
  const cy = height / 2
  const px = canvasX - cx
  const py = cy - canvasY

  if (projection === 'gnomonic') {
    return gnomonicInverse(px, py, center, scale)
  }
  return stereographicInverse(px, py, center, scale)
}

// ── Hit testing ──────────────────────────────────────────────────────────────

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
export function hitTest(
  cache: readonly ProjectedObject[],
  canvasX: number,
  canvasY: number,
  hitRadius: number,
): ProjectedObject | null {
  let best: ProjectedObject | null = null
  let bestDist = Infinity

  for (const po of cache) {
    const dx = po.x - canvasX
    const dy = po.y - canvasY
    const d2 = dx * dx + dy * dy
    // Use the larger of the hitRadius and the object's own visual radius
    const threshold = Math.max(hitRadius, po.radius)
    if (d2 < threshold * threshold && d2 < bestDist) {
      bestDist = d2
      best = po
    }
  }
  return best
}
