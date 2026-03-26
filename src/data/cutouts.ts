/**
 * Runtime coordinate-based image cutout functions.
 *
 * These query HiPS2FITS (CDS), Pan-STARRS DR2, and DSS by exact RA/Dec
 * coordinates, guaranteeing the returned image is the correct object.
 * The precomputed file list in {@link PS1_FILES} eliminates the first of
 * Pan-STARRS' two-step request flow, cutting latency roughly in half.
 *
 * @module
 */

import { PS1_FILES } from './ps1-files.js'

// ── Types ────────────────────────────────────────────────────────────────────

/** Result from a coordinate-based cutout request. */
export interface CutoutResult {
  /** Direct image URL. */
  url: string
  /** Image format. */
  format: 'jpg' | 'gif'
  /** Attribution string. */
  credit: string
  /** Source identifier. */
  source: 'panstarrs' | 'hips' | 'dss'
}

/** Options controlling cutout generation. */
export interface CutoutOptions {
  /** Desired output width in pixels. @defaultValue `1024` */
  outputSize?: number
  /** FOV multiplier around object angular size. @defaultValue `1.6` */
  padding?: number
  /** Minimum FOV floor in arcminutes. @defaultValue `4` */
  minFov?: number
  /** Maximum FOV ceiling in arcminutes. @defaultValue `120` */
  maxFov?: number
  /** Timeout in milliseconds for each API call. @defaultValue `15000` */
  timeout?: number
}

// ── FOV computation ──────────────────────────────────────────────────────────

/** Default FOV by object type when size_arcmin is unknown. */
const TYPE_DEFAULT_FOV: Record<string, number> = {
  star: 15,
  planet: 10,
  nebula: 20,
  galaxy: 12,
  cluster: 20,
  'black-hole': 8,
}

/**
 * Compute the field-of-view in arcminutes for a given object.
 *
 * Uses the object's angular size with padding when known, or a
 * type-based default. Clamped to `[minFov, maxFov]`.
 *
 * @param sizeArcmin - Angular diameter in arcminutes, or `undefined`.
 * @param objectType - Object type string (e.g. `'nebula'`, `'star'`).
 * @param opts       - Padding and clamping overrides.
 */
export function computeFov(
  sizeArcmin: number | undefined,
  objectType: string,
  opts: Pick<CutoutOptions, 'padding' | 'minFov' | 'maxFov'> = {},
): number {
  const { padding = 1.6, minFov = 4, maxFov = 120 } = opts
  const rawFov = sizeArcmin != null
    ? sizeArcmin * padding
    : (TYPE_DEFAULT_FOV[objectType] ?? 15)
  return Math.max(minFov, Math.min(maxFov, rawFov))
}

// ── HiPS2FITS (CDS/Strasbourg) ───────────────────────────────────────────────

const HIPS2FITS_BASE =
  'https://alasky.cds.unistra.fr/hips-image-services/hips2fits'

/** Pixel stretch functions supported by the hips2fits service. */
export type HiPSStretch = 'linear' | 'sqrt' | 'log' | 'asinh' | 'power'

/** Options specific to HiPS2FITS cutout requests. */
export interface HiPSOptions extends CutoutOptions {
  /** HiPS survey identifier. @defaultValue `'CDS/P/DSS2/color'` */
  hips?: string
  /** Pixel stretch function. @defaultValue `'linear'` */
  stretch?: HiPSStretch
  /** Colormap name (matplotlib). @defaultValue `'Greys_r'` */
  cmap?: string
}

/**
 * Build a hips2fits URL for the given sky coordinates.
 *
 * Useful when you need the raw URL without a HEAD-check — e.g. for
 * Three.js textures, custom projections, or batch prefetching.
 *
 * @param ra        - Right Ascension in degrees (J2000).
 * @param dec       - Declination in degrees (J2000).
 * @param fovDeg    - Field of view in **degrees**.
 * @param width     - Output width in pixels.
 * @param height    - Output height in pixels.
 * @param opts      - Survey, stretch, and colormap overrides.
 */
export function buildHips2fitsUrl(
  ra: number,
  dec: number,
  fovDeg: number,
  width: number,
  height: number,
  opts: Pick<HiPSOptions, 'hips' | 'stretch' | 'cmap'> = {},
): string {
  const {
    hips = 'CDS/P/DSS2/color',
    stretch = 'linear',
    cmap = 'Greys_r',
  } = opts

  const qs = new URLSearchParams({
    hips,
    ra: ra.toFixed(6),
    dec: dec.toFixed(6),
    fov: fovDeg.toFixed(6),
    projection: 'SIN',
    width: String(width),
    height: String(height),
    format: 'jpg',
    stretch,
    cmap,
  })

  return `${HIPS2FITS_BASE}?${qs}`
}

/**
 * Fetch a HiPS2FITS cutout via CDS for the given sky coordinates.
 *
 * Full-sky coverage through any HiPS survey. Defaults to `CDS/P/DSS2/color`
 * which provides colour imagery for the entire sky — making it a strict
 * upgrade over the grayscale DSS fallback for most objects.
 *
 * @param ra         - Right Ascension in degrees (J2000).
 * @param dec        - Declination in degrees (J2000).
 * @param fovArcmin  - Desired field of view in arcminutes.
 * @param opts       - Output size, survey, stretch, and timeout options.
 */
export async function tryHiPS(
  ra: number,
  dec: number,
  fovArcmin: number,
  opts: HiPSOptions = {},
): Promise<CutoutResult | null> {
  const { outputSize = 1024, timeout = 15000 } = opts
  const fovDeg = fovArcmin / 60

  const url = buildHips2fitsUrl(ra, dec, fovDeg, outputSize, outputSize, opts)

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(timeout),
    })
    if (!res.ok) return null

    const hips = opts.hips ?? 'CDS/P/DSS2/color'
    return {
      url,
      format: 'jpg',
      credit: `CDS hips2fits · ${hips}`,
      source: 'hips',
    }
  } catch {
    return null
  }
}

// ── Pan-STARRS DR2 ──────────────────────────────────────────────────────────

const PS1_ARCSEC_PER_PX = 0.25

/**
 * Build a Pan-STARRS DR2 color cutout URL using the precomputed file list.
 *
 * Returns `null` if dec < -30 (below coverage), no precomputed file list
 * exists for this object, or the HEAD check fails.
 *
 * @param id         - Object identifier for the precomputed lookup.
 * @param ra         - Right Ascension in degrees (J2000).
 * @param dec        - Declination in degrees (J2000).
 * @param fovArcmin  - Desired field of view in arcminutes.
 * @param opts       - Output size and timeout options.
 */
export async function tryPanSTARRS(
  id: string,
  ra: number,
  dec: number,
  fovArcmin: number,
  opts: CutoutOptions = {},
): Promise<CutoutResult | null> {
  if (dec < -30) return null

  const files = PS1_FILES[id]
  if (!files) return null

  const { outputSize = 1024, timeout = 15000 } = opts
  const nativePx = Math.round((fovArcmin * 60) / PS1_ARCSEC_PER_PX)
  const cutoutPx = Math.max(outputSize, Math.min(nativePx, 10000))

  // Build color composite: i=red, r=green, g=blue (natural-color-ish)
  const red   = files['i'] ?? files['r'] ?? files['g']
  const green = files['r'] ?? files['g'] ?? files['i']
  const blue  = files['g'] ?? files['r'] ?? files['i']
  if (!red && !green && !blue) return null

  const url = new URL('https://ps1images.stsci.edu/cgi-bin/fitscut.cgi')
  if (red)   url.searchParams.set('red',   red)
  if (green) url.searchParams.set('green', green)
  if (blue)  url.searchParams.set('blue',  blue)
  url.searchParams.set('size',        String(cutoutPx))
  url.searchParams.set('output_size', String(Math.min(outputSize, cutoutPx)))
  url.searchParams.set('format',      'jpg')
  url.searchParams.set('autoscale',   '99.5')

  try {
    const res = await fetch(url.toString(), {
      method: 'HEAD',
      signal: AbortSignal.timeout(timeout),
    })
    if (!res.ok) return null

    // PS1 returns a tiny placeholder on error
    const cl = res.headers.get('content-length')
    if (cl && parseInt(cl) < 8000) return null

    return {
      url: url.toString(),
      format: 'jpg',
      credit: 'Pan-STARRS/STScI',
      source: 'panstarrs',
    }
  } catch {
    return null
  }
}

// ── DSS (Digitized Sky Survey) ───────────────────────────────────────────────

/**
 * Build a DSS cutout URL via MAST and verify it exists.
 *
 * Full-sky grayscale coverage. Uses POSS2/UKSTU Red for dec > -40,
 * DSS1 Red for the extreme south.
 *
 * @param ra         - Right Ascension in degrees (J2000).
 * @param dec        - Declination in degrees (J2000).
 * @param fovArcmin  - Desired field of view in arcminutes.
 * @param opts       - Timeout options.
 */
export async function tryDSS(
  ra: number,
  dec: number,
  fovArcmin: number,
  opts: CutoutOptions = {},
): Promise<CutoutResult | null> {
  const { timeout = 15000 } = opts
  const survey = dec > -40 ? 'poss2ukstu_red' : 'poss1_red'

  const url = new URL('https://archive.stsci.edu/cgi-bin/dss_search')
  url.searchParams.set('r', ra.toFixed(6))
  url.searchParams.set('d', dec.toFixed(6))
  url.searchParams.set('e', 'J2000')
  url.searchParams.set('w', fovArcmin.toFixed(2))
  url.searchParams.set('h', fovArcmin.toFixed(2))
  url.searchParams.set('f', 'gif')
  url.searchParams.set('v', survey)
  url.searchParams.set('s', 'on')
  url.searchParams.set('compress', 'none')

  try {
    const res = await fetch(url.toString(), {
      method: 'HEAD',
      signal: AbortSignal.timeout(timeout),
    })
    if (!res.ok) return null

    const cl = res.headers.get('content-length')
    if (cl && parseInt(cl) < 2000) return null

    return {
      url: url.toString(),
      format: 'gif',
      credit: 'DSS/STScI',
      source: 'dss',
    }
  } catch {
    return null
  }
}
